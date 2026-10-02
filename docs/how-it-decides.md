# Comment la décision est prise

Rapproche un inventaire logiciel des avis CERT-FR et rend les correspondances incertaines révisables.

Le code normalise la source et applique d’abord le cas déterministe documenté dans `src/index.mjs`. Pour les autres dossiers, Jev choisit la catégorie la plus prudente selon la correspondance entre les produits, éditions et versions décrits dans l’inventaire et ceux visés par l’avis. Une confiance inférieure à `0.8` marque le résultat pour revue humaine.

Les comparaisons exactes de versions et les plages affectées restent calculées par le code.

Les démonstrations ne contiennent que des probabilités synthétiques. Constituez un corpus français annoté, mesurez les erreurs par catégorie et fixez vos propres seuils avant un usage opérationnel.
