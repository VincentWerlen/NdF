# Notes de frais

Appli web pour téléphone, installable et utilisable hors ligne :

- photo des tickets, lus par l'API Claude (clé personnelle saisie dans l'appli) ou, hors ligne, par une reconnaissance de texte locale (Tesseract) ;
- projet par défaut et missions temporaires datées ;
- export Excel au format du modèle de note de frais, photos des justificatifs dans un onglet ;
- envoi par le partage du téléphone (Excel + zip des justificatifs) ;
- sauvegarde / restauration complète.

Les données (lignes, photos, clé API) restent dans le navigateur du téléphone. Aucun serveur.

## Mise à jour

Après toute modification, incrémenter `VERSION` dans `sw.js` (et `APP_VERSION` dans `index.html`) pour que les téléphones prennent la nouvelle version.

## Bibliothèques embarquées

- JSZip 3.10.1 (MIT)
- Tesseract.js 5.1.1 et tesseract.js-core 5.1.1 (Apache 2.0), données `fra` 4.0.0_best_int
- Anthropic TypeScript SDK 1.5.0 (MIT), empaqueté avec esbuild
