# Rhétoritron vs Plaidoritron

Générateur d'éloquence : choisissez un nombre de citations (1 à 10) et un thème, « Politique » ou « Droit ».
Les citations ne viennent plus d'une base de données statique : elles sont écrites à la volée par une IA
(via [OpenRouter](https://openrouter.ai) et [TanStack AI](https://tanstack.com/ai)) depuis une fonction serveur
[TanStack Start](https://tanstack.com/start).

## Lancer le projet

```bash
npm install
cp .env.example .env   # puis renseignez OPENROUTER_API_KEY
npm run dev            # http://localhost:3000
```

- `npm run build` : build de production
- `npm run start` : sert le build de production
- `npm run typecheck` : vérification TypeScript

## Organisation

- `src/routes/index.tsx` : la page (formulaire et affichage des citations)
- `src/server/citations.ts` : la fonction serveur `genererCitations`, qui appelle un modèle via OpenRouter (`anthropic/claude-sonnet-5.5` par défaut, modifiable dans ce fichier) avec une sortie structurée
  (intro, cause, raison, solution) validée par Zod. La clé API et les consignes restent côté serveur.
- `src/themes.ts` : thèmes et types partagés entre le client et le serveur
