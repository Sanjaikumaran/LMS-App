import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import components from "./components";
const { Navbar } = components;

const TestSummary = ({ instructions }) => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState({
    totalQuestions: 0,
    score: 0,
    answered: 0,
    notAnswered: 0,
    skipped: 0,
  });

  useEffect(() => {
    const summary = JSON.parse(localStorage.getItem("summary") || "{}");
    // Assuming totalQuestions is calculated as answered + notAnswered + skipped
    const totalQuestions =
      summary.answered + summary.notAnswered + summary.skipped;
    setSummaryData({
      ...summary,
      totalQuestions: totalQuestions || 0,
    });
  }, []);

  return (
    <>
      <Navbar />
      <div className="instructions-div">
        <h1>Your test has been submitted!</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ul
            className="instructions"
            style={{
              color: "green",
              fontWeight: "bolder",
            }}
          >
            <li style={{ listStyle: "none" }}>
              Total Questions: {summaryData.totalQuestions}
            </li>
            <li style={{ listStyle: "none" }}>Score: {summaryData.score}</li>
            <li style={{ listStyle: "none" }}>
              Answered Questions: {summaryData.answered}
            </li>
            <li style={{ listStyle: "none" }}>
              Not Answered Questions: {summaryData.notAnswered}
            </li>
            <li style={{ listStyle: "none" }}>
              Skipped Questions: {summaryData.skipped}
            </li>
          </ul>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={() => navigate("/")}>Exit</button>
      </div>
    </>
  );
};

export default TestSummary;
