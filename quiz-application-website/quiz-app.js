// Sample question data (replace with your actual questions)
const themesDB = [
    // Theme 1
    [
        [5, "M", 1, [1, 0, 1], ["image1.jpg"],
            "Question text BG", [[1, "Correct BG"], [0, "Wrong BG"]],
            "Question text EN", [[1, "Correct EN"], [0, "Wrong EN"]]
        ],
        // Add more questions...
    ];

$(document).ready(function () {
    // Constants for question array indices
    const QuestionIndices =
    {
        POINTS: 0,
        CATEGORY: 1,
        ID: 2,
        ANSWERS: 3,
        IMAGES: 4,
        BG: 5,
        BG_ANSWERS: 6,
        EN: 7,
        EN_ANSWERS: 8
    };

    // Quiz configuration
    const Config =
    {
        language: "english",
        category: "main",
        themeId: null,
        currentTheme: null
    };

    // Quiz state
    const State =
    {
        currentQuestionIndex: 0,
        isAnswerMode: true,
        correctAnswers: 0,
        userAnswers: [],
        startTime: null
    };

    // DOM elements
    const Elements =
    {
        languageGroup: $("#languageGroup"),
        categoryGroup: $("#categoryGroup"),
        themeDropdown: $("#themeDropdown"),
        themeMenu: $("#themeMenu"),
        quizButton: $("#quizButton"),
        quizContainer: $("#quizContainer"),
        questionProgress: $("#questionProgress"),
        questionPoints: $("#questionPoints"),
        questionContent: $("#questionContent"),
        submitButton: $("#submitButton"),
        resultsContainer: $("#resultsContainer"),
        scoreText: $("#scoreText"),
        scoreProgress: $("#scoreProgress"),
        resultsList: $("#resultsList")
    };

    // Initialize the application
    function initialize() {
        setupEventListeners();
        populateThemeMenu();
    }

    // Set up event listeners
    function setupEventListeners() {
        Elements.languageGroup.on("change", "input", function () {
            Config.language = this.id;
            updateThemeMenu();
        });

        Elements.categoryGroup.on("change", "input", function () {
            Config.category = this.id;
            updateThemeMenu();
        });

        Elements.quizButton.on("click", startQuiz);
        Elements.submitButton.on("click", handleAnswerSubmission);
    }

    // Populate theme menu
    function populateThemeMenu() {
        themesDB.forEach((theme, index) => {
            const themeNumber = index + 1;
            const item = $(`
                <li>
                    <a class="dropdown-item" href="#" data-theme-id="${index}">
                        Theme ${themeNumber.toString().padStart(2, "0")} (${theme.length} questions)
                    </a>
                </li>
            `);

            Elements.themeMenu.append(item);
        });

        Elements.themeMenu.on("click", "a", function (e) {
            e.preventDefault();
            Config.themeId = $(this).data("theme-id");
            Elements.themeDropdown.text($(this).text());

            if (Config.language && Config.category) {
                Elements.quizButton.prop("disabled", false);
            }
        });
    }

    // Update theme menu based on selections
    function updateThemeMenu() {
        if (Config.language && Config.category) {
            Elements.themeDropdown.prop("disabled", false);

            if (Config.themeId !== null) {
                Elements.quizButton.prop("disabled", false);
            }
        }
    }

    // Start the quiz
    function startQuiz() {
        // Reset state
        State.currentQuestionIndex = 0;
        State.correctAnswers = 0;
        State.userAnswers = [];
        State.isAnswerMode = true;
        State.startTime = new Date();

        // Prepare questions
        prepareQuestions();

        // Show quiz container
        Elements.quizContainer.removeClass("d-none");
        Elements.resultsContainer.addClass("d-none");

        // Render first question
        renderQuestion();
    }

    // Prepare questions based on configuration
    function prepareQuestions() {
        Config.currentTheme = themesDB[Config.themeId];

        // Filter by category if needed
        if ([0, 5, 8, 10, 15, 18].includes(Config.themeId) && Config.category !== "categoryB") {
            const categoryLetter = Config.category.replace("category", "").toUpperCase();
            Config.currentTheme = Config.currentTheme.filter(question =>
                question[QuestionIndices.CATEGORY] === categoryLetter ||
                question[QuestionIndices.CATEGORY] === " ");
        }
    }

    // Render current question
    function renderQuestion() {
        const question = Config.currentTheme[State.currentQuestionIndex];
        const isEnglish = Config.language === "english";

        // Update progress display
        Elements.questionProgress.text(
            `Question ${State.currentQuestionIndex + 1} of ${Config.currentTheme.length}`);

        Elements.questionPoints.text(`${question[QuestionIndices.POINTS]} pts`);

        // Get question text
        const questionText = isEnglish ?
            question[QuestionIndices.EN] :
            question[QuestionIndices.BG];

        // Get answers
        const answers = isEnglish ?
            question[QuestionIndices.EN_ANSWERS] :
            question[QuestionIndices.BG_ANSWERS];

        // Get images
        const images = question[QuestionIndices.IMAGES];

        // Build question HTML
        let questionHtml = `<h4 class="mb-4">${questionText}</h4>`;

        if (images.length < 3) {
            // Text answers
            questionHtml += `<div class="answer-options">`;

            answers.forEach((answer, index) => {
                questionHtml += `
                    <button type="button" class="answer-option" data-answer-index="${index}">
                        ${answer[1]}
                    </button>
                `;
            });

            questionHtml += `</div>`;

            // Add image if exists
            if (images.length > 0) {
                questionHtml += `<div class="mt-4 text-center">`;
                images.forEach(image => {
                    const themeFolder = `img/${String(Config.themeId + 1).padStart(2, "0")}/`;
                    questionHtml += `<img src="${themeFolder}${image}" class="question-image img-fluid">`;
                });
                questionHtml += `</div>`;
            }
        }
        else {
            // Image answers
            questionHtml += `<div class="row image-options">`;

            images.forEach((image, index) => {
                questionHtml += `
                    <div class="col-md-6 mb-3">
                        <div class="image-option text-center" data-answer-index="${index}">
                            <img src="img/png/${image[1]}" class="img-fluid mb-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="image-${index}">
                                <label class="form-check-label" for="image-${index}">
                                    Select
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            });

            questionHtml += `</div>`;
        }

        // Update question content
        Elements.questionContent.html(questionHtml);

        // Set up answer selection
        $(".answer-option").on("click", function () {
            $(this).toggleClass("selected");
        });

        $(".image-option").on("click", function () {
            $(this).toggleClass("selected");
            $(this).find(".form-check-input").prop("checked",
                !$(this).find(".form-check-input").prop("checked"));
        });
    }

    // Handle answer submission
    function handleAnswerSubmission() {
        const question = Config.currentTheme[State.currentQuestionIndex];
        const isEnglish = Config.language === "english";
        const answers = isEnglish ?
            question[QuestionIndices.EN_ANSWERS] :
            question[QuestionIndices.BG_ANSWERS];

        const images = question[QuestionIndices.IMAGES];

        if (State.isAnswerMode) {
            // Check answers
            const userSelected = [];

            if (images.length < 3) {
                $(".answer-option").each(function (index) {
                    if ($(this).hasClass("selected")) {
                        userSelected.push(index);
                    }
                });
            }
            else {
                $(".image-option").each(function (index) {
                    if ($(this).find(".form-check-input").prop("checked")) {
                        userSelected.push(index);
                    }
                });
            }

            // Get correct answers
            const correctAnswers = [];

            if (images.length < 3) {
                answers.forEach((answer, index) => {
                    if (answer[0] === 1) {
                        correctAnswers.push(index);
                    }
                });
            }
            else {
                images.forEach((image, index) => {
                    if (image[0] === 1) {
                        correctAnswers.push(index);
                    }
                });
            }

            // Check if correct
            const isCorrect = JSON.stringify(userSelected.sort()) === JSON.stringify(correctAnswers.sort());

            if (isCorrect) {
                State.correctAnswers++;
            }

            // Store result
            State.userAnswers.push(
                {
                    question: question,
                    userSelected: userSelected,
                    correctAnswers: correctAnswers,
                    isCorrect: isCorrect
                });

            // Show correct answers
            showAnswerFeedback(correctAnswers);

            // Update button text
            Elements.submitButton.text("Next Question");
            State.isAnswerMode = false;
        }
        else {
            // Move to next question
            State.currentQuestionIndex++;

            if (State.currentQuestionIndex < Config.currentTheme.length) {
                // Render next question
                renderQuestion();
                Elements.submitButton.text("Submit Answer");
                State.isAnswerMode = true;
            }
            else {
                // Quiz completed
                showResults();
            }
        }
    }

    // Show answer feedback
    function showAnswerFeedback(correctAnswers) {
        const question = Config.currentTheme[State.currentQuestionIndex];
        const images = question[QuestionIndices.IMAGES];

        if (images.length < 3) {
            // Text answers
            $(".answer-option").each(function (index) {
                if (correctAnswers.includes(index)) {
                    $(this).addClass("correct");
                }
                else if ($(this).hasClass("selected")) {
                    $(this).addClass("incorrect");
                }
            });
        }
        else {
            // Image answers
            $(".image-option").each(function (index) {
                if (correctAnswers.includes(index)) {
                    $(this).addClass("correct");
                }
                else if ($(this).find(".form-check-input").prop("checked")) {
                    $(this).addClass("incorrect");
                }
            });
        }
    }

    // Show quiz results
    function showResults() {
        // Calculate score
        const score = Math.round((State.correctAnswers / Config.currentTheme.length) * 100);

        // Update score display
        Elements.scoreText.text(`Your Score: ${score}%`);
        Elements.scoreProgress.css("width", `${score}%`);

        // Build results list
        let resultsHtml = "";

        State.userAnswers.forEach((result, index) => {
            const isEnglish = Config.language === "english";
            const questionText = isEnglish ?
                result.question[QuestionIndices.EN] :
                result.question[QuestionIndices.BG];

            resultsHtml += `
                <div class="result-item ${result.isCorrect ? "correct" : "incorrect"}">
                    <h5>Question ${index + 1}: ${questionText}</h5>
                    <p class="mb-1">
                        <strong>Your answer:</strong> 
                        ${formatAnswer(result.userSelected, result.question, isEnglish)}
                    </p>
                    <p class="mb-0">
                        <strong>Correct answer:</strong> 
                        ${formatAnswer(result.correctAnswers, result.question, isEnglish)}
                    </p>
                </div>
            `;
        });

        Elements.resultsList.html(resultsHtml);

        // Show results container
        Elements.quizContainer.addClass("d-none");
        Elements.resultsContainer.removeClass("d-none");
    }

    // Format answer for display
    function formatAnswer(answerIndices, question, isEnglish) {
        const answers = isEnglish ?
            question[QuestionIndices.EN_ANSWERS] :
            question[QuestionIndices.BG_ANSWERS];

        const images = question[QuestionIndices.IMAGES];

        if (answerIndices.length === 0) {
            return "No answer selected";
        }

        if (images.length < 3) {
            // Text answers
            return answerIndices.map(index => answers[index][1]).join(", ");
        }
        else {
            // Image answers
            return answerIndices.map(index => `Image ${index + 1}`).join(", ");
        }
    }

    // Initialize the application
    initialize();
});