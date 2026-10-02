// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { assessInventoryExposure } from "../src/index.mjs";
const client = createJevClient();
const résultat = await assessInventoryExposure({
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
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
