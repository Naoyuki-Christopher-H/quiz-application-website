class QuizApp {
    constructor() {
        this.themes = [];
        this.currentTheme = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.config = { category: "main" };
        this.uiElements = {};
        this.initialize();
    }

    initialize() {
        this.initializeSampleData();
        this.renderBaseUI();
        this.cacheElements();
        this.setupEventListeners();
        this.renderThemeMenu();
        this.hideQuizElements();
    }

    initializeSampleData() {
        this.themes = [
            new QuizTheme(1, "General Knowledge", [
                new QuizQuestion(
                    1, "M", "What is the capital of France?",
                    ["London", "Paris", "Berlin", "Madrid"], [1], 5
                ),
                new QuizQuestion(
                    2, "A", "Which of these are JavaScript frameworks?",
                    ["React", "Angular", "Django", "Vue"], [0, 1, 3], 10
                )
            ]),
            new QuizTheme(2, "Web Development", [
                new QuizQuestion(
                    1, "B", "What does HTML stand for?",
                    ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
                    [0], 5
                )
            ])
        ];
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
                  ${this.renderCategoryOptions()}
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
              <h5 class="mb-0" id="questionProgress"></h5>
              <div class="badge bg-primary rounded-pill" id="questionPoints"></div>
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
                <h2 id="scoreText"></h2>
                <div class="progress mt-3" style="height: 20px;">
                  <div class="progress-bar bg-success" id="scoreProgress"></div>
                </div>
              </div>
              <div id="resultsList"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    renderCategoryOptions() {
        const categories = [
            { id: "main", label: "Main" },
            { id: "categoryA", label: "A" },
            { id: "categoryB", label: "B" }
        ];

        return categories.map(cat => `
      <input type="radio" class="btn-check" name="category" id="${cat.id}" autocomplete="off" ${cat.id === "main" ? "checked" : ""}>
      <label class="btn btn-outline-primary" for="${cat.id}">${cat.label}</label>
    `).join("");
    }

    cacheElements() {
        const elements = [
            "categoryGroup", "themeDropdown", "themeMenu", "quizButton",
            "quizDisplay", "questionProgress", "questionPoints", "questionContent",
            "submitButton", "resultsDisplay", "scoreText", "scoreProgress", "resultsList"
        ];

        elements.forEach(id => {
            this.uiElements[id] = document.getElementById(id);
        });
    }

    setupEventListeners() {
        this.uiElements.categoryGroup.addEventListener("change", (e) => {
            if (e.target.tagName === "INPUT") {
                this.setCategory(e.target.id);
            }
        });

        this.uiElements.quizButton.addEventListener("click", () => this.startQuiz());
        this.uiElements.submitButton.addEventListener("click", () => this.handleAnswerSubmission());
    }

    hideQuizElements() {
        this.uiElements.quizDisplay.style.display = "none";
        this.uiElements.resultsDisplay.style.display = "none";
    }

    renderThemeMenu() {
        this.uiElements.themeMenu.innerHTML = this.themes.map(theme => `
      <li>
        <a class="dropdown-item" href="#" data-theme-id="${theme.id}">
          ${theme.name} (${theme.questions.length} questions)
        </a>
      </li>
    `).join("");

        this.uiElements.themeMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                this.setTheme(parseInt(e.target.dataset.themeId));
                this.uiElements.themeDropdown.textContent = e.target.textContent;
                this.uiElements.quizButton.disabled = false;
            });
        });

        this.uiElements.themeDropdown.disabled = false;
    }

    setTheme(themeId) {
        this.currentTheme = this.themes.find(t => t.id === themeId);
        this.resetQuizState();
        this.currentQuestions = this.currentTheme.getQuestionsByCategory(this.config.category);
    }

    setCategory(category) {
        this.config.category = category;
        if (this.currentTheme) {
            this.currentQuestions = this.currentTheme.getQuestionsByCategory(category);
            this.resetQuizState();
        }
    }

    resetQuizState() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
    }

    startQuiz() {
        if (!this.currentTheme) {
            alert("Please select a theme first!");
            return;
        }

        this.resetQuizState();
        this.uiElements.quizDisplay.style.display = "block";
        this.uiElements.resultsDisplay.style.display = "none";
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.getCurrentQuestion();

        this.uiElements.questionProgress.textContent =
            `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
        this.uiElements.questionPoints.textContent = `${question.points} pts`;

        this.uiElements.questionContent.innerHTML = `
      <h4 class="mb-4">${question.questionText}</h4>
      <div class="options-container">
        ${question.options.map((option, index) => `
          <div class="option-card" data-option-index="${index}">
            ${option}
          </div>
        `).join("")}
      </div>
    `;

        document.querySelectorAll(".option-card").forEach(card => {
            card.addEventListener("click", () => card.classList.toggle("selected"));
        });
    }

    handleAnswerSubmission() {
        const selectedIndices = Array.from(document.querySelectorAll(".option-card.selected"))
            .map(card => parseInt(card.dataset.optionIndex));

        if (selectedIndices.length === 0) {
            alert("Please select at least one answer!");
            return;
        }

        this.submitAnswer(selectedIndices);
        this.isQuizComplete() ? this.showResults() : this.renderQuestion();
    }

    submitAnswer(selectedIndices) {
        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.checkAnswer(selectedIndices);

        this.userAnswers.push({
            question: currentQuestion,
            selectedIndices,
            isCorrect,
            timestamp: new Date()
        });

        if (isCorrect) this.score += currentQuestion.points;
        this.currentQuestionIndex++;
    }

    isQuizComplete() {
        return this.currentQuestionIndex >= this.currentQuestions.length;
    }

    showResults() {
        const score = this.calculateFinalScore();

        this.uiElements.scoreText.textContent = `Your Score: ${score}%`;
        this.uiElements.scoreProgress.style.width = `${score}%`;
        this.uiElements.resultsList.innerHTML = this.generateResultsHtml();

        this.uiElements.quizDisplay.style.display = "none";
        this.uiElements.resultsDisplay.style.display = "block";
    }

    calculateFinalScore() {
        const totalPossible = this.currentQuestions.reduce((sum, q) => sum + q.points, 0);
        return Math.round((this.score / totalPossible) * 100);
    }

    generateResultsHtml() {
        return this.userAnswers.map((userAnswer, index) => {
            const question = userAnswer.question;
            const selectedOptions = userAnswer.selectedIndices.map(i => question.options[i]).join(", ") || "No answer";
            const correctOptions = question.correctAnswers.map(i => question.options[i]).join(", ");

            return `
        <div class="result-item ${userAnswer.isCorrect ? "correct" : "incorrect"}">
          <h5>Question ${index + 1}: ${question.questionText}</h5>
          <p class="mb-1"><strong>Your answer:</strong> ${selectedOptions}</p>
          <p class="mb-0"><strong>Correct answer:</strong> ${correctOptions}</p>
        </div>
      `;
        }).join("");
    }

    getCurrentQuestion() {
        return this.currentQuestions[this.currentQuestionIndex];
    }
}

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

document.addEventListener("DOMContentLoaded", () => new QuizApp());