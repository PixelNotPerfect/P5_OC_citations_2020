import { useEffect, useState } from 'react'
import { PROVIDERS, PROVIDER_PAR_DEFAUT, modeleParDefaut } from '../providers'
import type { ProviderId } from '../providers'

// Réglages de l'utilisateur, gardés uniquement dans le localStorage de son navigateur.
export type Reglages = {
  provider: ProviderId
  // Une clé et un modèle mémorisés par fournisseur, pour pouvoir passer de l'un à l'autre.
  cles: Partial<Record<ProviderId, string>>
  modeles: Partial<Record<ProviderId, string>>
}

const CLE_STOCKAGE = 'rhetoritron.reglages'

const REGLAGES_PAR_DEFAUT: Reglages = { provider: PROVIDER_PAR_DEFAUT, cles: {}, modeles: {} }

function lire(): Reglages {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE)
    if (!brut) return REGLAGES_PAR_DEFAUT
    const r = JSON.parse(brut) as Partial<Reglages>
    return {
      provider: r.provider && r.provider in PROVIDERS ? r.provider : PROVIDER_PAR_DEFAUT,
      cles: r.cles ?? {},
      modeles: r.modeles ?? {},
    }
  } catch {
    return REGLAGES_PAR_DEFAUT
  }
}

function ecrire(reglages: Reglages) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(reglages))
  } catch {
    // Stockage indisponible (navigation privée…) : les réglages restent valables pour la session.
  }
}

export function modeleChoisi(reglages: Reglages, provider = reglages.provider) {
  return reglages.modeles[provider] || modeleParDefaut(provider)
}

export function useReglages() {
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_PAR_DEFAUT)

  // Lecture après le premier rendu : le localStorage n'existe pas pendant le rendu serveur.
  useEffect(() => setReglages(lire()), [])

  function enregistrer(nouveaux: Reglages) {
    setReglages(nouveaux)
    ecrire(nouveaux)
  }

  return [reglages, enregistrer] as const
}
