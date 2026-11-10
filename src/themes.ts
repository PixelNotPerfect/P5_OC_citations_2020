export const THEMES = {
  politique: { titre: 'Parler comme un Politique...' },
  droit: { titre: 'Parler comme un Avocat...' },
} as const

export type Theme = keyof typeof THEMES

export type Citation = {
  intro: string
  cause: string
  raison: string
  solution: string
}
