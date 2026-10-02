// Objectif : montrer une décision sémantique avec des données entièrement synthétiques.
import assert from "node:assert/strict";
import { assessInventoryExposure } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
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
const résultat = await assessInventoryExposure(dossier, provider);
assert.equal(résultat.decision, "likely_affected");
assert.equal(résultat.review, false);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · probabilité : ${résultat.probability}`);
