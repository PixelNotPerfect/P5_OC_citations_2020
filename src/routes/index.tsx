import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { genererCitations } from '../server/citations'
import { THEMES } from '../themes'
import type { Citation, Theme } from '../themes'
import { PROVIDERS } from '../providers'
import { FenetreReglages } from '../components/FenetreReglages'
import { modeleChoisi, useReglages } from '../lib/reglages'

export const Route = createFileRoute('/')({
  component: Accueil,
})

function Accueil() {
  const generer = useServerFn(genererCitations)
  const [nombre, setNombre] = useState('1')
  const [titre, setTitre] = useState('Vos citations seront générées ici.')
  const [citations, setCitations] = useState<Citation[]>([])
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [reglages, enregistrerReglages] = useReglages()
  const [reglagesOuverts, setReglagesOuverts] = useState(false)
  const modele = modeleChoisi(reglages)

  async function lancer(theme: Theme) {
    const n = Number(nombre)
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      setErreur('Veuillez saisir un nombre entier compris entre 1 et 10 inclus.')
      return
    }
    setErreur('')
    setEnCours(true)
    setTitre(THEMES[theme].titre)
    setCitations([])
    try {
      setCitations(
        await generer({
          data: { theme, nombre: n, provider: reglages.provider, modele, cle: reglages.cles[reglages.provider] },
        }),
      )
    } catch (e) {
      console.error(e)
      const detail = e instanceof Error && e.message ? ` (${e.message})` : ''
      setErreur(`L'IA n'a pas pu générer de citations${detail}. Vérifiez vos réglages ou réessayez.`)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <>
      <main className="flex-shrink-0">
        <header className="position-relative">
          <button
            type="button"
            className="btn btn-sm btn-outline-light bouton-reglages"
            onClick={() => setReglagesOuverts(true)}
          >
            ⚙ Réglages
          </button>
          <h1>Rhétoritron vs Plaidoritron</h1>
          <h4>Votre générateur d'éloquence</h4>
        </header>

        <section className="formulaire">
          <div className="container">
            <p className="lead">
              Vous souhaitez impressionner vos amis ou vous entrainer au prochain concours d'éloquence ? <br />
              Vous souhaitez parler comme un homme politique ou un avocat ? <br />
            </p>
            <p>
              Choisissez un nombre entre 1 et 10, puis cliquez sur "Politique" ou "Droit" en fonction de vos
              aspirations. <br />
              A vos clics !
            </p>
            <div className="form-group w-25 mx-auto">
              <input
                className="number form-control"
                type="number"
                name="number"
                id="number"
                min={1}
                max={10}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <button className="generate btn" type="button" disabled={enCours} onClick={() => lancer('politique')}>
              Politique
            </button>
            <button className="generate btn mr-0" type="button" disabled={enCours} onClick={() => lancer('droit')}>
              Droit
            </button>

            <div className="text-danger mt-2">{erreur}</div>
            <p className="small mt-3 mb-0">
              IA : {PROVIDERS[reglages.provider].nom} · {modele}
              {reglages.cles[reglages.provider] ? ' · votre clé' : ''}
            </p>
          </div>
        </section>

        <section className="citation">
          <div className="container">
            <h5 className="text-center mb-4">{titre}</h5>
            {enCours && <p className="text-center text-muted">L'IA prépare votre discours…</p>}
            <div>
              {citations.map((c, i) => (
                <p key={i}>
                  <span className="intro">{c.intro}</span> <span className="cause">{c.cause}</span>{' '}
                  <span className="raison">{c.raison}</span> <span className="solution">{c.solution}</span>
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto">
        <p>
          &copy; 2020 Copyright <a href="http://cv.juliemolla.fr/">Julie Molla</a>
        </p>
      </footer>

      {reglagesOuverts && (
        <FenetreReglages
          reglages={reglages}
          onFermer={() => setReglagesOuverts(false)}
          onEnregistrer={(r) => {
            enregistrerReglages(r)
            setReglagesOuverts(false)
          }}
        />
      )}
    </>
  )
}
