// Objectif : décrire le contrat minimal d’un fournisseur Jev.
export type ChoiceQuestion = { type: "choice"; instructions: string; criteria: Record<string, string> };
export type JevRequest = { state: unknown; questions: Record<string, ChoiceQuestion>; signal?: AbortSignal };
export type ChoiceAnswer = { type: "choice"; choice: string; probabilities: Record<string, number>; confidence: number };
export type JevUsage = { input_tokens: number; output_tokens: number; [key: string]: unknown };
export type JevResponse = { model: string; answers: Record<string, ChoiceAnswer>; usage?: JevUsage };
export type JevProvider = { decide(request: JevRequest): Promise<JevResponse> };
export type JevClientOptions = { apiKey?: string; endpoint?: string; model?: string; timeoutMs?: number; fetchImpl?: typeof fetch };
export function createJevClient(options?: JevClientOptions): JevProvider;
export function createFakeProvider(responder: (request: JevRequest, calls: number) => JevResponse | Promise<JevResponse>): JevProvider & { readonly calls: number };
export function validateChoiceResponse(response: unknown, questions: Record<string, ChoiceQuestion>, model?: string): JevResponse;
