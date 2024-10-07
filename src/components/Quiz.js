import React, { useState, useEffect } from "react";
import "../styles/Quiz.css";

const Quiz = ({ initialTime, questions = [] }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [totalTime, setTotalTime] = useState(initialTime);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [highlightedOptions, setHighlightedOptions] = useState([]);
  //setTotalTime(initialTime);
  const totalQuestions = questions.length;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOptionSelect = (option, type) => {
    const updatedSelections = [...highlightedOptions];
  
    if (type === "radio") {
      // Toggle selection for radio buttons
      if (updatedSelections[currentQuestionIndex] === option) {
        updatedSelections[currentQuestionIndex] = "not-answered"; // Deselect if clicked again
      } else {
        updatedSelections[currentQuestionIndex] = option !== undefined ? option : "not-answered";
      }
    } else if (type === "checkbox") {
      const currentSelections = updatedSelections[currentQuestionIndex] || [];
  
      // Toggle checkbox selection
      if (currentSelections.includes(option)) {
        updatedSelections[currentQuestionIndex] = currentSelections.filter(o => o !== option);
      } else {
        updatedSelections[currentQuestionIndex] = [...currentSelections, option];
      }
  
      // Check if any selections are made
      if (updatedSelections[currentQuestionIndex].length === 0) {
        updatedSelections[currentQuestionIndex] = "not-answered"; // Mark as not-answered
      } else if (updatedSelections[currentQuestionIndex] === "not-answered" || updatedSelections[currentQuestionIndex] === "skipped") {
        updatedSelections[currentQuestionIndex] = []; // Clear "not-answered" status
      }
    }
  
    // Update states
    setHighlightedOptions(updatedSelections);
    setSelectedOptions(updatedSelections);
  };
  

  const handleNextQuestion = () => {
    const updatedSelections = [...highlightedOptions];

    // If no option is selected, mark as 'not-answered'
    if (updatedSelections[currentQuestionIndex] === undefined) {
      updatedSelections[currentQuestionIndex] = "not-answered";
    }

    setHighlightedOptions(updatedSelections);
    setSelectedOptions(updatedSelections);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    const updatedSelections = [...highlightedOptions];

    if (updatedSelections[currentQuestionIndex] === undefined) {
      updatedSelections[currentQuestionIndex] = "not-answered";
    }

    setHighlightedOptions(updatedSelections);
    setSelectedOptions(updatedSelections);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    const updatedSelections = [...highlightedOptions];

    updatedSelections[currentQuestionIndex] = "skipped";

    setHighlightedOptions(updatedSelections);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const handleQuestionClick = (index) => {
    const updatedSelections = [...highlightedOptions];

    // If the question is neither answered nor skipped, mark it as not-answered
    if (updatedSelections[index] === undefined) {
      updatedSelections[index] = "not-answered";
    }

    setHighlightedOptions(updatedSelections);
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    console.log("Quiz Submitted:", selectedOptions);
    alert("Quiz Submitted!");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = highlightedOptions[currentQuestionIndex] || [];

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <>
      {/* Top Navigation Bar */}
      <div>
        <nav className="navbar">
          <div className="logo">Quizzards</div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a target="_blank" href="https://sanjaikumaran.online/contact/">
              Contact
            </a>
          </div>
        </nav>
      </div>

      <div className="quiz-body">
        <div className="quiz-app">
          <div className="quiz-content">
            <div className="question-section">
              <h1>{currentQuestion?.question}</h1>
              <ul className="options">
                {currentQuestion?.options.map((option, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      handleOptionSelect(option, currentQuestion.type)
                    }
                    className={`
                option 
                ${
                  currentQuestion.type === "radio" && selectedOption === option
                    ? "selected"
                    : ""
                }
                ${
                  currentQuestion.type === "checkbox" &&
                  selectedOption.includes(option)
                    ? "selected"
                    : ""
                }
            `}
                  >
                    {currentQuestion?.type === "radio" ? (
                      <label>
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={selectedOption === option} // Will reflect deselection
                          onChange={() => handleOptionSelect(option, "radio")}
                        />
                        {option}
                      </label>
                    ) : (
                      <label>
                        <input
                          type="checkbox"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={selectedOption.includes(option)}
                          onChange={() =>
                            handleOptionSelect(option, "checkbox")
                          }
                        />
                        {option}
                      </label>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer">
            {currentQuestionIndex !== 0 ? (
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
            ) : (
              ""
            )}
            <button
              onClick={
                currentQuestionIndex !== totalQuestions - 1
                  ? handleNextQuestion
                  : handleSubmit
              }
              className={
                currentQuestionIndex !== totalQuestions - 1
                  ? ""
                  : "submit-button"
              }
            >
              {currentQuestionIndex !== totalQuestions - 1 ? "Next" : "Submit"}
            </button>
            {currentQuestionIndex !== totalQuestions - 1 && (
              <button onClick={handleSkip}>Skip</button>
            )}

            <p>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>
        <div>
          {/* Timer Section */}
          <div className="timer-section">
            <div className="timer-circle">
              <svg width="120" height="120">
                <circle
                  r={radius}
                  cx="60"
                  cy="60"
                  fill="none"
                  stroke="#e7e7e7"
                  strokeWidth="8"
                ></circle>
                <circle
                  r={radius}
                  cx="60"
                  cy="60"
                  fill="none"
                  stroke="#007BFF"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference - (timeLeft / totalTime) * circumference
                  }
                  style={{
                    transition: "stroke-dashoffset 1s linear",
                  }}
                ></circle>
              </svg>
              <div className="timer-text">
                {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
              </div>
            </div>
            <div>Time Remaining</div>
          </div>

          {/* Question Number Section */}
          <div className="question-number-container">
            <h1>Questions List</h1>
            <div className="grid-layout">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  className={`question-number ${
                    i === currentQuestionIndex ? "current-question" : ""
                  } ${
                    highlightedOptions[i] === "skipped"
                      ? "skipped"
                      : highlightedOptions[i] === "not-answered"
                      ? "not-answered"
                      : highlightedOptions[i] !== undefined
                      ? "answered"
                      : ""
                  }`}
                  key={i + 1}
                  onClick={() => handleQuestionClick(i)} // Handle question click
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;
