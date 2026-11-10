# Rhétoritron vs Plaidoritron

Générateur d'éloquence : choisissez un nombre de citations (1 à 10) et un thème, « Politique » ou « Droit ».
Les citations ne viennent plus d'une base de données statique : elles sont écrites à la volée par une IA
via [TanStack AI](https://tanstack.com/ai), depuis une fonction serveur [TanStack Start](https://tanstack.com/start).

## Choisir l'IA

Le bouton **⚙ Réglages** ouvre une fenêtre où chacun choisit :

- le fournisseur : OpenRouter (par défaut), OpenAI, Anthropic, Google Gemini, Mistral AI ou xAI Grok ;
- le modèle, dans une liste ou en saisissant son identifiant (« Autre modèle… ») ;
- sa propre clé API, gardée dans le `localStorage` du navigateur et envoyée au serveur à chaque génération.

Sans clé saisie, le serveur utilise celle de son fichier `.env`, si elle existe.

## Lancer le projet

```bash
npm install
cp .env.example .env   # facultatif : clés par défaut côté serveur
npm run dev            # http://localhost:3000
```

- `npm run build` : build de production
- `npm run start` : construit puis sert la version de production (http://localhost:4173)
- `npm run typecheck` : vérification TypeScript

## Déployer sur Vercel

Le plugin Nitro (`nitro/vite`) détecte Vercel au moment du build et génère `.vercel/output` : aucune config supplémentaire n'est nécessaire.

1. Importer le dépôt sur [vercel.com/new](https://vercel.com/new). Le framework et la commande `npm run build` sont détectés.
2. Dans *Settings → Environment Variables*, ajouter `OPENROUTER_API_KEY` (et, au besoin, les autres clés listées dans `.env.example`). Elles sont facultatives : sans elles, l'utilisateur saisit sa clé dans la fenêtre de réglages.
3. Chaque push crée un déploiement de prévisualisation ; la branche par défaut part en production.

En ligne de commande : `npx vercel` (prévisualisation) puis `npx vercel --prod`.

## Organisation

- `src/routes/index.tsx` : la page (formulaire et affichage des citations)
- `src/components/FenetreReglages.tsx` et `src/lib/reglages.ts` : la fenêtre de réglages et leur stockage local
- `src/providers.ts` : fournisseurs et modèles proposés
- `src/server/citations.ts` : la fonction serveur `genererCitations`, qui appelle le modèle choisi avec une sortie structurée
  (intro, cause, raison, solution) validée par Zod. Les consignes restent côté serveur.
- `src/themes.ts` : thèmes et types partagés entre le client et le serveur
