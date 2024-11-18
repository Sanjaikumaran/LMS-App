import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import "../styles/Quiz.css";
import components from "./components";
const { Modal, handleApiCall } = components;
const radius = 50;
const circumference = 2 * Math.PI * radius;
const userData = JSON.parse(localStorage.getItem("userData") || "{}");
const UserID = userData._id;
const Quiz = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();
  const [isAutoSubmit, setIsAutoSubmit] = useState(false);
  const [totalTime, setTotalTime] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [highlightedOptions, setHighlightedOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const [endTime, setEndTime] = useState("");

  const [questionsGroup, setQuestionsGroup] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Tests",
            condition: { key: "_id", value: id },
          },
        });

        if (response.flag) {
          const testData = response.data.data;

          setEndTime(testData["End Time"]);

          setQuestionsGroup(testData["Questions Group"]);
          const [hours, minutes, seconds] = testData.Duration.split(":").map(
            Number
          );

          setTotalTime((hours * 60 + minutes) * 60 + seconds);
          setTimeLeft((hours * 60 + minutes) * 60 + seconds);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchQuestionsData() {
      if (questionsGroup.length === 0) return;

      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Questions" },
        });

        if (response.flag) {
          const questionsObj = response.data.data.map((question) => {
            delete question["_id"];
            return {
              ...question,
              type: question.Answer.length > 1 ? "checkbox" : "radio",
            };
          });

          const filteredQuestions = questionsObj.filter(
            (question) => question && questionsGroup.includes(question.Group)
          );

          const shuffleArray = (array) => {
            return array
              .map((item) => ({ item, sort: Math.random() }))
              .sort((a, b) => a.sort - b.sort)
              .map(({ item }) => item);
          };

          const shuffledQuestions = shuffleArray(filteredQuestions);
          setQuestions(shuffledQuestions);

          setSelectedOptions(
            new Array(filteredQuestions.length).fill("not-answered")
          );
        } else {
          console.log("No questions data found.");
        }
      } catch (error) {
        console.error("Error fetching questions data:", error);
      }
    }
    fetchQuestionsData();
  }, [questionsGroup]);

  useEffect(() => {
    if (questions.length) {
      const intTimer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft === 0) {
            clearInterval(intTimer);
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);

      return () => clearInterval(intTimer);
    }
  }, [questions, totalTime]);

  useEffect(() => {
    let endDateTime = new Date(endTime);
    let currentTime = new Date();
    if ((timeLeft === 0 && !isAutoSubmit) || currentTime > endDateTime) {
      setIsModalOpen(true);
      setEndTime(currentTime.getTime() + 60000);

      setModalOptions({
        type: "Alert",
        message: "Time Out! \nYour test will be submitted in 10 secs",
        buttons: ["Ok"],
        responseFunc: () => {
          setTimeLeft(10);
          setTotalTime(10);
          autoSubmit();
          setIsModalOpen(false);
          setIsAutoSubmit(true);
        },
      });
    }
  }, [timeLeft, isAutoSubmit]);

  const autoSubmit = () => {
    const timer = setTimeout(() => {
      handleTestSubmit();
    }, 11000);

    return () => clearTimeout(timer);
  };
  const handleTestSubmit = async () => {
    if (selectedOptions.length < questions.length) {
      selectedOptions.push("not-answered");
    }

    if (selectedOptions) {
      let correctAnswers = [],
        score = 0,
        answered = 0,
        notAnswered = 0,
        skipped = 0;

      questions.forEach((question) => {
        if (!question["title"]) {
          correctAnswers.push(
            question["Answer"].length === 1
              ? question["Answer"][0]
              : question["Answer"]
          );
        }
      });

      correctAnswers.forEach((correctAnswer, index) => {
        let userAnswer = selectedOptions[index];
        if (Array.isArray(userAnswer)) {
          userAnswer = userAnswer.map((ans) => ans.trim());
        }

        if (userAnswer === "skipped") {
          skipped++;
        } else if (userAnswer === "not-answered") {
          notAnswered++;
        } else {
          answered++;
          if (Array.isArray(correctAnswer)) {
            if (
              Array.isArray(userAnswer) &&
              correctAnswer.length === userAnswer.length &&
              correctAnswer.every((ans) => userAnswer.includes(ans))
            ) {
              score++;
            }
          } else if (correctAnswer === userAnswer) {
            score++;
          }
        }
      });

      localStorage.setItem(
        "summary",
        JSON.stringify({
          score,
          totalQuestions,
          answered,
          notAnswered,
          skipped,
        })
      );

      const response = await handleApiCall({
        API: "push-data",
        data: {
          condition: { _id: id },
          collection: "Tests",
          updateData: {
            "Test Results": {
              UserID: UserID,
              Answer: JSON.stringify(selectedOptions),
              Score: score,
            },
          },
        },
      });

      setModalOptions({
        type: response.flag ? "Info" : "Error",
        message: response.flag
          ? "Your test has been submitted!"
          : "Error submitting test! \n Please contact admin",
        buttons: ["Ok"],
        responseFunc: (button) => {
          if (button === "Ok") {
            window.location.href = "/summary";
            setIsModalOpen(false);
          }
        },
      });

      setIsModalOpen(true);
    }
  };

  const handleOptionSelect = (option, type) => {
    const updatedSelections = [...highlightedOptions];

    if (type === "radio") {
      if (updatedSelections[currentQuestionIndex] === option) {
        updatedSelections[currentQuestionIndex] = "not-answered";
      } else {
        updatedSelections[currentQuestionIndex] =
          option !== undefined ? option : "not-answered";
      }
    } else if (type === "checkbox") {
      const currentSelections = updatedSelections[currentQuestionIndex] || [];

      if (currentSelections.includes(option)) {
        updatedSelections[currentQuestionIndex] = currentSelections.filter(
          (o) => o !== option
        );
      } else {
        updatedSelections[currentQuestionIndex] = [
          ...currentSelections,
          option,
        ];
      }

      if (updatedSelections[currentQuestionIndex].length === 0) {
        updatedSelections[currentQuestionIndex] = "not-answered";
      } else if (
        updatedSelections[currentQuestionIndex] === "not-answered" ||
        updatedSelections[currentQuestionIndex] === "skipped"
      ) {
        updatedSelections[currentQuestionIndex] = [];
      }
    }

    setHighlightedOptions(updatedSelections);
    setSelectedOptions(updatedSelections);
  };

  const handleQuestionNavigate = (direction) => {
    const updatedSelections = [...highlightedOptions];

    if (updatedSelections[currentQuestionIndex] === undefined) {
      updatedSelections[currentQuestionIndex] = "not-answered";
    }

    setHighlightedOptions(updatedSelections);
    setSelectedOptions(updatedSelections);

    if (currentQuestionIndex <= totalQuestions - 1) {
      setCurrentQuestionIndex(
        direction === "Next"
          ? currentQuestionIndex + 1
          : currentQuestionIndex - 1
      );
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
  const handleInputChange = (e, index) => {
    const updatedAnswers = [...highlightedOptions]; // Copy the current state

    const questionIndex = questions.indexOf(currentQuestion); // Get the current question index

    // Ensure the question has an array for its answers
    if (!updatedAnswers[questionIndex]) {
      updatedAnswers[questionIndex] = []; // Initialize as empty array if it doesn't exist
    }

    // Set the specific part of the answer at the current index
    updatedAnswers[questionIndex][index] = e.target.value;
    console.log(updatedAnswers);

    setHighlightedOptions(updatedAnswers); // Update the state with the modified answers
  };

  const handleQuestionNumberClick = (index) => {
    const updatedSelections = [...highlightedOptions];

    if (updatedSelections[index] === undefined) {
      updatedSelections[index] = "not-answered";
    }

    setHighlightedOptions(updatedSelections);
    setCurrentQuestionIndex(index);
  };
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = highlightedOptions[currentQuestionIndex] || [];

  return (
    <>
      <div className="quiz-body">
        <div className="quiz-app">
          <div className="quiz-content">
            <div className="question-section">
              <h1>
                {currentQuestion?.Question.includes("____")
                  ? currentQuestion?.Question.split("____").map(
                      (part, index) => {
                        return (
                          <React.Fragment key={index}>
                            {part}
                            {index <
                              currentQuestion?.Question.split("____").length -
                                1 && (
                              <input
                                type="text"
                                className="fill-answer-input"
                                name="answer[]"
                                required
                                value={
                                  highlightedOptions[
                                    questions.indexOf(currentQuestion)
                                  ]?.[index] || ""
                                }
                                onChange={(e) => handleInputChange(e, index)} // Update the answer at the specified index
                              />
                            )}
                          </React.Fragment>
                        );
                      }
                    )
                  : currentQuestion?.Question}
              </h1>

              <ul className="options">
                {currentQuestion?.Option.map(
                  (option, index) =>
                    option !== "None" && (
                      <li
                        key={index}
                        onClick={() =>
                          handleOptionSelect(option, currentQuestion.type)
                        }
                        className={`option ${
                          currentQuestion.type === "radio" &&
                          selectedOption === option
                            ? "selected"
                            : ""
                        }${
                          currentQuestion.type === "checkbox" &&
                          selectedOption.includes(option)
                            ? "selected"
                            : ""
                        }`}
                      >
                        {currentQuestion?.type === "radio" ? (
                          <label>
                            <input
                              type="radio"
                              name={`question-${currentQuestionIndex}`}
                              value={option}
                              checked={selectedOption === option}
                              onChange={() =>
                                handleOptionSelect(option, "radio")
                              }
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
                    )
                )}
              </ul>
            </div>
          </div>

          <div className="quiz-footer">
            {currentQuestionIndex !== 0 ? (
              <button onClick={() => handleQuestionNavigate("Prev")}>
                Previous
              </button>
            ) : (
              ""
            )}
            <button
              onClick={() => {
                return currentQuestionIndex !== totalQuestions - 1
                  ? handleQuestionNavigate("Next")
                  : handleTestSubmit();
              }}
              className={
                currentQuestionIndex !== totalQuestions - 1
                  ? ""
                  : "submit-button"
              }
            >
              {currentQuestionIndex !== totalQuestions - 1 ? "Next" : "Submit"}
            </button>
            {currentQuestionIndex !== totalQuestions - 1 && (
              <button className="skip-button" onClick={handleSkip}>
                Skip
              </button>
            )}

            <p>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>
        <div>
          {/* Timer Section */}
          <div className="timer-section">
            <h1 className="card-header">Timer</h1>
            <div className="card-body">
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
          </div>

          {/* Question Number Section */}
          <div className="question-number-section">
            <h1 className="card-header">Questions List</h1>
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
                  onClick={() => handleQuestionNumberClick(i)}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal
          modalType={modalOptions.type}
          modalMessage={modalOptions.message}
          buttons={modalOptions.buttons}
          response={modalOptions.responseFunc}
        />
      )}
    </>
  );
};

export default Quiz;
