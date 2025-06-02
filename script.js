// script.js

let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let selectedAnswer = null;
let dragDropAnswers = {};
let matchingAnswers = {};
let fillBlankAnswers = [];

function startQuiz() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('questionScreen').style.display = 'block';
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    selectedAnswer = null;
    showQuestion();
}

function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('questionCounter').textContent = `Soalan ${currentQuestion + 1} dari ${questions.length}`;
    document.getElementById('questionText').textContent = question.question;

    // Set question type badge
    const typeNames = {
        'multiple-choice': '🔘 Pilihan Berganda',
        'drag-drop': '🔄 Drag & Drop',
        'matching': '🔗 Matching',
        'fill-blank': '✏️ Fill in the Blank',
        'true-false': '✅ True/False'
    };
    document.getElementById('questionType').textContent = typeNames[question.type];

    // Clear previous content
    const container = document.getElementById('questionContainer');
    container.innerHTML = '';

    // Reset button
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.textContent = 'Semak Jawapan';
    nextBtn.onclick = checkAnswer;
    nextBtn.disabled = true;

    // Create question based on type
    switch (question.type) {
        case 'multiple-choice':
            createMultipleChoice(question, container);
            break;
        case 'drag-drop':
            createDragDrop(question, container);
            break;
        case 'matching':
            createMatching(question, container);
            break;
        case 'fill-blank':
            createFillBlank(question, container);
            break;
        case 'true-false':
            createTrueFalse(question, container);
            break;
    }

    // Update progress bar
    const progress = (currentQuestion / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function createMultipleChoice(question, container) {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index, optionDiv);
        optionsDiv.appendChild(optionDiv);
    });

    container.appendChild(optionsDiv);
}

function createDragDrop(question, container) {
    dragDropAnswers = {};
    const dragContainer = document.createElement('div');
    dragContainer.className = 'drag-container';

    // Kolum Seret
    const dragItemsDiv = document.createElement('div');
    dragItemsDiv.className = 'drag-items';
    dragItemsDiv.innerHTML = '<h4>🎯 Seret item ke kedudukan yang betul</h4>';

    question.dragItems.forEach((item, index) => {
        const dragItem = document.createElement('div');
        dragItem.className = 'drag-item';
        dragItem.textContent = item;
        dragItem.draggable = true;
        dragItem.dataset.index = index;

        dragItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            dragItem.classList.add('dragging');
        });

        dragItem.addEventListener('dragend', () => {
            dragItem.classList.remove('dragging');
        });

        dragItemsDiv.appendChild(dragItem);
    });

    // Kolum Zon Terima
    const dropZonesDiv = document.createElement('div');
    dropZonesDiv.className = 'drop-zones';
    dropZonesDiv.innerHTML = '<h4>📍 Zon Drop</h4>';

    question.dropZones.forEach((zone, index) => {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `<div class="drop-zone-label">${zone}</div>`;
        dropZone.dataset.index = index;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            const draggedIndex = e.dataTransfer.getData('text/plain');
            const draggedItem = document.querySelector(`.drag-item[data-index='${draggedIndex}']`);

            if (draggedItem && !dropZone.classList.contains('filled')) {
                dropZone.appendChild(draggedItem);
                dropZone.classList.add('filled');
                dragDropAnswers[dropZone.dataset.index] = parseInt(draggedIndex);
                document.getElementById('nextBtn').disabled = false;
            }
        });

        dropZonesDiv.appendChild(dropZone);
    });

    dragContainer.appendChild(dragItemsDiv);
    dragContainer.appendChild(dropZonesDiv);
    container.appendChild(dragContainer);
}

