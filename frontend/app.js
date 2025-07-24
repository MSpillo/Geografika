// API endpoint
const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const continentSelectionView = document.getElementById('continentSelectionView');
    const quizView = document.getElementById('quizView');
    const resultView = document.getElementById('resultView');
    const cityCuriosity = document.getElementById('cityCuriosity');
    const cityCuriosityList = document.getElementById('cityCuriosityList');
    const mapContainer = document.getElementById('mapContainer');

    const continentsList = document.getElementById('continents-list');
    const allContinentsCheckbox = document.getElementById('all-continents');

    const startQuizBtn = document.getElementById('startQuiz');
    const toughLabel = document.getElementById('toughLabel');
    const questionElement = document.getElementById('question');
    const factsList = document.getElementById('factsList');
    const flagImage = document.getElementById('flagImage');
    const celebrityImage = document.getElementById('celebrity-image');
    const answerInput = document.getElementById('answer');
    const submitAnswerBtn = document.getElementById('submitAnswer');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const backToHomeBtn = document.getElementById('backToHome');
    const backToHomeQuizBtn = document.getElementById('backToHomeQuizBtn');

    // Current quiz state
    let currentQuestion = null;
    let usedCountries = [];
    let quizEnded = false;
    let score = 0;
    let totalQuestionsAnswered = 0;
    let correctAnswersCount = 0;
    let mapInstance = null;

    // Initial view setup
    showContinentSelection();

    function updateScoreDisplay() {
        let scoreBar = document.getElementById('scoreBar');
        if (scoreBar) {
            scoreBar.textContent = `Score: ${score}`;
        }
    }

    updateScoreDisplay();

    // Event Listeners
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', submitAnswer);
    }
    if (answerInput) {
        answerInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitAnswer();
            }
        });
    }
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', startQuiz);
    }
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', showContinentSelection);
    }
    if (backToHomeQuizBtn) {
        backToHomeQuizBtn.addEventListener('click', showContinentSelection);
    }

    // Add event listener for Enter key on the result view
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            if (resultView && !resultView.classList.contains('hidden')) {
                event.preventDefault();
                if (nextQuestionBtn && !nextQuestionBtn.classList.contains('hidden')) {
                    startQuiz();
                }
            }
        }
    });

    // Continents selection logic
    if (continentsList) {
        continentsList.addEventListener('change', (e) => {
            if (e.target.value === 'All continents') {
                if (e.target.checked) {
                    Array.from(continentsList.querySelectorAll('input[type=checkbox]')).forEach(cb => {
                        if (cb.value !== 'All continents') cb.checked = false;
                    });
                }
            } else {
                if (e.target.checked) {
                    allContinentsCheckbox.checked = false;
                }
            }
        });
    }

    // Functions
    async function startQuiz() {
        console.log('Start Quiz button clicked, starting quiz...');
        if (quizEnded) {
            showEndQuiz();
            return;
        }

        const checked = Array.from(continentsList.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
        let continents = checked;
        if (continents.includes('All continents') || continents.length === 0) {
            continents = ['Europe', 'Asia', 'Africa', 'South America', 'North America', 'Oceania'];
        }
        try {
            console.log('Fetching question from:', `${API_URL}/quiz?continents=${encodeURIComponent(continents.join(','))}`);
            const response = await fetch(`${API_URL}/quiz?continents=${encodeURIComponent(continents.join(','))}`);
            console.log('Response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch question: ${response.status} ${errorText}`);
            }
            const question = await response.json();
            console.log('Received question:', question);

            if (usedCountries.includes(question.country)) {
                let attempts = 0;
                let newQuestion = question;
                while (usedCountries.includes(newQuestion.country) && attempts < 10) {
                    const resp = await fetch(`${API_URL}/quiz?continents=${encodeURIComponent(continents.join(','))}`);
                    if (!resp.ok) break;
                    newQuestion = await resp.json();
                    attempts++;
                }
                if (usedCountries.includes(newQuestion.country)) {
                    quizEnded = true;
                    showEndQuiz();
                    return;
                } else {
                    currentQuestion = newQuestion;
                }
            } else {
                currentQuestion = question;
            }
            usedCountries.push(currentQuestion.country);

            console.log('Current Question Data:', currentQuestion);

            toughLabel.textContent = currentQuestion.tough ? 'Tough one!' : '';
            questionElement.textContent = `What is the capital of ${currentQuestion.country}?`;

            if (currentQuestion.flag_image) {
                console.log('Setting flagImage.src to:', `images/${currentQuestion.flag_image}`);
                flagImage.src = `images/${currentQuestion.flag_image}`;
                flagImage.classList.remove('hidden');
                console.log('flagImage.src after setting:', flagImage.src);
            } else {
                console.log('No flag_image found, hiding flag image.');
                flagImage.src = '';
                flagImage.classList.add('hidden');
            }

            const celebrityNameElement = document.getElementById('celebrity-name');
            const celebrityTypeElement = document.getElementById('celebrity-type');
            if (currentQuestion.facts['Famous celebrity']) {
                celebrityNameElement.textContent = currentQuestion.facts['Famous celebrity'];
                if (currentQuestion.celebrity_type) {
                    celebrityTypeElement.textContent = currentQuestion.celebrity_type;
                } else {
                    celebrityTypeElement.textContent = '';
                }
            } else {
                celebrityNameElement.textContent = '';
                celebrityTypeElement.textContent = '';
            }

            if (currentQuestion.facts['Famous celebrity image']) {
                celebrityImage.src = `images/celebrities/${currentQuestion.facts['Famous celebrity image']}`;
                celebrityImage.classList.remove('hidden');
            } else {
                celebrityImage.src = '';
                celebrityImage.classList.add('hidden');
            }

            factsList.innerHTML = '';
            const factKeys = ['Population', 'Average age', 'Gender ratio', 'Average income', 'Main language', 'Surface area'];
            factKeys.forEach(key => {
                if (currentQuestion.facts[key]) {
                    const li = document.createElement('li');
                    let displayKey = key.replace(/([A-Z])/g, ' $1').trim();
                    displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

                    let factValue = currentQuestion.facts[key];
                    if (key === 'Surface area') {
                        factValue = `${factValue.toLocaleString()} km²`;
                    }

                    li.textContent = `${displayKey}: ${factValue}`;
                    factsList.appendChild(li);
                }
            });

            answerInput.value = '';
            showQuiz();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load question. Please try again.');
        }
    }

    async function submitAnswer() {
        const answer = answerInput.value.trim();
        if (!answer) {
            alert('Please enter an answer');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/check-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    country: currentQuestion.country,
                    answer: answer
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to check answer: ${response.status} ${errorText}`);
            }
            const result = await response.json();

            totalQuestionsAnswered++;
            if (result.is_correct) {
                if (currentQuestion.tough) {
                    score += 5; // Domanda difficile corretta
                } else {
                    score++; // Domanda standard corretta
                }
                correctAnswersCount++;
                resultTitle.textContent = 'Correct!';
                resultTitle.classList.remove('text-red-600');
                resultTitle.classList.add('text-green-600');
            } else {
                score--; // Risposta errata
                resultTitle.textContent = `Incorrect. The capital of ${currentQuestion.country} is ${result.correct_answer}.`;
                resultTitle.classList.remove('text-green-600');
                resultTitle.classList.add('text-red-600');
            }
            resultMessage.textContent = result.message || '';
            updateScoreDisplay(); // Assicurati che il punteggio sia aggiornato dopo ogni risposta

            // Gestione delle curiosità sulla città
            cityCuriosityList.innerHTML = '';
            if (result.capital_curiosities) {
                cityCuriosity.classList.remove('hidden');
                if (Array.isArray(result.capital_curiosities)) {
                    result.capital_curiosities.forEach(fact => {
                        // Escludi curiosità che menzionano latitudine o longitudine
                        if (
                            typeof fact === 'string' &&
                            !fact.toLowerCase().includes('latitude') &&
                            !fact.toLowerCase().includes('longitude') &&
                            !fact.toLowerCase().includes('latitudine') &&
                            !fact.toLowerCase().includes('longitudine')
                        ) {
                            const li = document.createElement('li');
                            li.textContent = fact;
                            cityCuriosityList.appendChild(li);
                        }
                    });
                } else if (typeof result.capital_curiosities === 'object' && result.capital_curiosities !== null) {
                    // Se è un oggetto, itera sulle sue coppie chiave-valore
                    for (const key in result.capital_curiosities) {
                        if (
                            Object.hasOwnProperty.call(result.capital_curiosities, key) &&
                            key.toLowerCase() !== 'latitude' &&
                            key.toLowerCase() !== 'longitude' &&
                            key.toLowerCase() !== 'latitudine' &&
                            key.toLowerCase() !== 'longitudine'
                        ) {
                            const li = document.createElement('li');
                            li.textContent = `${key}: ${result.capital_curiosities[key]}`;
                            cityCuriosityList.appendChild(li);
                        }
                    }
                }
            } else {
                cityCuriosity.classList.add('hidden');
            }

            // Gestione della mappa
            if (result.latitude && result.longitude) {
                mapContainer.classList.remove('hidden');
                if (mapInstance) {
                    mapInstance.remove(); // Rimuovi la mappa esistente prima di crearne una nuova
                }
                mapInstance = L.map('mapContainer').setView([result.latitude, result.longitude], 6);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstance);
                L.marker([result.latitude, result.longitude]).addTo(mapInstance)
                    .bindPopup(result.correct_answer || 'Capital')
                    .openPopup();
                mapInstance.invalidateSize(); // Invalida la dimensione per il rendering corretto
            } else {
                mapContainer.classList.add('hidden');
                if (mapInstance) {
                    mapInstance.remove();
                    mapInstance = null;
                }
            }

            showResult();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit answer. Please try again.');
        }
    }

    function showContinentSelection() {
        continentSelectionView.classList.remove('hidden');
        quizView.classList.add('hidden');
        resultView.classList.add('hidden');
        quizEnded = false;
        usedCountries = [];
        score = 0;
        updateScoreDisplay();
    }

    function showQuiz() {
        continentSelectionView.classList.add('hidden');
        quizView.classList.remove('hidden');
        resultView.classList.add('hidden');
    }

    function showResult() {
        continentSelectionView.classList.add('hidden');
        quizView.classList.add('hidden');
        resultView.classList.remove('hidden');
        if (mapInstance) {
            mapInstance.invalidateSize(); // Assicurati che la mappa si ridisegni correttamente quando mostrata
        }
    }

    function showEndQuiz() {
        alert(`Quiz ended! Your final score is ${score} out of ${totalQuestionsAnswered} questions. You got ${correctAnswersCount} answers correct.`);
        score = 0;
        totalQuestionsAnswered = 0;
        correctAnswersCount = 0;
        usedCountries = [];
        quizEnded = false;
        updateScoreDisplay();
        showContinentSelection();
    }
}); 