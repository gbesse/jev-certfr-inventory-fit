// Objectif : vérifier qu’une règle explicite évite un appel Jev inutile.
import assert from "node:assert/strict";
import { assessInventoryExposure } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-10-01"
  },
  "assets": []
};
const provider = createFakeProvider(() => { throw new Error("Jev ne doit pas être appelé"); });
const résultat = await assessInventoryExposure(dossier, provider);
assert.equal(résultat.decision, "no_asset");
assert.equal(résultat.deterministic, true);
assert.equal(provider.calls, 0);
console.log(`Décision : ${résultat.label} · appels Jev : ${provider.calls}`);
