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
import { corrigerMajuscules } from './majuscules'

// Code exécuté uniquement côté serveur : la clé API et les consignes ne partent jamais au navigateur.

const CONSIGNES: Record<Theme, string> = {
  politique: `Tu écris des parodies de discours politique français : de la "langue de bois" poussée jusqu'à l'absurde.
Le ton reste solennel et grandiloquent du début à la fin, mais le fond déraille : promesses délirantes, métaphores
filées qui partent en vrille, chiffres inventés d'une précision ridicule, préoccupations triviales du quotidien
(la machine à café en panne, les chaussettes orphelines, le Wi-Fi du camping, les pigeons) traitées comme des
enjeux de civilisation.
Chaque citation est une seule phrase découpée en quatre morceaux qui s'enchaînent :
- intro : une formule d'ouverture solennelle (ex. "Mes chers compatriotes, je l'affirme ici sans trembler du mollet :")
- cause : un sujet grandiloquent qui glisse vers le dérisoire (ex. "la crise historique du rond-point mal entretenu")
- raison : une proposition verbale ronflante (ex. "exige de nous un sursaut d'une ampleur quasi tectonique")
- solution : une chute absurde et inattendue (ex. "en direction d'une raclette nationale obligatoire le mardi.")`,
  droit: `Tu écris des parodies de plaidoiries d'avocat français, dans l'esprit d'un concours d'éloquence qui tourne à la farce.
Le ton est lyrique, vibrant et indigné comme une grande plaidoirie, mais l'affaire défendue est minuscule ou absurde :
le vol d'un dernier croissant, un chat accusé de sabotage de clavier, un voisin qui tond sa pelouse le dimanche à 7 h,
un GPS qui a mené son client dans un lac. L'avocat dramatise tout avec un sérieux total.
Chaque citation est un court passage découpé en quatre morceaux qui s'enchaînent :
- intro : une adresse solennelle à la cour (ex. "Mesdames, Messieurs les jurés, regardez bien mon client dans les yeux.")
- cause : une question rhétorique enflammée, disproportionnée par rapport à l'affaire
- raison : la description pathétique et détaillée du drame (fictif et dérisoire) vécu par le client
- solution : un appel final à la justice qui part en vrille, avec une chute comique`,
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
Le but est de faire rire : vise l'humour par le décalage entre le ton sérieux et le contenu absurde, avec une vraie
chute dans le dernier morceau. Évite les blagues attendues, la vulgarité et l'humour méchant envers des groupes de personnes.
Écris en français, avec une ponctuation et des majuscules soignées : les morceaux sont des bouts d'un même texte,
pas des phrases séparées. Un morceau commence par une minuscule quand il continue la phrase du morceau précédent,
et par une majuscule seulement s'il suit un point (ou un « ! », un « ? », des points de suspension) ou s'il commence par un nom propre. Les citations doivent être originales, très variées entre elles
(sujets et situations différents) et ne citer aucune personne réelle.
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

    return resultat.citations.slice(0, data.nombre).map(corrigerMajuscules)
  })
