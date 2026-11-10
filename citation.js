import donneesPolitique from './donnees/donnees_projet_1.js';
import donneesDroit from './donnees/donnees_projet_2.js';

export class Citation {
    constructor() {
        this.themeWatcher();
    }

    toString() {
        return this.intro + " " + this.cause + " " + this.raison + " " + this.solution;
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    themeWatcher() {
        document.getElementById("generatePolitique").addEventListener("click", function () {
            this.generate('Parler comme un Politique...', donneesPolitique)
        }.bind(this));

        document.getElementById("generateDroit").addEventListener("click", function () {
            this.generate('Parler comme un Avocat...', donneesDroit)

        }.bind(this));
    }

    generate(titre, citations) {
        const number = parseInt(document.getElementById("number").value, 10);
        if (Number.isNaN(number) || number <= 0 || number > 10) {
            document.getElementById('error').innerText = 'Veuillez saisir un nombre entier compris entre 1 et 10 inclus.';
            console.log(typeof number, number);
            return;
        }
        document.getElementById('error').innerText = '';
        document.getElementById('titre').innerText = titre
        this.showSentences(number, citations);
    }

    showSentences(n, citations) {
        const citationElement = document.getElementById("citation");
        citationElement.innerHTML = '';
        for (let i = 0; i < n; i++) {
            const intro = this.getRandomElement(citations.selection1);
            const cause = this.getRandomElement(citations.selection2);
            const raison = this.getRandomElement(citations.selection3);
            const solution = this.getRandomElement(citations.selection4);

            const p = document.createElement('p');

            const spanIntro = document.createElement('span');
            spanIntro.classList.add('intro');
            spanIntro.innerText = intro + ' '

            const spanCause = document.createElement('span');
            spanCause.classList.add('cause');
            spanCause.innerText = cause + ' '

            const spanRaison = document.createElement('span');
            spanRaison.classList.add('raison');
            spanRaison.innerText = raison + ' '

            const spanSolution = document.createElement('span');
            spanSolution.classList.add('solution');
            spanSolution.innerText = solution

            p.appendChild(spanIntro);
            p.appendChild(spanCause);
            p.appendChild(spanRaison);
            p.appendChild(spanSolution);

            citationElement.appendChild(p);
        }
    }
}

