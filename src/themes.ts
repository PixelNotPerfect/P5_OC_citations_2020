export const THEMES = {
  politique: {
    nom: 'Politique',
    titre: 'Parler comme un Politique…',
    description: 'La langue de bois portée à son sommet.',
    icone: '🏛️',
  },
  droit: {
    nom: 'Droit',
    titre: 'Parler comme un Avocat…',
    description: 'Des plaidoiries vibrantes pour des affaires dérisoires.',
    icone: '⚖️',
  },
} as const

export type Theme = keyof typeof THEMES

export type Citation = {
  intro: string
  cause: string
  raison: string
  solution: string
}
