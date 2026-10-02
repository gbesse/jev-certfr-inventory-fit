// Objectif : décrire le contrat minimal d’un fournisseur Jev.
export type JevRequest = { state: unknown; questions: Record<string, unknown>; signal?: AbortSignal };
export type JevProvider = { decide(request: JevRequest): Promise<any> };
export function createJevClient(options?: Record<string, unknown>): JevProvider;
export function createFakeProvider(responder: (request: any, calls: number) => any): JevProvider & { readonly calls: number };