function createMatching(question, container) {
    matchingAnswers = {};
    const matchContainer = document.createElement('div');
    matchContainer.className = 'matching-container';

    const leftColumn = document.createElement('div');
    leftColumn.className = 'matching-column';
    leftColumn.innerHTML = '<h4>Item Teknik</h4>';

    question.leftItems.forEach((item, index) => {
        const matchItem = document.createElement('div');
        matchItem.className = 'matching-item';
        matchItem.textContent = item;
        matchItem.dataset.index = index;
        matchItem.onclick = () => selectMatchLeft(matchItem);
        leftColumn.appendChild(matchItem);
    });

    const rightColumn = document.createElement('div');
    rightColumn.className = 'matching-column';
    rightColumn.innerHTML = '<h4>Deskripsi</h4>';

    question.rightItems.forEach((item, index) => {
        const matchItem = document.createElement('div');
        matchItem.className = 'matching-item';
        matchItem.textContent = item;
        matchItem.dataset.index = index;
        matchItem.onclick = () => selectMatchRight(matchItem);
        rightColumn.appendChild(matchItem);
    });

    matchContainer.appendChild(leftColumn);
    matchContainer.appendChild(rightColumn);
    container.appendChild(matchContainer);
}

function createFillBlank(question, container) {
    fillBlankAnswers = new Array(question.blanks.length).fill('');
    const fillContainer = document.createElement('div');
    fillContainer.className = 'fill-blank-container';

    const textParts = question.text.split('_____');
    textParts.forEach((part, idx) => {
        const span = document.createElement('span');
        span.textContent = part;
        fillContainer.appendChild(span);
        if (idx < question.blanks.length) {
            const input = document.createElement('input');
            input.className = 'blank-input';
            input.dataset.index = idx;
            input.oninput = (e) => {
                fillBlankAnswers[idx] = e.target.value.trim().toLowerCase();
                document.getElementById('nextBtn').disabled = fillBlankAnswers.includes('');
            };
            fillContainer.appendChild(input);
        }
    });

    const wordBankDiv = document.createElement('div');
    wordBankDiv.className = 'word-bank';
    wordBankDiv.innerHTML = '<h4>Bank Kata</h4>';
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'word-options';

    question.wordBank.forEach(word => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-option';
        wordDiv.textContent = word;
        wordDiv.onclick = () => {
            const emptyIndex = fillBlankAnswers.findIndex(ans => ans === '');
            if (emptyIndex !== -1) {
                fillBlankAnswers[emptyIndex] = word.toLowerCase();
                const inputField = document.querySelector(`.blank-input[data-index='${emptyIndex}']`);
                inputField.value = word;
                inputField.classList.add('filled');
                wordDiv.classList.add('used');
                document.getElementById('nextBtn').disabled = fillBlankAnswers.includes('');
            }
        };
        optionsDiv.appendChild(wordDiv);
    });

    wordBankDiv.appendChild(optionsDiv);
    container.appendChild(fillContainer);
    container.appendChild(wordBankDiv);
}

function createTrueFalse(question, container) {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options';
    ['Betul', 'Salah'].forEach((text, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = text;
        optionDiv.onclick = () => selectTrueFalse(idx === 0, optionDiv);
        optionsDiv.appendChild(optionDiv);
    });
    container.appendChild(optionsDiv);
}

function selectOption(index, element) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedAnswer = index;
    document.getElementById('nextBtn').disabled = false;
}

function selectTrueFalse(isTrue, element) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedAnswer = isTrue;
    document.getElementById('nextBtn').disabled = false;
}

function selectMatchLeft(element) {
    document.querySelectorAll('.matching-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    selectedAnswer = { left: parseInt(element.dataset.index) };
}

function selectMatchRight(element) {
    if (selectedAnswer && selectedAnswer.left !== undefined) {
        const rightIndex = parseInt(element.dataset.index);
        matchingAnswers[selectedAnswer.left] = rightIndex;
        element.classList.add('matched');
        document.querySelector(`.matching-item[data-index='${selectedAnswer.left}']`).classList.add('matched');
        document.querySelectorAll('.matching-item').forEach(item => item.classList.remove('selected'));
        selectedAnswer = null;
        document.getElementById('nextBtn').disabled = Object.keys(matchingAnswers).length < questions[currentQuestion].leftItems.length;
    }
}

function checkAnswer() {
    const question = questions[currentQuestion];
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Jawapan Disemak';

    switch (question.type) {
        case 'multiple-choice':
            showMCQFeedback(question);
            break;
        case 'drag-drop':
            showDragDropFeedback(question);
            break;
        case 'matching':
            showMatchingFeedback(question);
            break;
        case 'fill-blank':
            showFillBlankFeedback(question);
            break;
        case 'true-false':
            showTrueFalseFeedback(question);
            break;
    }
}

function showMCQFeedback(question) {
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        if (idx === question.correct) {
            opt.classList.add('correct');
        } else if (opt.classList.contains('selected')) {
            opt.classList.add('incorrect');
        }
        opt.onclick = null;
    });

    if (selectedAnswer === question.correct) score++;
    userAnswers.push(selectedAnswer);
    showExplanation(question.explanation);
}

