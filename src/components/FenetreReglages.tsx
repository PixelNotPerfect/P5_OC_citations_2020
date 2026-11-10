import { useEffect, useState } from 'react'
import { PROVIDERS, PROVIDER_IDS } from '../providers'
import type { ProviderId } from '../providers'
import { modeleChoisi } from '../lib/reglages'
import type { Reglages } from '../lib/reglages'

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
    <>
      <div
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-reglages"
        onClick={(e) => e.target === e.currentTarget && onFermer()}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <form
            className="modal-content"
            onSubmit={(e) => {
              e.preventDefault()
              onEnregistrer(brouillon)
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title" id="titre-reglages">
                Réglages de l'IA
              </h5>
              <button type="button" className="close" aria-label="Fermer" onClick={onFermer}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="provider">Fournisseur</label>
                <select
                  id="provider"
                  className="form-control"
                  value={provider}
                  onChange={(e) => changerProvider(e.target.value as ProviderId)}
                >
                  {PROVIDER_IDS.map((p) => (
                    <option key={p} value={p}>
                      {PROVIDERS[p].nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="modele">Modèle</label>
                <select
                  id="modele"
                  className="form-control"
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
                    className="form-control mt-2"
                    placeholder="Identifiant du modèle"
                    aria-label="Identifiant du modèle"
                    value={brouillon.modeles[provider] ?? ''}
                    onChange={(e) => changerModele(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="form-group mb-0">
                <label htmlFor="cle">Clé API {infos.nom}</label>
                <div className="input-group">
                  <input
                    id="cle"
                    className="form-control"
                    type={afficherCle ? 'text' : 'password'}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Laisser vide pour utiliser la clé du serveur"
                    value={brouillon.cles[provider] ?? ''}
                    onChange={(e) => changerCle(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setAfficherCle(!afficherCle)}
                    >
                      {afficherCle ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                </div>
                <small className="form-text text-muted">
                  Obtenir une clé :{' '}
                  <a href={infos.urlCle} target="_blank" rel="noreferrer">
                    {new URL(infos.urlCle).host}
                  </a>
                  . Elle est enregistrée uniquement dans ce navigateur et transmise au serveur de l'application à
                  chaque génération, sans y être conservée.
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onFermer}>
                Annuler
              </button>
              <button type="submit" className="btn generate mr-0">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  )
}
