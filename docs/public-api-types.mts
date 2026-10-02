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
void assessInventoryExposure(dossier, createFakeProvider(() => ({})));
