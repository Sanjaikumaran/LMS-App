import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../utils/button";

const TestSummary = () => {
  const navigate = useNavigate();
  //eslint-disable-next-line
  const [summaryData, setSummaryData] = useState({
    totalQuestions: 0,
    score: 0,
    answered: 0,
    notAnswered: 0,
    skipped: 0,
  });

  useEffect(() => {
    const summary = JSON.parse(localStorage.getItem("summary") || "{}");

    const totalQuestions =
      summary.answered + summary.notAnswered + summary.skipped;
    setSummaryData({
      ...summary,
      totalQuestions: totalQuestions || 0,
    });
  }, []);

  return (
    <>
      <div className="instructions-div">
        <h1
          style={{
            fontSize: "5rem",
          }}
        >
          Your test has been submitted!
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/*<ul
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
          </ul>*/}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            navigate("/");
          }}
        >
          Exit
        </Button>
      </div>
    </>
  );
};

export default TestSummary;
