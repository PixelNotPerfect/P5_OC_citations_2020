import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { genererCitations } from '../server/citations'
import { THEMES } from '../themes'
import type { Citation, Theme } from '../themes'
import { PROVIDERS } from '../providers'
import { FenetreReglages } from '../components/FenetreReglages'
import { IconeCopier, IconeReglages, IconeValider } from '../components/Icones'
import { modeleChoisi, useReglages } from '../lib/reglages'

export const Route = createFileRoute('/')({
  component: Accueil,
})

const MIN = 1
const MAX = 10

const LEGENDE = [
  { classe: 'intro', nom: 'Introduction' },
  { classe: 'cause', nom: 'Cause' },
  { classe: 'raison', nom: 'Raison' },
  { classe: 'solution', nom: 'Solution' },
] as const

function texteComplet(c: Citation) {
  return [c.intro, c.cause, c.raison, c.solution].join(' ')
}

function Accueil() {
  const generer = useServerFn(genererCitations)
  const [nombre, setNombre] = useState(3)
  const [theme, setTheme] = useState<Theme | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [reglages, enregistrerReglages] = useReglages()
  const [reglagesOuverts, setReglagesOuverts] = useState(false)
  const modele = modeleChoisi(reglages)

  async function lancer(choix: Theme) {
    setErreur('')
    setEnCours(true)
    setTheme(choix)
    setCitations([])
    try {
      setCitations(
        await generer({
          data: {
            theme: choix,
            nombre,
            provider: reglages.provider,
            modele,
            cle: reglages.cles[reglages.provider],
          },
        }),
      )
    } catch (e) {
      console.error(e)
      setErreur(e instanceof Error && e.message ? e.message : 'Erreur inconnue.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="page">
      <header className="entete">
        <div className="entete__barre">
          <span className="entete__logo" aria-hidden="true">
            🎙️
          </span>
          <button type="button" className="bouton-icone" onClick={() => setReglagesOuverts(true)}>
            <IconeReglages />
            <span>Réglages</span>
          </button>
        </div>
        <h1 className="entete__titre">
          Rhétoritron <em>vs</em> Plaidoritron
        </h1>
        <p className="entete__sous-titre">Votre générateur d'éloquence</p>
        <div className="drapeau" aria-hidden="true" />
      </header>

      <main className="contenu">
        <section className="carte formulaire" aria-labelledby="titre-formulaire">
          <h2 id="titre-formulaire" className="formulaire__titre">
            Impressionnez vos amis, briguez le prochain concours d'éloquence.
          </h2>
          <p className="formulaire__intro">
            Choisissez combien de citations vous voulez, puis votre camp : la tribune ou le prétoire.
          </p>

          <div className="compteur" role="group" aria-label="Nombre de citations">
            <span className="compteur__label">Nombre de citations</span>
            <div className="compteur__controle">
              <button
                type="button"
                className="compteur__bouton"
                onClick={() => setNombre(Math.max(MIN, nombre - 1))}
                disabled={nombre <= MIN || enCours}
                aria-label="Une citation de moins"
              >
                −
              </button>
              <output className="compteur__valeur" aria-live="polite">
                {nombre}
              </output>
              <button
                type="button"
                className="compteur__bouton"
                onClick={() => setNombre(Math.min(MAX, nombre + 1))}
                disabled={nombre >= MAX || enCours}
                aria-label="Une citation de plus"
              >
                +
              </button>
            </div>
          </div>

          <div className="choix-theme">
            {(Object.keys(THEMES) as Theme[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`theme theme--${t}${theme === t && enCours ? ' theme--actif' : ''}`}
                onClick={() => lancer(t)}
                disabled={enCours}
              >
                <span className="theme__icone" aria-hidden="true">
                  {THEMES[t].icone}
                </span>
                <span className="theme__nom">{THEMES[t].nom}</span>
                <span className="theme__description">{THEMES[t].description}</span>
              </button>
            ))}
          </div>

          <p className="modele">
            <span className="modele__pastille" aria-hidden="true" />
            {PROVIDERS[reglages.provider].nom} · <code>{modele}</code>
            {reglages.cles[reglages.provider] ? ' · votre clé' : ''}
            <button type="button" className="lien" onClick={() => setReglagesOuverts(true)}>
              Modifier
            </button>
          </p>
        </section>

        <section className="resultats" aria-live="polite" aria-busy={enCours}>
          {erreur && (
            <div className="alerte" role="alert">
              <strong>L'IA n'a pas pu répondre.</strong>
              <span>{erreur}</span>
              <span className="alerte__aide">
                Vérifiez votre clé et votre modèle dans les{' '}
                <button type="button" className="lien" onClick={() => setReglagesOuverts(true)}>
                  réglages
                </button>
                , puis réessayez.
              </span>
            </div>
          )}

          {!theme && !erreur && (
            <div className="vide">
              <p className="vide__guillemets" aria-hidden="true">
                «&nbsp;»
              </p>
              <p>Vos citations apparaîtront ici.</p>
            </div>
          )}

          {theme && !erreur && (
            <>
              <h2 className="resultats__titre">{THEMES[theme].titre}</h2>
              {enCours && <p className="resultats__attente">L'IA prépare votre discours…</p>}
              {enCours ? (
                <div className="discours discours--chargement" aria-hidden="true">
                  {Array.from({ length: Math.min(nombre * 3, 12) }, (_, i) => (
                    <span key={i} className="discours__ligne" />
                  ))}
                </div>
              ) : (
                citations.length > 0 && <Discours citations={citations} />
              )}
              {!enCours && citations.length > 0 && (
                <ul className="legende" aria-label="Légende">
                  {LEGENDE.map((l) => (
                    <li key={l.classe} className={`legende__item legende__item--${l.classe}`}>
                      {l.nom}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="pied">
        <div className="drapeau" aria-hidden="true" />
        <p>
          © 2020 <a href="http://cv.juliemolla.fr/">Julie Molla</a> · Citations générées par IA, à ne pas prendre au
          sérieux.
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
    </div>
  )
}

function Discours({ citations }: { citations: Citation[] }) {
  const [copie, setCopie] = useState(false)

  async function copier() {
    try {
      await navigator.clipboard.writeText(citations.map(texteComplet).join('\n\n'))
      setCopie(true)
      setTimeout(() => setCopie(false), 1500)
    } catch {
      // Presse-papiers indisponible : on ne fait rien.
    }
  }

  return (
    <article className="discours">
      <div className="discours__texte">
        {citations.map((c, i) => (
          <p key={i}>
            <span className="intro">{c.intro}</span> <span className="cause">{c.cause}</span>{' '}
            <span className="raison">{c.raison}</span> <span className="solution">{c.solution}</span>
          </p>
        ))}
      </div>
      <button type="button" className="discours__copier" onClick={copier}>
        {copie ? <IconeValider /> : <IconeCopier />}
        <span>{copie ? 'Texte copié' : 'Copier le texte'}</span>
      </button>
    </article>
  )
}