function showDragDropFeedback(question) {
    Object.keys(dragDropAnswers).forEach(zoneIdx => {
        const userIdx = dragDropAnswers[zoneIdx];
        const correctIdx = question.correctOrder[zoneIdx];
        const dropZone = document.querySelector(`.drop-zone[data-index='${zoneIdx}']`);
        if (userIdx === correctIdx) {
            dropZone.classList.add('correct');
            score++;
        } else {
            dropZone.classList.add('incorrect');
        }
    });
    userAnswers.push({ ...dragDropAnswers });
    showExplanation(question.explanation);
}

function showMatchingFeedback(question) {
    Object.keys(matchingAnswers).forEach(leftIdx => {
        const userIdx = matchingAnswers[leftIdx];
        const correctIdx = question.correctMatches[leftIdx];
        const leftItem = document.querySelector(`.matching-item[data-index='${leftIdx}']`);
        const rightItem = document.querySelector(`.matching-item[data-index='${userIdx}']`);
        if (userIdx === correctIdx) {
            leftItem.classList.add('matched');
            rightItem.classList.add('matched');
            score++;
        } else {
            rightItem.classList.add('incorrect');
        }
    });
    userAnswers.push({ ...matchingAnswers });
    showExplanation(question.explanation);
}

function showFillBlankFeedback(question) {
    const inputs = document.querySelectorAll('.blank-input');
    question.blanks.forEach((correctWord, idx) => {
        const userWord = fillBlankAnswers[idx];
        const input = inputs[idx];
        if (userWord === correctWord.toLowerCase()) {
            input.classList.add('correct');
            score++;
        } else {
            input.classList.add('incorrect');
            input.value = correctWord;
        }
        input.disabled = true;
    });
    userAnswers.push([...fillBlankAnswers]);
    showExplanation(question.explanation);
}

function showTrueFalseFeedback(question) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        const isTrueOpt = opt.textContent === 'Betul';
        if ((question.correct && isTrueOpt) || (!question.correct && !isTrueOpt)) {
            opt.classList.add('correct');
        } else if (opt.classList.contains('selected')) {
            opt.classList.add('incorrect');
        }
        opt.onclick = null;
    });
    if (selectedAnswer === question.correct) score++;
    userAnswers.push(selectedAnswer);
    showExplanation(question.explanation);
}

function showExplanation(text) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.innerHTML = `<h4>Penerangan:</h4><p>${text}</p>`;
    document.getElementById('questionContainer').appendChild(explanationDiv);
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.textContent = 'Soalan Seterusnya';
    nextBtn.onclick = goToNext;
    nextBtn.disabled = false;
}

function goToNext() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('questionScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = `${score}/${questions.length}`;
    const percent = Math.round((score / questions.length) * 100);
    document.getElementById('percentage').textContent = `${percent}%`;
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('wrongAnswers').textContent = questions.length - score;

    const feedbackMessage = document.getElementById('feedbackMessage');
    if (percent >= 80) {
        feedbackMessage.className = 'feedback excellent';
        feedbackMessage.textContent = 'Cemerlang! Pengetahuan anda kukuh.';
    } else if (percent >= 50) {
        feedbackMessage.className = 'feedback good';
        feedbackMessage.textContent = 'Bagus! Tetapi masih ada ruang peningkatan.';
    } else {
        feedbackMessage.className = 'feedback average';
        feedbackMessage.textContent = 'Sederhana. Cuba ulang kaji semula konsep.';
    }
}

function restartQuiz() {
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('progressBar').style.width = '0%';
}
