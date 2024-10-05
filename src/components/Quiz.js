import React, { useState, useEffect } from "react";
import "../styles/Quiz.css";

const Quiz = ({ initialTime, questions = [] }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime); // Initial time from DB
  const [totalTime, setTotalTime] = useState(initialTime); // Also store total time
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index to track the current question
  const [selectedOptions, setSelectedOptions] = useState([]); // Store selected options for each question
  const [highlitedOptions, setHighlightedOptions] = useState([]); // Store selected options for each question

  const totalQuestions = questions.length; // Total number of questions

  // Timer logic, decrements timeLeft every second
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer); // Clear the timer on component unmount
    }
  }, [timeLeft]);

  // Handle option selection
  const handleOptionSelect = (option, type) => {
    const updatedSelections = [...highlitedOptions];

    if (type === "radio") {
      // For radio, only one option is allowed
      updatedSelections[currentQuestionIndex] = option;
    } else if (type === "checkbox") {
      // For checkboxes, toggle the option in the selected array
      const currentSelections = updatedSelections[currentQuestionIndex] || [];
      if (currentSelections.includes(option)) {
        // Remove if already selected
        updatedSelections[currentQuestionIndex] = currentSelections.filter(
          (o) => o !== option
        );
      } else {
        // Add if not selected
        updatedSelections[currentQuestionIndex] = [
          ...currentSelections,
          option,
        ];
      }
    }

    setHighlightedOptions(updatedSelections);
  };

  // Go to the next question
  const handleNextQuestion = () => {
    const selectedOptions = [...highlitedOptions];
    setSelectedOptions(selectedOptions);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Go to the next question
    }
  };

  // Go to the previous question
  const handlePreviousQuestion = () => {
    const selectedOptions = [...highlitedOptions];
    setSelectedOptions(selectedOptions);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1); // Go to the previous question
    }
  };

  // Handle quiz submission
  const handleSubmit = () => {
    console.log("Quiz Submitted:", selectedOptions);
    alert("Quiz Submitted!");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = highlitedOptions[currentQuestionIndex] || [];

  const radius = 50; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle

  return (
    <>
      {/* Top Navigation Bar */}
      <div>
        <nav className="navbar">
          <div className="logo">Company Name</div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </div>
      {/* Main Content Area */}
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
                          checked={selectedOption === option}
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

          {/* Navigation and Footer Section */}
          <div className="footer">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            <button onClick={handleNextQuestion}>Next</button>

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
                  } // Dynamic time calculation
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
                    selectedOptions[i] !== undefined ? "selected" : ""
                  }`}
                  key={i + 1}
                  onClick={() => setCurrentQuestionIndex(i)} // Allow clicking on question numbers to jump
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
