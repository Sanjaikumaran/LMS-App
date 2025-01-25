import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import components from "./components";

const { handleApiCall } = components;
//const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
//if (userLogged) {
//  if (userLogged.userType !== "Student") {
//    window.location.href = "/";
//  }
//}

const AssignedQuiz = (props) => {
  const [assignedTests, setAssignedTests] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const userID = useRef(props.UserID);

  const navigate = useNavigate();
  if (props.UserID) {
    localStorage.setItem("UserID", props.UserID);
  }
  const userIDLS = localStorage.getItem("UserID");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Tests" },
        });

        if (response.flag) {
          const availableTests = response.data.data;
          const parsedUserData = JSON.parse(localStorage.getItem("userData"));

          if (parsedUserData && parsedUserData.Group) {
            const assignedTest = availableTests.filter((test) =>
              test["Participants Group"].includes(parsedUserData.Group)
            );

            setAssignedTests(assignedTest);
          } else {
            console.log("No group data found in userData.");
          }
        } else {
          console.log("No data found.");
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedTimeLeft = {};

      assignedTests.forEach((assignedTest) => {
        const startTime = new Date(assignedTest["Start Time"]);
        const endTime = new Date(assignedTest["End Time"]);
        const currentTime = new Date();

        const timeDiff = startTime - currentTime;
        const hasEnded = currentTime > endTime;
        let attempts = 0;

        assignedTest["Test Results"].forEach((testResult) => {
          if (
            testResult.UserID === userID.current ||
            testResult.UserID === userIDLS
          ) {
            attempts++;
          }
        });
        if (
          attempts != null &&
          assignedTest["Attempts Limit"] != null &&
          Number(attempts) >= Number(assignedTest["Attempts Limit"])
        ) {
          updatedTimeLeft[assignedTest._id] = "No Attempts Left";
        } else if (hasEnded) {
          updatedTimeLeft[assignedTest._id] = "ended";
        } else if (timeDiff > 0) {
          const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);
          updatedTimeLeft[assignedTest._id] = { hours, minutes, seconds };
        } else {
          updatedTimeLeft[assignedTest._id] = "available";
        }
      });

      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [assignedTests, userID, userIDLS]);
  return (
    <div className="assigned-quiz-container">
      {assignedTests.length <= 0 && (
        <div className="no-quiz-container">
          <h1>No test available</h1>
          <p>Please check back later</p>
        </div>
      )}
      {assignedTests &&
        assignedTests.map((assignedTest, index) => {
          const countdown = timeLeft[assignedTest._id];

          return (
            <div key={index} className="card-container">
              <h1 className="card-header">{assignedTest["Test Name"]}</h1>
              <div className="card-body">
                <div className="button-container">
                  <button
                    onClick={() =>
                      navigate(`/instructions?id=${assignedTest._id}`)
                    }
                    type="button"
                    className={
                      countdown === "ended"
                        ? "disabled-button"
                        : countdown !== "available"
                        ? "button"
                        : ""
                    }
                    disabled={countdown !== "available"}
                  >
                    {countdown && countdown === "ended"
                      ? "Test Ended"
                      : countdown === "available"
                      ? "Start Test"
                      : countdown && countdown.hours !== undefined
                      ? `Starts in ${countdown.hours}:${countdown.minutes}:${countdown.seconds}`
                      : countdown === "No Attempts Left"
                      ? "No Attempts Left"
                      : "" || "Loading..."}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default AssignedQuiz;
