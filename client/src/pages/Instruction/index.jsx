import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useModal from "../../utils/useModal";
import handleApiCall from "../../utils/handleAPI";
import Button from "../../utils/button";

import styles from "./instructions.module.css";

const Instructions = ({ instruction }) => {
  const navigate = useNavigate();
  const { showModal, closeModal, Modal } = useModal();
  const [testData, setTestData] = useState({
    testName: "",
    startTime: "",
    endTime: "",
    duration: "",
    attempts: "",
    instructions: [],
  });
  const {
    testName,
    testDescription,
    startTime,
    endTime,
    duration,
    attempts,
    instructions,
  } = testData;

  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { flag, data } = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Tests",
            condition: { key: "_id", value: id },
          },
        });

        if (flag && data.data.length) {
          const test = data.data[0];
          setTestData({
            testName: test["Test Name"],
            testDescription: test["Test Description"],
            startTime: test["Start Time"],
            endTime: test["End Time"],
            duration: test["Duration"],
            attempts: test["Attempts Limit"],
            instructions: test["Instructions"]?.length
              ? test["Instructions"]
              : instruction,
          });
        }
      } catch (err) {
        console.log("Error fetching course data:", err.message);
      }
    };
    fetchTest();
  }, [id, instruction]);
  const handleButtonClick = () => {
    showModal("Confirm", "Are you sure to start the test?", [
      {
        label: "Yes",
        shortcut: "Enter",
        onClick: () => navigate(`/quiz?id=${id}`),
      },
      { label: "No", shortcut: "Escape", onClick: () => closeModal },
    ]);
  };

  return (
    <>
      <main className={styles.instructionMain}>
        {" "}
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <h1
              style={{
                color: "#080c2ba6",
                borderRight: "1px solid #e1e1e3",
              }}
            >
              Title
            </h1>
            <h1>{testName}</h1>
          </div>
          <div className={styles.detailCardBody}>
            <p>Description:</p>
            <p style={{ color: "#080c2bd9" }}>{testDescription}</p>
            <hr />
            <div className={styles.detailsColumn}>
              <div>
                <p>Start Date:</p>
                <p style={{ color: "#080c2bd9" }}>{startTime.split("T")[0]}</p>
              </div>
              <div>
                <p>End Date:</p>
                <p style={{ color: "#080c2bd9" }}>{endTime.split("T")[0]}</p>
              </div>
            </div>
            <div className={styles.detailsColumn}>
              <div>
                <p>Duration:</p>
                <p style={{ color: "#080c2bd9" }}>{duration}</p>
              </div>
              <div>
                <p>Attempts Limit:</p>
                <p style={{ color: "#080c2bd9" }}>{attempts}</p>
              </div>
            </div>

            {/* {courseId && (<hr/>)} */}
          </div>
          {/* {courseId && (
                          <>
                            <div className={styles.detailCardHeader}>
                              <h1
                                style={{
                                  color: "#080c2ba6",
                                  borderRight: "1px solid #e1e1e3",
                                }}
                              >
                                Course
                              </h1>
                              <h1>{courseDetails["Course Title"]}</h1>
                            </div>
                            <div className={styles.detailCardBody}>
                              
                              <p>Description:</p>
                              <p style={{ color: "#080c2bd9" }}>
                                {courseDetails["Course Description"]}
                              </p>
                              <hr />
                              <div className={styles.detailsColumn}>
                                <div>
                                  
                                  <p>Start Date:</p>
                                  <p style={{ color: "#080c2bd9" }}>
                                    {courseDetails["Start Date"]}
                                  </p>
                                </div>
                                <div>
                                  
                                  <p>End Date:</p>
                                  <p style={{ color: "#080c2bd9" }}>
                                    {courseDetails["End Date"]}
                                  </p>
                                </div>
                              </div>
                              <div className={styles.detailsColumn}>
                                <div>
                                  
                                  <p>No of Modules:</p>
                                  <p style={{ color: "#080c2bd9" }}>
                                    {courseDetails["modules"]?.length}
                                  </p>
                                </div>
                                <div>
                                  
                                  <p>Participants</p>
                                  {courseDetails["Participants Group"]?.map((group) => (
                                    <p style={{ color: "#080c2bd9" }}>{group}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )} */}
        </div>
        <div className={styles.testDetailsContainer}></div>
        <div className={styles.instructionsContainer}>
          <h1 className={styles.instructionsTitle}>Instructions</h1>
          <p className={styles.instructionsDescription}>
            Please read the following instructions carefully before starting the
            test.
          </p>
          <ul>
            {instructions?.map((instruction, index) => (
              <li key={index} className={styles.instructionsList}>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <div className={styles.buttonContainer}>
        <Button onClick={handleButtonClick}>Start Test</Button>

        <Modal />
      </div>
    </>
  );
};

export default Instructions;
