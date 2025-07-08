class QuizQuestion {
    constructor(id, category, questionText, options, correctAnswers, points, images = []) {
        this.id = id;
        this.category = category;
        this.questionText = questionText;
        this.options = options;
        this.correctAnswers = correctAnswers;
        this.points = points;
        this.images = images;
    }

    checkAnswer(selectedIndices) {
        const sortedSelected = [...selectedIndices].sort();
        const sortedCorrect = [...this.correctAnswers].sort();
        return JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    }
}

class QuizTheme {
    constructor(id, name, questions) {
        this.id = id;
        this.name = name;
        this.questions = questions;
    }

    getQuestionsByCategory(category) {
        return this.questions.filter(q => q.category === category || q.category === " ");
    }
}

class QuizManager {
    constructor() {
        this.themes = [];
        this.currentTheme = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.config =
        {
            category: "main"
        };
    }

    initializeSampleData() {
        const theme1Questions = [
            new QuizQuestion(
                1,
                "M",
                "What is the capital of France?",
                ["London", "Paris", "Berlin", "Madrid"],
                [1],
                5
            ),
            new QuizQuestion(
                2,
                "A",
                "Which of these are JavaScript frameworks?",
                ["React", "Angular", "Django", "Vue"],
                [0, 1, 3],
                10
            )
        ];

        const theme2Questions = [
            new QuizQuestion(
                1,
                "B",
                "What does HTML stand for?",
                [
                    "Hyper Text Markup Language",
                    "Home Tool Markup Language",
                    "Hyperlinks and Text Markup Language"
                ],
                [0],
                5
            )
        ];

        this.themes = [
            new QuizTheme(1, "General Knowledge", theme1Questions),
            new QuizTheme(2, "Web Development", theme2Questions)
        ];
    }

    setTheme(themeId) {
        this.currentTheme = this.themes.find(t => t.id === themeId);
        this.currentQuestions = this.currentTheme.getQuestionsByCategory(this.config.category);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
    }

    setCategory(category) {
        this.config.category = category;
        if (this.currentTheme) {
            this.currentQuestions = this.currentTheme.getQuestionsByCategory(category);
        }
    }

    getCurrentQuestion() {
        return this.currentQuestions[this.currentQuestionIndex];
    }

    submitAnswer(selectedIndices) {
        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.checkAnswer(selectedIndices);

        this.userAnswers.push(
            {
                question: currentQuestion,
                selectedIndices: selectedIndices,
                isCorrect: isCorrect,
                timestamp: new Date()
            });

        if (isCorrect) {
            this.score += currentQuestion.points;
        }

        this.currentQuestionIndex++;
        return isCorrect;
    }

    isQuizComplete() {
        return this.currentQuestionIndex >= this.currentQuestions.length;
    }

    getFinalScore() {
        const totalPossible = this.currentQuestions.reduce((sum, q) => sum + q.points, 0);
        return Math.round((this.score / totalPossible) * 100);
    }
}

class QuizUI {
    constructor(quizManager) {
        this.quizManager = quizManager;
        this.uiElements = {};
    }

    initialize() {
        this.renderBaseUI();
        this.cacheElements();
        this.setupEventListeners();
        this.quizManager.initializeSampleData();
        this.renderThemeMenu();
    }

