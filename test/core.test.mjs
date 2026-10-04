// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { inventoryCase, assessInventoryExposure, DECISIONS } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-10-01"
  },
  "assets": []
};
const casPrincipal = {
  "id": "exemple-1",
  "text": "Un serveur exposé déclare « Produit Exemple Server 4.2 ». L’avis synthétique vise Produit Exemple Server, éditions 4.0 à 4.3.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-10-01"
  },
  "details": {
    "territoire": "France — cas synthétique",
    "origine": "donnée synthétique"
  }
};
const casÀRevoir = {
  "id": "revue-1",
  "text": "L’inventaire mentionne seulement « suite bureautique historique », sans éditeur ni version ; plusieurs produits pourraient correspondre.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-10-01"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => inventoryCase({ id: "x", text: "y" }), /source/));
test("refuse une date de source invalide", () => assert.throws(() => inventoryCase({ id: "x", text: "y", source: { url: "https://example.test", date: "impossible" } }), /date ISO/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await assessInventoryExposure(casLimite, provider)).decision, "no_asset");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({
  "model": "jev-1.13.0",
  "answers": {
    "decision": {
      "type": "choice",
      "choice": "likely_affected",
      "probabilities": {
        "likely_affected": 0.82,
        "review_required": 0.06,
        "unlikely_affected": 0.06,
        "no_asset": 0.06
      },
      "confidence": 0.82
    }
  },
  "usage": {
    "input_tokens": 120,
    "output_tokens": 0
  }
}));
  const résultat = await assessInventoryExposure(casPrincipal, provider);
  assert.equal(résultat.decision, "likely_affected");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({
  "model": "jev-1.13.0",
  "answers": {
    "decision": {
      "type": "choice",
      "choice": "review_required",
      "probabilities": {
        "likely_affected": 0.1267,
        "review_required": 0.62,
        "unlikely_affected": 0.1267,
        "no_asset": 0.1267
      },
      "confidence": 0.62
    }
  },
  "usage": {
    "input_tokens": 140,
    "output_tokens": 0
  }
}));
  const résultat = await assessInventoryExposure(casÀRevoir, provider);
  assert.equal(résultat.decision, "review_required");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
});

test("refuse les champs vides ou de mauvais type", () => {
  for (const field of ["id", "text"]) {
    for (const value of ["  ", 42, {}]) assert.throws(() => inventoryCase({ ...casPrincipal, [field]: value }), TypeError);
  }
});
test("refuse les sources non HTTP et les dates impossibles", () => {
  for (const url of ["invalide", "file:///tmp/doc", "https://user:password@example.test/doc"]) assert.throws(() => inventoryCase({ ...casPrincipal, source: { ...casPrincipal.source, url } }), /URL/);
  assert.throws(() => inventoryCase({ ...casPrincipal, source: { ...casPrincipal.source, date: "2026-02-30" } }), /date ISO/);
});
test("conserve les métadonnées de provenance", () => {
  const record = inventoryCase({ ...casPrincipal, source: { ...casPrincipal.source, licence: "Licence Ouverte", millésime: "2026" } });
  assert.equal(record.source.licence, "Licence Ouverte");
  assert.equal(record.source.millésime, "2026");
});
test("refuse une collection mal formée avant tout appel", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  await assert.rejects(assessInventoryExposure({ ...casPrincipal, assets: {} }, provider), /tableau/);
  assert.equal(provider.calls, 0);
});
test("une revue demandée reste obligatoire même avec une forte confiance", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "review_required", probabilities: Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, key === "review_required" ? 0.94 : 0.02])), confidence: 0.94 } } }));
  assert.equal((await assessInventoryExposure(casÀRevoir, provider)).review, true);
});
test("le seuil de confiance est inclusif à 0.8", async () => {
  for (const confidence of [0.799, 0.8]) {
    const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "likely_affected", probabilities: Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, key === "likely_affected" ? 0.82 : 0.06])), confidence } } }));
    assert.equal((await assessInventoryExposure(casPrincipal, provider)).review, confidence < 0.8);
  }
});
test("valide aussi les réponses d’un fournisseur personnalisé", async () => {
  const provider = { decide: async () => ({ model: "personnalise", answers: { decision: { type: "choice", choice: "toString", confidence: 0.99, probabilities: {} } } }) };
  await assert.rejects(assessInventoryExposure(casPrincipal, provider), /Choix Jev invalide/);
});

test("une absence de données choisie par Jev exige une revue", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "no_asset", probabilities: Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, key === "no_asset" ? 0.94 : 0.02])), confidence: 0.94 } } }));
  const résultat = await assessInventoryExposure(casPrincipal, provider);
  assert.equal(résultat.review, true);
  assert.equal(résultat.deterministic, false);
});

test("accepte une date historique et un horodatage avec décalage", () => {
  for (const date of ["1899-12-31", "0099-01-01", "2026-10-04T23:30:00-02:00"]) {
    assert.equal(inventoryCase({ ...casPrincipal, source: { ...casPrincipal.source, date } }).source.date, new Date(date).toISOString());
  }
});
