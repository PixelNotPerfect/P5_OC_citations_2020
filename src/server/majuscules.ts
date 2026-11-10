import type { Citation } from '../themes'

// Début de phrase : début du texte, ou après . ! ? … suivi d'espaces,
// en sautant d'éventuels guillemets ou parenthèses ouvrants.
const DEBUT_DE_PHRASE = /(^|[.!?…]\s+)([«"“‘'(\s]*)(\p{Ll})/gu

// Fin de phrase à la fin d'un morceau (en ignorant guillemets et parenthèses fermants).
const FIN_DE_PHRASE = /[.!?…][»"”’')\s]*$/u

// Premier mot d'un morceau, précédé d'éventuels guillemets ouvrants.
const PREMIER_MOT = /^([«"“‘'(\s]*)(\p{Lu})(\p{L}*)/u

// Mots qui gardent leur majuscule même en milieu de phrase.
const NOMS_PROPRES = new Set([
  'Monsieur',
  'Madame',
  'Mademoiselle',
  'Messieurs',
  'Mesdames',
  'Mesdemoiselles',
  'Maître',
  'Dieu',
  'État',
  'République',
  'France',
  'Europe',
  'Président',
  'Cour',
  'Parquet',
])

function majusculesDansTexte(texte: string) {
  return texte.replace(DEBUT_DE_PHRASE, (_, avant, ouvrants, lettre: string) => avant + ouvrants + lettre.toUpperCase())
}

/** Met en minuscule le premier mot d'un morceau qui continue la phrase précédente. */
function minusculeInitiale(texte: string) {
  return texte.replace(PREMIER_MOT, (mot, ouvrants: string, initiale: string, suite: string) => {
    const estSigle = /\p{Lu}/u.test(suite) // ex. « SNCF », « ONU »
    if (estSigle || NOMS_PROPRES.has(initiale + suite)) return mot
    return ouvrants + initiale.toLowerCase() + suite
  })
}

const MORCEAUX = ['intro', 'cause', 'raison', 'solution'] as const

/**
 * Corrige les majuscules d'une citation générée en quatre morceaux :
 * - majuscule en début de citation et après chaque fin de phrase ;
 * - minuscule au début d'un morceau qui continue la phrase du morceau précédent
 *   (les modèles mettent souvent une majuscule à chaque morceau).
 */
export function corrigerMajuscules(citation: Citation): Citation {
  const corrigee = { ...citation }
  let precedent = ''
  for (const morceau of MORCEAUX) {
    let texte = corrigee[morceau].trim()
    if (precedent && !FIN_DE_PHRASE.test(precedent)) {
      texte = minusculeInitiale(texte)
    }
    // On corrige le morceau précédé de la fin du précédent, puis on retire ce préfixe.
    const finPrecedent = precedent.replace(/[»"”’')\s]+$/u, '').slice(-1)
    const prefixe = finPrecedent ? `${finPrecedent} ` : ''
    corrigee[morceau] = majusculesDansTexte(prefixe + texte).slice(prefixe.length)
    precedent = texte
  }
  return corrigee
}
