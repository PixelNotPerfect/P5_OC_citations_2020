import { createServerFn } from '@tanstack/react-start'
import { chat } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { z } from 'zod'
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
})

export const genererCitations = createServerFn({ method: 'POST' })
  .validator(InputSchema)
  .handler(async ({ data }) => {
    const consigne = CONSIGNES[data.theme]

    const resultat = await chat({
      adapter: anthropicText('claude-sonnet-5-5'),
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
    })

    return resultat.citations.slice(0, data.nombre)
  })
