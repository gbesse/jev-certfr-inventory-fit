# Jev CERT-FR Inventory Fit

**Rapproche un inventaire logiciel des avis CERT-FR et rend les correspondances incertaines révisables.**

[![Tests](https://github.com/gbesse/jev-certfr-inventory-fit/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/jev-certfr-inventory-fit/actions/workflows/test.yml) [MIT](LICENSE) · Node.js 22+ · v0.1.0 · Documentation française

Jev CERT-FR Inventory Fit transforme un dossier sourcé en une catégorie explicite et révisable. Le dépôt sépare les règles vérifiables en code de la comparaison sémantique confiée à Jev.

## Démarrage rapide

```sh
git clone https://github.com/gbesse/jev-certfr-inventory-fit.git
cd jev-certfr-inventory-fit
npm install
npm run demo
```

Les trois démonstrations utilisent uniquement des données et probabilités synthétiques. Elles n’effectuent aucun appel réseau et ne mesurent pas la qualité réelle de Jev.

## Exemple exécutable

Le scénario principal aboutit à **`probablement_concerne`**. Une assertion fait échouer la commande si le contrat change. Le code complet se trouve dans [`examples/demo.mjs`](examples/demo.mjs).

```sh
npm run demo:principal
```

### Cas limite déterministe

[`examples/cas-limite.mjs`](examples/cas-limite.mjs) exerce une règle métier avant tout appel sémantique.

```sh
npm run demo:limite
```

Résultat attendu : **`aucun_actif_fourni`**, avec zéro appel Jev.

### Décision incertaine à revoir

[`examples/revue-humaine.mjs`](examples/revue-humaine.mjs) simule un dossier incomplet. Une confiance de `0.62` doit produire `review: true` afin que l’incertitude reste visible.

```sh
npm run demo:revue
```

Résultat attendu : **`revue_requise`**, avec `revue humaine : true`. `npm run demo` exécute les trois scénarios.

## Utilisation de la bibliothèque

Importez `assessInventoryExposure` depuis `@gbesse/jev-certfr-inventory-fit`. Fournissez `createJevClient()` depuis l’export `./jev`, ou `createFakeProvider()` pour les tests hors ligne.

## Frontière de décision

Rapproche un inventaire logiciel des avis CERT-FR et rend les correspondances incertaines révisables. La sortie sert à ordonner ou préparer une revue humaine. Elle ne constitue ni une décision administrative, ni un avis juridique, médical ou financier, ni une garantie d’éligibilité ou de conformité.

Les comparaisons exactes de versions et les plages affectées restent calculées par le code. La question et les critères envoyés à Jev sont versionnés dans [`src/index.mjs`](src/index.mjs).

## Source publique

- [Avis de sécurité CERT-FR](https://www.cert.ssi.gouv.fr/avis/)

Conservez l’identifiant amont, l’URL, la date de récupération, le millésime et la licence de chaque donnée. Vérifiez le schéma et les conditions de réutilisation auprès du producteur avant ingestion.

## Appels Jev réels

Les appels réels sont facultatifs et payants. Le client valide le modèle et les probabilités, refuse les redirections, limite les nouvelles tentatives aux erreurs réseau et HTTP 429/529, puis bloque une requête dépassant une estimation prudente de 24 000 jetons.

```sh
TYPESAFE_API_KEY=... node scripts/live-smoke.mjs
```

N’envoyez jamais de secret, de donnée personnelle ni de dossier sensible non expurgé. Calibrez les seuils sur un corpus français annoté avant tout usage opérationnel.

## Parcours comparatif

`npm run demo:parcours` produit un rapport JSON partageable pour **jev-certfr-inventory-fit**. Chaque scénario garde sa sortie propre et échoue si son assertion ne passe plus. Les données et probabilités sont synthétiques ; aucun appel Jev n’est effectué.

## Validation

```sh
npm run check
npm run typecheck
npm test
npm run demo
npm run demo:parcours
```

La CI exécute les vérifications principales sous Node.js 22 et 24.

Projet indépendant, sans affiliation avec TypeSafe AI, data.gouv.fr ni l’administration française. Consultez la [documentation de l’API Jev](https://docs.typesafe.ai/api) et les [limites du modèle](https://docs.typesafe.ai/model-jaggedness/jev-1.13).
