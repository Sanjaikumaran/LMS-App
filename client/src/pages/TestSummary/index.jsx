import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./summary.module.css";
import Button from "../../utils/button";
import handleApiCall from "../../utils/handleAPI";
import { useUser } from "../../utils/context/userContext";

const TestSummary = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const userId = queryParams.get("userId");
  const { user } = useUser();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);

  const fetchTestSummary = async (id) => {
    const response = await handleApiCall({
      API: "find-data",
      data: {
        collection: "Tests",
        condition: { key: "_id", value: id },
      },
    });

    if (response.flag) {
      const testResults = response.data.data[0]["Test Results"];
      const matched = testResults.find(
        (testItem) => testItem.UserID === user?.userId || user?._id || userId
      );
      if (matched && matched.Summary) {
        const parsed = JSON.parse(matched.Summary);
        parsed.title = response.data.data[0]["Test Name"];
        setSummary(parsed);
      }
    }
  };

  useEffect(() => {
    fetchTestSummary(id);
  }, [id]);

  if (!summary) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Loading test summary...</h1>
      </div>
    );
  }

  const {
    title,
    "Total Questions": TotalQuestions,
    "Correct Answers": CorrectAnswers,
    "Incorrect Answers": IncorrectAnswers,
    "Skipped Questions": SkippedQuestions,
    "Unanswered Questions": UnansweredQuestions,
    Score,
    "Scoring Details": ScoringDetails,
    Details,
    "Overall Comments": OverallComments,
  } = summary;

  return (
    <div className={styles.container}>
      <div className={styles.headingContainer}>
        <h1 className={styles.heading}>Test Summary for {title}</h1>
        <Button
          onClick={() => {
            localStorage.setItem("page", "tests");
            if (userId) {
              navigate(`/manage-test?id=${id}`);
              return;
            }
            navigate("/home");
          }}
        >
          {userId ? "Go Back" : "Go Home"}
        </Button>
      </div>

      <div className={styles.grid}>
        <Stat label="Total Questions" value={TotalQuestions} />
        <Stat label="Correct Answers" value={CorrectAnswers} />
        <Stat label="Incorrect Answers" value={IncorrectAnswers} />
        <Stat label="Skipped Questions" value={SkippedQuestions} />
        <Stat label="Unanswered Questions" value={UnansweredQuestions} />
        <Stat label="Score (%)" value={`${Score}%`} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.subHeading}>Score Breakdown</h2>
        {ScoringDetails.map((item, index) => {
          const [questionKey, [question, result]] = Object.entries(item)[0];
          return (
            <div key={index} className={styles.card}>
              <p className={styles.question}>
                {questionKey}: {question}
              </p>
              <p className={styles.suggestion}>{result}</p>
            </div>
          );
        })}
      </div>

      <div className={styles.section}>
        <h2 className={styles.subHeading}>Detailed Feedback</h2>
        {Details.map((item, index) => {
          const [questionKey, [question, userAnswer, suggestion]] =
            Object.entries(item)[0];
          return (
            <div key={index} className={styles.card}>
              <p className={styles.question}>
                {questionKey}: {question}
              </p>
              <p className={styles.answer}>
                <strong>Your Answer:</strong> {userAnswer}
              </p>
              <p className={styles.suggestion}>
                <strong>Suggestion:</strong> {suggestion}
              </p>
            </div>
          );
        })}
      </div>

      <div className={styles.section}>
        <h2 className={styles.subHeading}>Overall Comments</h2>
        <p className={styles.comment}>{OverallComments}</p>
      </div>
    </div>
  );
};

export default TestSummary;

const Stat = ({ label, value }) => (
  <div className={styles.statBox}>
    <p className={styles.statLabel}>{label}</p>
    <p className={styles.statValue}>{value}</p>
  </div>
);
