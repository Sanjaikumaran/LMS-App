import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useUser } from "../../utils/context/userContext";

import handleApiCall from "../../utils/handleAPI";

import Button from "../../utils/button";

import styles from "./home.module.css";

const AssignedQuiz = () => {
  const [assignedTests, setAssignedTests] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testResponse = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Tests",
            condition: { key: "Participants Group", value: user?.Group },
          },
        });
        const courseResponses = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Courses",
            condition: { key: "Participants Group", value: user?.Group },
          },
        });
        if (testResponse.flag) {
          const availableTests = testResponse.data.data;
          console.log(courseResponses);

          setAssignedTests(availableTests);
          setAssignedCourses(courseResponses.data.data);
        } else {
          console.log("[AssignedQuiz] --> No data found.");
        }
      } catch (error) {
        console.log(`[AssignedQuiz] --> ${error.message}`);
      }
    };

    fetchData();
  }, [user?.Group]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const updatedTimes = {};

      assignedTests.forEach((test) => {
        const startTime = new Date(test["Start Time"]);
        const endTime = new Date(test["End Time"]);

        const timeDiff = startTime - now;
        const hasEnded = now > endTime;
        let attempts = 0;

        test["Test Results"].forEach((result) => {
          if (result.UserID === user?.userId) {
            attempts++;
          }
        });

        if (
          attempts !== null &&
          test["Attempts Limit"] !== null &&
          Number(attempts) >= Number(test["Attempts Limit"])
        ) {
          updatedTimes[test._id] = "No Attempts Left";
        } else if (hasEnded) {
          updatedTimes[test._id] = "ended";
        } else if (timeDiff > 0) {
          updatedTimes[test._id] = {
            hours: Math.floor((timeDiff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((timeDiff / (1000 * 60)) % 60),
            seconds: Math.floor((timeDiff / 1000) % 60),
          };
        } else {
          updatedTimes[test._id] = "available";
        }
      });

      setTimeLeft(updatedTimes);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [assignedTests, user?.userId]);

  const getButtonLabel = (countdown) => {
    if (!countdown) return "Loading...";
    if (countdown === "ended") return "Test Ended";
    if (countdown === "available") return "Start Test";
    if (countdown === "No Attempts Left") return "No Attempts Left";
    if (countdown.hours !== undefined)
      return `Starts in ${String(countdown.hours).padStart(2, "0")}:${String(
        countdown.minutes
      ).padStart(2, "0")}:${String(countdown.seconds).padStart(2, "0")}`;
    return "Loading...";
  };

  return (
    <>
      <div className={styles.createCourse}>
        My Courses
      
      </div>
      <div className={styles.assignedQuizContainer}>
        {assignedCourses.length === 0 ? (
          <div className={styles.noTestContainer}>
            <h1>No test available</h1>
            <p>Please check back later</p>
          </div>
        ) : (
          assignedCourses.map((course) => {
            return (
              <div key={course._id} className={styles.cardContainer}>
                <h1 className={styles.cardHeader}>{course["Course Title"]}</h1>
                <div className={styles.cardBody}>
                  <div className={styles.cardsBody}>
                    <div>{course["Course Description"]}</div>
                    <div>
                      <Button
                        onClick={() => navigate(`/my-course?id=${course._id}`)}
                      >
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className={styles.createCourse}>
        My Tests
      
      </div>
      <div className={styles.assignedQuizContainer}>
      
        {assignedTests.length === 0 ? (
          <div className={styles.noTestContainer}>
            <h1>No test available</h1>
            <p>Please check back later</p>
          </div>
        ) : (
          assignedTests.map((test) => {
            const countdown = timeLeft[test._id];
            const isDisabled = countdown !== "available";

            return (
              <div key={test._id} className={styles.cardContainer}>
                <h1 className={styles.cardHeader}>{test["Test Name"]}</h1>
                <div className={styles.cardBody}>
                  <div className={styles.buttonContainer}>
                    <Button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => navigate(`/instructions?id=${test._id}`)}
                      isLoading={!countdown}
                    >
                      {getButtonLabel(countdown)}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default AssignedQuiz;
