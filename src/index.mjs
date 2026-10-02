// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "likely_affected": "probablement_concerne",
  "review_required": "revue_requise",
  "unlikely_affected": "peu_probablement_concerne",
  "no_asset": "aucun_actif_fourni"
});
const CRITERIA = Object.freeze({
  "likely_affected": "probablement concerne",
  "review_required": "revue requise",
  "unlikely_affected": "peu probablement concerne",
  "no_asset": "aucun actif fourni"
});
export function inventoryCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function assessInventoryExposure(input, provider) {
  const record = inventoryCase(input);
  if (Array.isArray(record.assets) && record.assets.length === 0) return { decision: "no_asset", label: DECISIONS["no_asset"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce dossier à partir des seuls éléments sourcés. Évaluez la correspondance entre les produits, éditions et versions décrits dans l’inventaire et ceux visés par l’avis. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni règle applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-certfr-inventory-fit <dossier.json>");
  const dossier = inventoryCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à assessInventoryExposure avec un fournisseur Jev configuré." }, null, 2));
}
