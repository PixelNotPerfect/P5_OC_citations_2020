import type { Citation } from '../themes'

// Début de phrase : début du texte, ou après . ! ? … suivi d'espaces,
// en sautant d'éventuels guillemets ou parenthèses ouvrants.
const DEBUT_DE_PHRASE = /(^|[.!?…]\s+)([«"“‘'(\s]*)(\p{Ll})/gu

function majusculesDansTexte(texte: string) {
  return texte.replace(DEBUT_DE_PHRASE, (_, avant, ouvrants, lettre: string) => avant + ouvrants + lettre.toUpperCase())
}

const MORCEAUX = ['intro', 'cause', 'raison', 'solution'] as const

/**
 * Met une majuscule en début de citation et après chaque fin de phrase,
 * y compris quand la phrase précédente se termine dans le morceau d'avant.
 */
export function corrigerMajuscules(citation: Citation): Citation {
  const corrigee = { ...citation }
  let precedent = ''
  for (const morceau of MORCEAUX) {
    const texte = corrigee[morceau].trim()
    // On corrige le morceau précédé de la fin du précédent, puis on retire ce préfixe.
    const prefixe = precedent ? `${precedent.slice(-1)} ` : ''
    corrigee[morceau] = majusculesDansTexte(prefixe + texte).slice(prefixe.length)
    precedent = texte.replace(/[»"”’')\s]+$/u, '')
  }
  return corrigee
}
