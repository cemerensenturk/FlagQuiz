// Global değişkenler
let countriesData = []; // API'den alınan ülkelerin bilgilerini tutacak dizi
let currentQuestionIndex = 0; // Şu anki sorunun dizindeki indeksi
let score = 0; // Kullanıcının skorunu tutacak değişken
let questionCounter = 0;
let answered = false; // Sorunun cevaplanıp cevaplanmadığını kontrol eden değişken

// Quiz başlatma fonksiyonu
function startQuiz() {
    // API'den ülkeleri çekme işlemi
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            // Ülkelerin bilgilerini global değişkene ata
            countriesData = data;

            // Tüm ülkelerin bilgilerini konsola yazdır
            console.log(countriesData);

            shuffleArray(countriesData); // Ülkeleri karıştır
            showNextQuestion(); // İlk soruyu göster
        })
        .catch(error => console.error('API veri alınamadı:', error));
}


// Bir sonraki soruyu gösterme fonksiyonu
function showNextQuestion() {
    if (currentQuestionIndex < countriesData.length) {
        const currentCountry = countriesData[currentQuestionIndex];
        const flagUrl = currentCountry.flags.png;
        const correctAnswer = currentCountry.name.common;

        // Soruyu ve seçenekleri HTML'e yazdırma
        const flagImageElement = document.getElementById('flag-image');
        flagImageElement.src = flagUrl;

        // const questionTextElement = document.getElementById('question-text');
        // questionTextElement.textContent = `Hangi ülkenin bayrağı bu?`;

        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = ''; // Seçenekleri temizle

        // Rastgele seçenekleri oluşturma ve ekleme
        const options = getAnswerOptions(countriesData, currentCountry, 3); // Doğru cevap + 3 yanlış cevap

        options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.classList.add('option-btn');
            // `currentCountry`'i de iletin
            optionButton.addEventListener('click', () => checkAnswer(option, correctAnswer, currentCountry, optionButton));
            optionsContainer.appendChild(optionButton);
        });

        // Geçiş yaparken countryInfo içeriğini temizle
        const countryInfoElement = document.getElementById('countryInfo');
        countryInfoElement.innerHTML = '';

        // Geçiş yaparken "Next Question" butonunu gizle
        const nextQuestionButton = document.getElementById('next-question');
        nextQuestionButton.style.display = 'none';

        // Sorunun daha önce cevaplanıp cevaplanmadığını takip eden bayrağı sıfırla
        answered = false;

        currentQuestionIndex++;
    } else {
        // Quiz bittiğinde sonucu göster
        showResult();
    }
}

// Cevabı kontrol etme fonksiyonu
function checkAnswer(selectedAnswer, correctAnswer, currentCountry, selectedButton) {
    if (!answered) { // Soru daha önce cevaplanmamışsa
        if (selectedAnswer === correctAnswer) {
            score++; // Doğru cevap ise skoru artır
            questionCounter++;
            selectedButton.style.backgroundColor = 'limegreen';
            selectedButton.style.color = 'white';  
        } else {
            questionCounter++;
            selectedButton.style.backgroundColor = 'red';
            selectedButton.style.color = 'white';  
        }
        // Skoru güncelle
        document.getElementById('score-value').textContent = score;
        document.getElementById('question-count-value').textContent = questionCounter;

        // Doğru cevabın bilgilerini göster
        showCountryInfo(currentCountry);

        // Tüm butonları devre dışı bırak
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.disabled = true;
            // Doğru cevabı yeşil renkle vurgula
            if (button.textContent === correctAnswer) {
                button.style.backgroundColor = 'limegreen';
                selectedButton.style.color = 'white';  

            }
        });

        // Sorunun cevaplandığını işaretle
        answered = true;

        // "Next Question" butonunu göster
        const nextQuestionButton = document.getElementById('next-question');
        nextQuestionButton.style.display = 'block';
    }
}

// Doğru ülkenin bilgilerini gösterme fonksiyonu
function showCountryInfo(country) {
    const countryInfoElement = document.getElementById('countryInfo');
    if (true) { // Cevap verildiyse border göster
        countryInfoElement.style.border = '2px solid black';
        countryInfoElement.style.borderRadius = '10px';
        countryInfoElement.style.padding = '15px';
    } else { // Cevap verilmediyse border gizle
        countryInfoElement.style.border = 'none';
        countryInfoElement.style.padding = '0px';
    }

    countryInfoElement.innerHTML = `
        <h2>${country.name.official}</h2>
        <h4>Population: ${country.population.toLocaleString()}</h4>
        <h4>Continent: ${country.continents[0]}</h4>
        <h4>Capital: ${country.capital[0]}</h4>
        <h4>Currencies: ${new Intl.ListFormat("en-US", {
            style: "long",
            type: "conjunction",
            }).format(Object.values (country.
            currencies).map((c) => c.name))}</h4>
        <h4>Languages: ${new Intl.ListFormat("en-US", {
            style: "long",
            type: "conjunction"
            }).format(Object.values(country.languages))}
        </h4>
        <h4>Independency: ${country.independent}</h4>
        <h4>United Nation Member: ${country.unMember}</h4>
        <h4>Traffic: ${country.car.side}</h4>
    `;
}


// Quiz sonucunu gösterme fonksiyonu
function showResult() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <h2>Quiz bitti!</h2>
        <p>Toplam Skor: ${score}/${countriesData.length}</p>
        <button onclick="location.reload()">Yeniden Başlat</button>
    `;
}

// Yardımcı fonksiyonlar

// Array'i karıştırma fonksiyonu (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Doğru ve yanlış cevapları alma fonksiyonu
function getAnswerOptions(allCountries, correctCountry, numberOfOptions) {
    const options = [];
    options.push(correctCountry.name.common); // Doğru cevabı ekle

    // Rastgele seçenekler oluştur
    while (options.length <= numberOfOptions) { // <= yerine < kullanmak yerine == gibi
        const randomIndex = Math.floor(Math.random() * allCountries.length);
        const randomCountry = allCountries[randomIndex].name.common;
        if (!options.includes(randomCountry) && randomCountry !== correctCountry.name.common) {
            options.push(randomCountry);
        }
    }

    // Şıkları karıştırarak döndür
    return shuffleArray(options);
}


// Quiz'i başlat
startQuiz();
