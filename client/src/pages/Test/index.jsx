/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useUser } from "../../utils/context/userContext";

import useModal from "../../utils/useModal";
import handleApiCall from "../../utils/handleAPI";

import Button from "../../utils/button";
import Input from "../../utils/input";
import ModuleCard from "../../utils/ModuleCard";

import styles from "./test.module.css";

const radius = 50;
const circumference = 2 * Math.PI * radius;

const Quiz = () => {
  const { user } = useUser();
  console.log("[Quiz] --> user", user);

  const location = useLocation();
  const navigate = useNavigate();
  const switchCount = useRef(0);
  const warned = useRef(false);
  const { isModalOpen, showModal, Modal, closeModal } = useModal();

  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const [questions, setQuestions] = useState([]);
  const [questionsGroup, setQuestionsGroup] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [highlightedOptions, setHighlightedOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [totalTime, setTotalTime] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1);
  const [endTime, setEndTime] = useState("");
  const [isAutoSubmit, setIsAutoSubmit] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = highlightedOptions[currentQuestionIndex] || [];

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
    }
  };

  useEffect(() => {
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        showModal(
          "Warning",
          "Are you sure you want to leave the test? You will lose your progress.",
          [
            { label: "Cancel", shortcut: "Escape", onClick: enterFullscreen },
            {
              label: "Yes, exit",
              shortcut: "Enter",
              onClick: () => {
                handleTestSubmit();
                exitFullscreen();
                navigate("/home");
              },
            },
          ]
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        switchCount.current += 1;

        if (switchCount.current === 1) {
          showModal(
            "Tab Switching Detected",
            "You switched tabs or lost focus. Please do not do this again or the test will end.",
            [{ label: "OK", shortcut: "Enter", onClick: enterFullscreen }]
          );
          warned.current = true;
        } else if (switchCount.current >= 2) {
          showModal(
            "Disqualified",
            "You have been disqualified for switching tabs multiple times.",
            [
              {
                label: "OK",
                shortcut: "Enter",
                onClick: () => {
                  handleTestSubmit();
                  exitFullscreen();
                  navigate("/home");
                },
              },
            ]
          );
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line
  }, [navigate, showModal]);
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen:", err);
      });
    }
  };
  useEffect(() => {
    async function fetchTestData() {
      try {
        const res = await handleApiCall({
          API: "find-data",
          data: { collection: "Tests", condition: { key: "_id", value: id } },
        });
        if (res.flag) {
          const {
            "End Time": end,
            "Questions Group": group,
            Duration,
          } = res.data.data[0];
          setEndTime(end);
          setQuestionsGroup(group);
          const [h, m, s] = Duration.split(":").map(Number);
          const durationSeconds = (h * 60 + m) * 60 + s;
          setTotalTime(durationSeconds);
          setTimeLeft(durationSeconds);
        }
      } catch (err) {
        console.log(`[Test] --> ${err.message}`);
      }
    }
    fetchTestData();
  }, [id]);

  useEffect(() => {
    async function fetchQuestions() {
      if (!questionsGroup.length) return;
      try {
        const res = await handleApiCall({
          API: "load-data",
          data: { collection: "Questions" },
        });
        if (res.flag) {
          const questionsObj = res.data.data.map((q) => {
            const { _id, Answer, ...rest } = q;
            return {
              ...rest,
              type: Answer.length > 1 ? "checkbox" : "radio",
            };
          });
          const filtered = questionsObj.filter((q) =>
            questionsGroup.includes(q.Group)
          );
          const shuffled = filtered.sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
          setSelectedOptions(Array(shuffled.length).fill("not-answered"));
        }
      } catch (err) {
        console.log(`[Test] --> ${err.message}`);
      }
    }
    fetchQuestions();
  }, [questionsGroup]);

  const handleTestSubmit = useCallback(async () => {
    setSelectedOptions(highlightedOptions);

    const summary = {
      score: 0,
      totalQuestions,
      answered: 0,
      notAnswered: 0,
      skipped: 0,
    };

    const correctAnswers = questions.map((q) =>
      q.Answer?.length === 1 ? q.Answer[0] : q.Answer
    );

    selectedOptions.forEach((userAns, index) => {
      const correct = correctAnswers[index];

      if (userAns === "skipped") summary.skipped++;
      else if (userAns === "not-answered") summary.notAnswered++;
      else {
        summary.answered++;
        if (Array.isArray(correct)) {
          if (
            Array.isArray(userAns) &&
            correct.length === userAns.length &&
            correct.every((ans) => userAns.includes(ans))
          ) {
            summary.score++;
          }
        } else if (correct === userAns) {
          summary.score++;
        }
      }
    });

    localStorage.setItem("summary", JSON.stringify(summary));

    const answerList = selectedOptions.map((ans, idx) => ({
      [questions[idx].Question]: ans,
      "Score Added": false,
      Score: 1,
    }));

    const res = await handleApiCall({
      API: "push-data",
      data: {
        collection: "Tests",
        condition: { _id: id },
        updateData: {
          "Test Results": {
            UserID: user.userId || user._id,
            Answer: JSON.stringify(answerList),
            Score: summary.score,
          },
        },
      },
    });

    showModal(
      res.flag ? "Info" : "Error",
      res.flag
        ? "Your test has been submitted!"
        : "Error submitting test. Please contact admin.",
      [
        {
          label: "Ok",
          shortcut: "Enter",
          onClick: () => {
            exitFullscreen();
            navigate("/summary");
          },
        },
      ]
    );
  }, [
    highlightedOptions,
    totalQuestions,
    questions,
    selectedOptions,
    id,
    user.userId,
    user._id,
    showModal,
    navigate,
  ]);

  const triggerAutoSubmit = useCallback(() => {
    setTotalTime(10);
    setTimeLeft(10);
    setIsAutoSubmit(true);
    setTimeout(handleTestSubmit, 10000);
    closeModal();
  }, [handleTestSubmit, closeModal]);

  const autoSubmit = useCallback(() => {
    const endDateTime = new Date(endTime).getTime();

    if ((timeLeft === 0 && !isAutoSubmit) || Date.now() > endDateTime) {
      showModal("Alert", "Time Out! \nYour test will be submitted in 10 secs", [
        { label: "Ok", shortcut: "Enter", onClick: triggerAutoSubmit },
      ]);
    }
  }, [endTime, isAutoSubmit, showModal, timeLeft, triggerAutoSubmit]);

  useEffect(() => {
    if (!questions.length) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoSubmit, questions, totalTime]);

  const confirmSubmit = () => {
    showModal("Confirm", "Are you sure you want to submit the test?", [
      {
        label: "Yes",
        shortcut: "Enter",
        onClick: () => {
          handleTestSubmit();
          closeModal();
        },
      },
      { label: "No", shortcut: "Escape", onClick: closeModal },
    ]);
  };

  const updateAnswer = (value, index = 0, type = "blanks") => {
    const updated = [...highlightedOptions];
    if (type === "paragraphs") {
      updated[currentQuestionIndex] = value;
    } else {
      updated[currentQuestionIndex] = updated[currentQuestionIndex] || [];
      updated[currentQuestionIndex][index] = value;
    }
    setHighlightedOptions(updated);
    setSelectedOptions(updated);
  };

  const handleOptionSelect = (option, type) => {
    const updated = [...highlightedOptions];
    if (type === "radio") {
      updated[currentQuestionIndex] =
        updated[currentQuestionIndex] === option ? "not-answered" : option;
    } else {
      let current = updated[currentQuestionIndex] || [];
      if (["not-answered", "skipped"].includes(current)) current = [];
      updated[currentQuestionIndex] = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      if (!updated[currentQuestionIndex].length)
        updated[currentQuestionIndex] = "not-answered";
    }
    setHighlightedOptions(updated);
    setSelectedOptions(updated);
  };

  const navigateQuestion = (direction) => {
    const updated = [...highlightedOptions];
    if (updated[currentQuestionIndex] === undefined)
      updated[currentQuestionIndex] = "not-answered";
    setHighlightedOptions(updated);
    setSelectedOptions(updated);
    setCurrentQuestionIndex((prev) =>
      direction === "Next" ? prev + 1 : prev - 1
    );
  };

  const skipQuestion = () => {
    const updated = [...highlightedOptions];
    updated[currentQuestionIndex] = "skipped";
    setHighlightedOptions(updated);
    if (currentQuestionIndex < totalQuestions - 1)
      setCurrentQuestionIndex((prev) => prev + 1);
  };

  const selectQuestionByNumber = (index) => {
    if (highlightedOptions[index] === undefined) {
      const updated = [...highlightedOptions];
      updated[index] = "not-answered";
      setHighlightedOptions(updated);
    }
    setCurrentQuestionIndex(index);
  };

  const renderBlanks = (question) => {
    const parts = question.Question.split("____");
    const answer = highlightedOptions[questions.indexOf(question)];
    return parts.map((part, idx) => (
      <React.Fragment key={idx}>
        {part}
        {idx < parts.length - 1 && (
          <input
            value={answer !== "not-answered" ? answer?.[idx] || "" : ""}
            placeholder=""
            onChange={(e) => {
              updateAnswer(e.target.value, idx);
            }}
            className={styles.fillAnswerInput}
          />
        )}
      </React.Fragment>
    ));
  };

  return (
    <>
      <div className={styles.testBody}>
        {/* Test Panel */}
        <div className={styles.testApp}>
          <div>
            {" "}
            <h1 className={styles.questionSectionHeader}>
              {currentQuestion?.Question.includes("____")
                ? renderBlanks(currentQuestion)
                : currentQuestion?.Question}
            </h1>
            {currentQuestion?.Option.includes("Paragraph") ? (
              <div>
                <textarea
                  className={styles.fillAnswerInput}
                  placeholder="Type Your Answer..."
                  value={
                    selectedOption !== "not-answered" ? selectedOption : ""
                  }
                  onChange={(e) =>
                    updateAnswer(e.target.value, 0, "paragraphs")
                  }
                />
              </div>
            ) : (
              <ul className={styles.testOptionsContainer}>
                {currentQuestion?.Option.filter((opt) => opt !== "None").map(
                  (opt, idx) => {
                    const isSelected =
                      currentQuestion.type === "radio"
                        ? selectedOption === opt
                        : selectedOption.includes(opt);
                    return (
                      <li
                        key={idx}
                        onClick={() =>
                          handleOptionSelect(opt, currentQuestion.type)
                        }
                        className={`${styles.option} ${
                          isSelected ? styles.selected : ""
                        }`}
                      >
                        <Input
                          label={opt}
                          labelClassName={styles.label}
                          className={
                            currentQuestion.type === "radio"
                              ? styles.radioInput
                              : styles.checkboxInput
                          }
                          type={currentQuestion.type}
                          value={opt}
                          checked={isSelected}
                          onChange={() =>
                            handleOptionSelect(opt, currentQuestion.type)
                          }
                        />
                      </li>
                    );
                  }
                )}
              </ul>
            )}
          </div>

          <div className={styles.testFooter}>
            <div>
              {currentQuestionIndex > 0 && (
                <Button onClick={() => navigateQuestion("Prev")}>
                  Previous
                </Button>
              )}
              <Button
                onClick={() =>
                  currentQuestionIndex === totalQuestions - 1
                    ? confirmSubmit()
                    : navigateQuestion("Next")
                }
                className={`${styles.button} ${
                  currentQuestionIndex === totalQuestions - 1
                    ? styles.submitButton
                    : ""
                }`}
              >
                {currentQuestionIndex === totalQuestions - 1
                  ? "Submit"
                  : "Next"}
              </Button>
              {currentQuestionIndex !== totalQuestions - 1 && (
                <Button className={styles.skipButton} onClick={skipQuestion}>
                  Skip
                </Button>
              )}
            </div>

            <p>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sideBar}>
          <ModuleCard header="Timer">
            <div className={styles.timerSection}>
              <div className={styles.timerCircle}>
                <svg width="120" height="120" className={styles.svg}>
                  <circle
                    className={styles.circle}
                    r={radius}
                    cx="60"
                    cy="60"
                    fill="none"
                    stroke="#e7e7e7"
                    strokeWidth="8"
                  />
                  <circle
                    className={styles.circle}
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
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className={styles.timerText}>
                  {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                </div>
              </div>
              <div>Time Remaining</div>
            </div>
          </ModuleCard>

          <ModuleCard header="Questions List">
            <div className={styles.questionNumberContainer}>
              {Array.from({ length: totalQuestions }, (_, i) => {
                const status = highlightedOptions[i];
                const statusClass =
                  status === "skipped"
                    ? styles.skipped
                    : status === "not-answered"
                    ? styles.notAnswered
                    : status
                    ? styles.answered
                    : "";

                return (
                  <div
                    key={i}
                    className={`${styles.questionNumber} ${
                      i === currentQuestionIndex ? styles.currentQuestion : ""
                    } ${statusClass}`}
                    onClick={() => selectQuestionByNumber(i)}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </ModuleCard>
        </div>
      </div>
      {isModalOpen && <Modal />}
    </>
  );
};

export default Quiz;
