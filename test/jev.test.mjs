// Objectif : vérifier les limites de transport et la validation stricte des réponses.
import test from "node:test";
import assert from "node:assert/strict";
import { createJevClient } from "../src/jev.mjs";
const request = { state: { text: "synthétique" }, questions: { decision: { type: "choice", instructions: "Choisissez.", criteria: { oui: "Oui", non: "Non" } } } };
function answer(model = "jev-1.13.0") { return { model, answers: { decision: { type: "choice", choice: "oui", probabilities: { oui: 0.9, non: 0.1 }, confidence: 0.9 } }, usage: { input_tokens: 10, output_tokens: 0 } }; }
test("refuse un modèle retourné différent", async () => { const client = createJevClient({ apiKey: "test", endpoint: "http://127.0.0.1/jev", fetchImpl: async () => new Response(JSON.stringify(answer("autre"))) }); await assert.rejects(client.decide(request), /modèle inattendu/); });
test("ne retente pas une erreur ordinaire", async () => { let calls = 0; const client = createJevClient({ apiKey: "test", endpoint: "http://localhost/jev", fetchImpl: async () => { calls += 1; return new Response("", { status: 500 }); } }); await assert.rejects(client.decide(request), /HTTP 500/); assert.equal(calls, 1); });
test("retente une surcharge documentée", async () => { let calls = 0; const client = createJevClient({ apiKey: "test", endpoint: "http://localhost/jev", fetchImpl: async () => { calls += 1; return calls === 1 ? new Response("", { status: 529 }) : new Response(JSON.stringify(answer())); } }); assert.equal((await client.decide(request)).answers.decision.choice, "oui"); assert.equal(calls, 2); });

test("refuse un choix hérité du prototype", async () => {
  const malformed = answer(); malformed.answers.decision.choice = "toString";
  const client = createJevClient({ apiKey: "test", fetchImpl: async () => new Response(JSON.stringify(malformed)) });
  await assert.rejects(client.decide(request), /Choix Jev invalide/);
});
test("refuse une probabilité absente ou hors intervalle", async () => {
  for (const value of [null, -0.1, 1.1]) {
    const malformed = answer(); malformed.answers.decision.probabilities.non = value;
    const client = createJevClient({ apiKey: "test", fetchImpl: async () => new Response(JSON.stringify(malformed)) });
    await assert.rejects(client.decide(request), /Probabilité Jev invalide/);
  }
});
test("un signal déjà annulé évite tout appel réseau", async () => {
  let calls = 0;
  const client = createJevClient({ apiKey: "test", fetchImpl: async () => { calls += 1; return new Response(JSON.stringify(answer())); } });
  await assert.rejects(client.decide({ ...request, signal: AbortSignal.abort() }), { name: "AbortError" });
  assert.equal(calls, 0);
});
test("refuse un protocole local autre que HTTP", () => {
  assert.throws(() => createJevClient({ apiKey: "test", endpoint: "ftp://localhost/jev" }), /HTTPS/);
});