    renderBaseUI() {
        document.getElementById("app").innerHTML = `
            <div class="quiz-container">
                <div class="quiz-card card mb-4">
                    <div class="card-header">
                        <h4 class="mb-0">Quiz Configuration</h4>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-12">
                                <h5 class="mb-3">Category</h5>
                                <div class="btn-group w-100" role="group" id="categoryGroup">
                                    <input type="radio" class="btn-check" name="category" id="main" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="main">Main</label>
                                    
                                    <input type="radio" class="btn-check" name="category" id="categoryA" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="categoryA">A</label>
                                    
                                    <input type="radio" class="btn-check" name="category" id="categoryB" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="categoryB">B</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-12">
                                <h5 class="mb-3">Select Theme</h5>
                                <div class="dropdown w-100">
                                    <button class="btn btn-light border dropdown-toggle w-100 text-start" 
                                            type="button" id="themeDropdown" data-bs-toggle="dropdown" 
                                            aria-expanded="false" disabled>
                                        Select a theme
                                    </button>
                                    <ul class="dropdown-menu w-100" aria-labelledby="themeDropdown" id="themeMenu"></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <button type="button" class="btn btn-primary btn-lg px-5" id="quizButton" disabled>
                        Start Quiz
                    </button>
                </div>
                
                <div id="quizDisplay">
                    <div class="quiz-card card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0" id="questionProgress">Question 1 of 10</h5>
                            <div class="badge bg-primary rounded-pill" id="questionPoints">5 pts</div>
                        </div>
                        <div class="card-body" id="questionContent"></div>
                        <div class="card-footer bg-white">
                            <button type="button" class="btn btn-primary w-100" id="submitButton">
                                Submit Answer
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="resultsDisplay">
                    <div class="quiz-card card mb-4">
                        <div class="card-header">
                            <h4 class="mb-0">Quiz Results</h4>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-4">
                                <h2 id="scoreText">Your Score: 80%</h2>
                                <div class="progress mt-3" style="height: 20px;">
                                    <div class="progress-bar bg-success" id="scoreProgress" style="width: 80%"></div>
                                </div>
                            </div>
                            <div id="resultsList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    cacheElements() {
        this.uiElements =
        {
            categoryGroup: document.getElementById("categoryGroup"),
            themeDropdown: document.getElementById("themeDropdown"),
            themeMenu: document.getElementById("themeMenu"),
            quizButton: document.getElementById("quizButton"),
            quizDisplay: document.getElementById("quizDisplay"),
            questionProgress: document.getElementById("questionProgress"),
            questionPoints: document.getElementById("questionPoints"),
            questionContent: document.getElementById("questionContent"),
            submitButton: document.getElementById("submitButton"),
            resultsDisplay: document.getElementById("resultsDisplay"),
            scoreText: document.getElementById("scoreText"),
            scoreProgress: document.getElementById("scoreProgress"),
            resultsList: document.getElementById("resultsList")
        };
    }

    setupEventListeners() {
        this.uiElements.categoryGroup.addEventListener("change", (e) => {
            if (e.target.tagName === "INPUT") {
                this.quizManager.setCategory(e.target.id);
            }
        });

        this.uiElements.quizButton.addEventListener("click", () => {
            this.startQuiz();
        });

        this.uiElements.submitButton.addEventListener("click", () => {
            this.handleAnswerSubmission();
        });
    }

    renderThemeMenu() {
        this.uiElements.themeMenu.innerHTML = "";

        this.quizManager.themes.forEach(theme => {
            const item = document.createElement("li");
            item.innerHTML = `
                <a class="dropdown-item" href="#" data-theme-id="${theme.id}">
                    ${theme.name} (${theme.questions.length} questions)
                </a>
            `;

            item.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                const themeId = parseInt(e.target.dataset.themeId);
                this.quizManager.setTheme(themeId);
                this.uiElements.themeDropdown.textContent = e.target.textContent;
                this.uiElements.quizButton.disabled = false;
            });

            this.uiElements.themeMenu.appendChild(item);
        });

        this.uiElements.themeDropdown.disabled = false;
    }

    startQuiz() {
        this.uiElements.quizDisplay.style.display = "block";
        this.uiElements.resultsDisplay.style.display = "none";
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.quizManager.getCurrentQuestion();

        this.uiElements.questionProgress.textContent =
            `Question ${this.quizManager.currentQuestionIndex + 1} of ${this.quizManager.currentQuestions.length}`;

        this.uiElements.questionPoints.textContent = `${question.points} pts`;

        let optionsHtml = "";
        question.options.forEach((option, index) => {
            optionsHtml += `
                <div class="option-card" data-option-index="${index}">
                    ${option}
                </div>
            `;
        });

        this.uiElements.questionContent.innerHTML = `
            <h4 class="mb-4">${question.questionText}</h4>
            <div class="options-container">
                ${optionsHtml}
            </div>
        `;

        document.querySelectorAll(".option-card").forEach(card => {
            card.addEventListener("click", () => {
                card.classList.toggle("selected");
            });
        });
    }

    handleAnswerSubmission() {
        const selectedIndices = [];
        document.querySelectorAll(".option-card.selected").forEach(card => {
            selectedIndices.push(parseInt(card.dataset.optionIndex));
        });

        const isCorrect = this.quizManager.submitAnswer(selectedIndices);

        if (this.quizManager.isQuizComplete()) {
            this.showResults();
        }
        else {
            this.renderQuestion();
        }
    }

    showResults() {
        const score = this.quizManager.getFinalScore();

        this.uiElements.scoreText.textContent = `Your Score: ${score}%`;
        this.uiElements.scoreProgress.style.width = `${score}%`;

        let resultsHtml = "";
        this.quizManager.userAnswers.forEach((userAnswer, index) => {
            const question = userAnswer.question;
            const selectedOptions = userAnswer.selectedIndices.map(i => question.options[i]).join(", ");
            const correctOptions = question.correctAnswers.map(i => question.options[i]).join(", ");

            resultsHtml += `
                <div class="result-item ${userAnswer.isCorrect ? "correct" : "incorrect"}">
                    <h5>Question ${index + 1}: ${question.questionText}</h5>
                    <p class="mb-1"><strong>Your answer:</strong> ${selectedOptions || "No answer"}</p>
                    <p class="mb-0"><strong>Correct answer:</strong> ${correctOptions}</p>
                </div>
            `;
        });

        this.uiElements.resultsList.innerHTML = resultsHtml;
        this.uiElements.quizDisplay.style.display = "none";
        this.uiElements.resultsDisplay.style.display = "block";
    }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const quizManager = new QuizManager();
    const quizUI = new QuizUI(quizManager);
    quizUI.initialize();
});