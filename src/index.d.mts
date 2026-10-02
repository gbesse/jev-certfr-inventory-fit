// Objectif : décrire les types de l’API métier publique.
import type { JevProvider } from "./jev.mjs";
export type SourceRecord = { id: string; text: string; source: { url: string; date: string }; [key: string]: unknown };
export const DECISIONS: Readonly<Record<string, string>>;
export function inventoryCase(input: any): SourceRecord;
export function assessInventoryExposure(input: any, provider: JevProvider): Promise<any>;
export function runCli(argv: string[], io?: { log(value: string): void }): Promise<void>;
