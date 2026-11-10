import { useEffect, useState } from 'react'
import { PROVIDERS, PROVIDER_IDS } from '../providers'
import type { ProviderId } from '../providers'
import { modeleChoisi } from '../lib/reglages'
import type { Reglages } from '../lib/reglages'
import { IconeFermer } from './Icones'

const AUTRE = '__autre__'

type Props = {
  reglages: Reglages
  onEnregistrer: (reglages: Reglages) => void
  onFermer: () => void
}

export function FenetreReglages({ reglages, onEnregistrer, onFermer }: Props) {
  // Brouillon modifié dans la fenêtre, appliqué seulement à l'enregistrement.
  const [brouillon, setBrouillon] = useState<Reglages>(reglages)
  const [afficherCle, setAfficherCle] = useState(false)

  const provider = brouillon.provider
  const infos = PROVIDERS[provider]
  const modele = modeleChoisi(brouillon)
  const estModeleListe = infos.modeles.some((m) => m.id === modele)
  const [saisieLibre, setSaisieLibre] = useState(!estModeleListe)

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onFermer])

  function changerProvider(p: ProviderId) {
    setBrouillon({ ...brouillon, provider: p })
    setSaisieLibre(!PROVIDERS[p].modeles.some((m) => m.id === modeleChoisi(brouillon, p)))
  }

  function changerModele(m: string) {
    setBrouillon({ ...brouillon, modeles: { ...brouillon.modeles, [provider]: m } })
  }

  function changerCle(c: string) {
    setBrouillon({ ...brouillon, cles: { ...brouillon.cles, [provider]: c.trim() } })
  }

  return (
    <div className="fond-modale" onMouseDown={(e) => e.target === e.currentTarget && onFermer()}>
      <form
        className="modale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-reglages"
        onSubmit={(e) => {
          e.preventDefault()
          onEnregistrer(brouillon)
        }}
      >
        <div className="modale__entete">
          <h2 id="titre-reglages">Réglages de l'IA</h2>
          <button type="button" className="modale__fermer" aria-label="Fermer" onClick={onFermer}>
            <IconeFermer />
          </button>
        </div>

        <div className="modale__corps">
          <div className="champ">
            <span className="champ__label" id="label-provider">
              Fournisseur
            </span>
            <div className="fournisseurs" role="radiogroup" aria-labelledby="label-provider">
              {PROVIDER_IDS.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={p === provider}
                  className={`fournisseur${p === provider ? ' fournisseur--actif' : ''}`}
                  onClick={() => changerProvider(p)}
                >
                  {PROVIDERS[p].nom}
                </button>
              ))}
            </div>
          </div>

          <div className="champ">
            <label className="champ__label" htmlFor="modele">
              Modèle
            </label>
            <select
              id="modele"
              className="champ__saisie"
              value={saisieLibre ? AUTRE : modele}
              onChange={(e) => {
                if (e.target.value === AUTRE) {
                  setSaisieLibre(true)
                } else {
                  setSaisieLibre(false)
                  changerModele(e.target.value)
                }
              }}
            >
              {infos.modeles.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom} ({m.id})
                </option>
              ))}
              <option value={AUTRE}>Autre modèle…</option>
            </select>
            {saisieLibre && (
              <input
                className="champ__saisie"
                placeholder="Identifiant du modèle, ex. mistralai/mistral-small"
                aria-label="Identifiant du modèle"
                value={brouillon.modeles[provider] ?? ''}
                onChange={(e) => changerModele(e.target.value)}
                required
              />
            )}
          </div>

          <div className="champ">
            <label className="champ__label" htmlFor="cle">
              Clé API {infos.nom}
            </label>
            <div className="champ__groupe">
              <input
                id="cle"
                className="champ__saisie"
                type={afficherCle ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                placeholder="Facultatif : sinon, clé du serveur"
                value={brouillon.cles[provider] ?? ''}
                onChange={(e) => changerCle(e.target.value)}
              />
              <button type="button" className="bouton bouton--secondaire" onClick={() => setAfficherCle(!afficherCle)}>
                {afficherCle ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <p className="champ__aide">
              <a href={infos.urlCle} target="_blank" rel="noreferrer">
                Obtenir une clé {infos.nom}
              </a>
              . Elle reste dans ce navigateur et n'est envoyée au serveur de l'application qu'au moment de générer,
              sans y être conservée.
            </p>
          </div>
        </div>

        <div className="modale__pied">
          <button type="button" className="bouton bouton--secondaire" onClick={onFermer}>
            Annuler
          </button>
          <button type="submit" className="bouton bouton--principal">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
