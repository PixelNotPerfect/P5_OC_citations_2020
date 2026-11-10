import { createServerFn } from '@tanstack/react-start'
import { chat } from '@tanstack/ai'
import type { AnyTextAdapter } from '@tanstack/ai'
import { createOpenRouterText } from '@tanstack/ai-openrouter'
import { createOpenaiChat } from '@tanstack/ai-openai'
import { createAnthropicChat } from '@tanstack/ai-anthropic'
import { createGeminiChat } from '@tanstack/ai-gemini'
import { createMistralText } from '@tanstack/ai-mistral'
import { createGrokText } from '@tanstack/ai-grok'
import { z } from 'zod'
import { PROVIDERS, PROVIDER_IDS } from '../providers'
import type { ProviderId } from '../providers'
import type { Theme } from '../themes'

// Code exécuté uniquement côté serveur : la clé API et les consignes ne partent jamais au navigateur.

const CONSIGNES: Record<Theme, string> = {
  politique: `Tu écris des citations de discours politique français, pompeuses et creuses, à la manière de la "langue de bois".
Chaque citation est une seule phrase découpée en quatre morceaux qui s'enchaînent :
- intro : une formule d'ouverture solennelle (ex. "Je tiens à vous dire ici ma détermination sans faille pour clamer haut et fort que")
- cause : un sujet abstrait et grandiloquent (ex. "l'aspiration plus que légitime de chacun au progrès social")
- raison : une proposition verbale ronflante (ex. "doit s'intégrer à la finalisation globale")
- solution : un complément interminable et vide (ex. "d'un processus allant vers plus d'égalité.")`,
  droit: `Tu écris des extraits de plaidoiries d'avocat français, lyriques et engagées, dans l'esprit d'un concours d'éloquence.
Chaque citation est un court passage découpé en quatre morceaux qui s'enchaînent :
- intro : une adresse solennelle à la cour (ex. "Mesdames, Messieurs les honorables membres de la Cour,")
- cause : une question rhétorique forte sur les libertés ou la dignité humaine
- raison : une phrase qui présente un cas humain, fictif et émouvant
- solution : un appel final à la justice et à la conscience de la cour`,
}

// Le modèle est choisi librement dans les réglages : il peut ne pas figurer dans les listes
// typées des SDK (ex. le routeur gratuit « openrouter/free »), d'où les casts ci-dessous.
type Modele<F extends (model: never, ...args: never[]) => unknown> = Parameters<F>[0]

function creerAdaptateur(provider: ProviderId, modele: string, cle: string): AnyTextAdapter {
  switch (provider) {
    case 'openrouter':
      return createOpenRouterText(modele as Modele<typeof createOpenRouterText>, cle)
    case 'openai':
      return createOpenaiChat(modele as Modele<typeof createOpenaiChat>, cle)
    case 'anthropic':
      return createAnthropicChat(modele as Modele<typeof createAnthropicChat>, cle)
    case 'gemini':
      return createGeminiChat(modele as Modele<typeof createGeminiChat>, cle)
    case 'mistral':
      return createMistralText(modele as Modele<typeof createMistralText>, cle)
    case 'grok':
      return createGrokText(modele as Modele<typeof createGrokText>, cle)
  }
}

const CitationsSchema = z.object({
  citations: z.array(
    z.object({
      intro: z.string(),
      cause: z.string(),
      raison: z.string(),
      solution: z.string(),
    }),
  ),
})

const InputSchema = z.object({
  theme: z.enum(['politique', 'droit']),
  nombre: z.number().int().min(1).max(10),
  provider: z.enum(PROVIDER_IDS as [ProviderId, ...ProviderId[]]),
  modele: z.string().trim().min(1).max(200),
  // Clé saisie par l'utilisateur dans les réglages. Vide : on utilise celle du serveur (.env).
  cle: z.string().trim().max(500).optional(),
})

export const genererCitations = createServerFn({ method: 'POST' })
  .validator(InputSchema)
  .handler(async ({ data }) => {
    const consigne = CONSIGNES[data.theme]
    const { nom, envVar } = PROVIDERS[data.provider]
    const cle = data.cle || process.env[envVar]
    if (!cle) {
      throw new Error(`Aucune clé API ${nom}. Ajoutez la vôtre dans les réglages.`)
    }

    const resultat = await chat({
      adapter: creerAdaptateur(data.provider, data.modele, cle),
      systemPrompts: [
        `${consigne}
Écris en français, avec une ponctuation soignée. Les citations doivent être originales, variées entre elles et ne citer aucune personne réelle.
Les quatre morceaux, mis bout à bout avec un espace, doivent former un texte fluide.`,
      ],
      messages: [
        {
          role: 'user',
          content: `Génère exactement ${data.nombre} citation(s).`,
        },
      ],
      threadId: crypto.randomUUID(),
      outputSchema: CitationsSchema,
      // OpenRouter : mode JSON simple, compris par davantage de modèles (dont les gratuits)
      // que le JSON Schema strict. Le schéma est alors ajouté au prompt et la réponse reste validée par Zod.
      modelOptions: data.provider === 'openrouter' ? { responseFormat: { type: 'json_object' } } : undefined,
    })

    return resultat.citations.slice(0, data.nombre)
  })
