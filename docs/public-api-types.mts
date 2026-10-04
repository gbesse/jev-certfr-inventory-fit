// Objectif : vérifier les types publiés depuis un projet consommateur.
import { inventoryCase, assessInventoryExposure, DECISIONS } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = inventoryCase({
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
});
void DECISIONS;
void assessInventoryExposure(dossier, createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "likely_affected", probabilities: { "likely_affected": 0.82, "review_required": 0.06, "unlikely_affected": 0.06, "no_asset": 0.06 }, confidence: 0.82 } } })));

// Ces erreurs attendues protègent le contrat des consommateurs TypeScript.
// @ts-expect-error — un fournisseur doit retourner une réponse Jev complète.
createFakeProvider(() => ({}));
const result = await assessInventoryExposure(dossier, createFakeProvider(() => ({ model: "jev-1.13.0", answers: {} })));
const review: boolean = result.review;
void review;
// @ts-expect-error — la revue humaine est un booléen.
const incorrect: string = result.review;
void incorrect;
