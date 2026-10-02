#!/usr/bin/env node
// Objectif : exposer la normalisation du dossier en ligne de commande.
import { runCli } from "../src/index.mjs";
runCli(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
