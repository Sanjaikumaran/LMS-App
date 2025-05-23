import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../utils/button";
import useModal from "../../utils/useModal";
import ModulCard from "../../utils/ModuleCard";
import styles from "./admin.module.css";
import { useUser } from "../../utils/context/userContext";
import handleApiCall from "../../utils/handleAPI";
import CreateCourse from "./components/createCourse";
import CreateTest from "./components/createTest";
import { DataTableManagement } from "../../utils/customTable";
import { generateQuestions } from "../../utils/AIHelper";
import Dropdown from "../../utils/select";
import Input from "../../utils/input";
const Admin = ({ page }) => {
  localStorage.setItem("page", page);
  const { Modal, showModal, closeModal } = useModal();
  const { user } = useUser();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState("");
  const [showQuestionModal, setShowQuestionModal] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [aiQuestions, setAiQuestions] = useState([]);
  const [questionGroup, setQuestionGroup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fetchTestData = async () => {
    try {
      const response = await handleApiCall({
        API: "find-data",
        data: {
          collection: "Tests",
          condition: { key: "userId", value: user?.userId || user?._id },
        },
      });
      if (response.flag) {
        setTests(response.data.data);
      } else {
        console.log("[Admin Home] --> No Tests Found");
      }
    } catch (error) {
      console.log(`[Admin Home] --> ${error.message}`);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await handleApiCall({
        API: "find-data",
        data: {
          collection: "Courses",
          condition: { key: "userId", value: user?.userId || user?._id },
        },
      });
      if (response.flag) {
        setCourses(response.data.data);
      } else {
        console.log("[Admin Home] --> No Courses Found");
      }
    } catch (error) {
      console.log(`[Admin Home] --> ${error.message}`);
    }
  };

  useEffect(() => {
    if (user?._id || user?.userId) {
      fetchCourseData();
      fetchTestData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.userId]);
  const deleteItem = async (id, collection, refetchFunc) => {
    showModal("Confirm", "Are you sure you want to delete?", [
      { label: "Cancel", shortcut: "Escape", onClick: closeModal },
      {
        label: "Yes, Delete",
        shortcut: "Enter",
        onClick: async () => {
          await handleApiCall({
            API: "delete-data",
            data: { collection, data: [id] },
          });
          showModal("Success", "Deleted Successfully", [
            {
              label: "Ok",
              shortcut: "Enter",
              onClick: () => {
                refetchFunc();
                closeModal();
              },
            },
          ]);
        },
      },
    ]);
  };
  const triggerQuestionModal = async (title) => {
    const questoins = await generateQuestions(title);

    setSelectedTitle("");
    setAiQuestions(questoins);
    setIsLoading(false);
    setShowQuestionModal("aiQuestions");
  };

  const insertQuestions = async (group, questions) => {
    if (group.trim() === "") {
      setShowQuestionModal("");
      showModal("Error", "Group is required", [
        {
          label: "Ok",
          shortcut: "Enter",
          onClick: () => {
            closeModal();
            setShowQuestionModal("aiQuestions");
          },
        },
      ]);
      return;
    }
    const dataToInsert = questions.map((question) => {
      return {
        Question: question.Question,
        Option: question.Options,
        Answer: question.Answer,
        Group: group,
      };
    });
    console.log(dataToInsert);
    try {
      const { flag } = await handleApiCall({
        API: "insert-data",
        data: { collection: "Questions", data: dataToInsert },
      });
      showModal(
        flag ? "Success" : "Error",
        flag ? "Questions Added Successfully" : "Questions not Added",
        [
          {
            label: "Ok",
            shortcut: "Enter",
            onClick: ()=>{
               window.location.reload();
              closeModal();
              setShowQuestionModal(null);
            },
          },
        ]
      );
    } catch (err) {
      showModal("Uncaught Error", err.message, [
        { label: "Ok", shortcut: "Enter", onClick: closeModal },
      ]);
    }
  };
  return (
    <>
      {showCreateModal === "course" ? (
        <CreateCourse
          setShowCreateCourse={setShowCreateModal}
          showModal={showModal}
          closeModal={() => {
            closeModal();
            setShowCreateModal("");
            fetchCourseData();
          }}
        />
      ) : showCreateModal === "test" ? (
        <CreateTest
          setShowCreateTest={setShowCreateModal}
          showModal={showModal}
          closeModal={() => {
            closeModal();
            setShowCreateModal("");
            fetchTestData();
          }}
        />
      ) : (
        <></>
      )}

      {page === "course" && (
        <>
          <div className={styles.createCourse}>
            My Courses
            <Button onClick={() => setShowCreateModal("course")}>
              Create New Course
            </Button>
          </div>
          <div className={styles.cards}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className={styles.card}>
                  <h1>{course["Course Title"]}</h1>
                  <div className={styles.cardsBody}>
                    <div className={styles.content}>
                      {course["Course Description"]}
                    </div>
                    <div className={styles.buttonsContainer}>
                      <Button
                        onClick={() =>
                          navigate(`/manage-course?id=${course._id}`)
                        }
                      >
                        Manage
                      </Button>
                      <Button
                        onClick={() =>
                          deleteItem(course._id, "Courses", fetchCourseData)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        </>
      )}

      {page === "tests" && (
        <>
          <div className={styles.createCourse}>
            My Tests
            <Button onClick={() => setShowCreateModal("test")}>
              Create New Test
            </Button>
          </div>
          <div className={styles.cards}>
            {tests.length > 0 ? (
              tests.map((test) => (
                <div key={test._id} className={styles.card}>
                  <h1>{test["Test Name"]}</h1>
                  <div className={styles.cardsBody}>
                    <div className={styles.content}>
                      {test["Test Description"]}
                    </div>
                    <div className={styles.buttonsContainer}>
                      <Button
                        onClick={() => navigate(`/manage-test?id=${test._id}`)}
                      >
                        Manage
                      </Button>
                      <Button
                        onClick={() =>
                          deleteItem(test._id, "Tests", () => {
                            setTests((prev) =>
                              prev.filter((t) => t._id !== test._id)
                            );
                          })
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No tests found.</p>
            )}
          </div>
        </>
      )}
      {page === "Users" && (
        <>
          <div className={styles.createCourse}>All {page}</div>

          <div style={{ padding: "0 20px" }}>
            <DataTableManagement
              tablePageName={page}
              API={"Upload-data"}
              collectionName={page}
            />
          </div>
        </>
      )}
      {(page === "Questions" || showQuestionModal === null) && (
        <>
          <div className={styles.createCourse}>
            All {page}
            <Button onClick={() => setShowQuestionModal("selectTitle")}>
              Generate Questions
            </Button>
          </div>

          <div style={{ padding: "0 20px" }}>
            <DataTableManagement
              tablePageName={page}
              API={"Upload-question"}
              collectionName={page}
            />
          </div>
        </>
      )}
      {showQuestionModal === "selectTitle" ? (
        <>
          <div className={styles.scrim}></div>
          <div className={styles.questionModal}>
            <ModulCard header="Select Title">
              <div className={styles.questionModalBody}>
                <div>Select the course or test to generate questions for.</div>
                <br />
                <Dropdown
                  value={selectedTitle}
                  placeHolder={"Select Title"}
                  options={[
                    ...courses.map((course) => course["Course Title"]),
                    ...tests.map((test) => test["Test Name"]),
                  ]}
                  onSelect={(value) => {
                    setSelectedTitle(value);
                  }}
                />
                <div className={styles.buttonContainer}>
                  <Button
                    onClick={() => {
                      setShowQuestionModal("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      triggerQuestionModal(selectedTitle);
                      setIsLoading(true);
                    }}
                    isLoading={isLoading}
                  >
                    Generate Questions
                  </Button>
                </div>
              </div>
            </ModulCard>
          </div>
        </>
      ) : showQuestionModal === "aiQuestions" ? (
        <>
          <div className={styles.scrim}></div>

          <div className={styles.questionModal}>
            <div>
              <h1 className={styles.questionModalHeader}>Create Test</h1>
              <div
                className={styles.questionModalBody}
                style={{ width: "70vh", height: "70vh" }}
              >
                {aiQuestions.length > 0 &&
                  aiQuestions.map((question, index) => (
                    <div key={index} className={styles.questionContainer}>
                      <Input
                        label={"Question " + (index + 1)}
                        value={question.Question}
                        onChange={(value) => {
                          const newQuestions = [...aiQuestions];
                          newQuestions[index] = {
                            ...newQuestions[index],
                            Question: value,
                          };
                          setAiQuestions(newQuestions);
                        }}
                      />
                      <div className={styles.questionHelpers}>
                        <div className={styles.questionOptions}>
                          <p>Options</p>
                          {question.Options.map((option, i) => (
                            <Input
                              key={i}
                              value={option}
                              disabled={["None", "Paragraph"].includes(option)}
                              onChange={(value) => {
                                const newQuestions = [...aiQuestions];
                                const updatedOptions = [
                                  ...newQuestions[index].Options,
                                ];
                                updatedOptions[i] = value;
                                newQuestions[index].Options = updatedOptions;
                                setAiQuestions(newQuestions);
                              }}
                            />
                          ))}
                        </div>
                        <div className={styles.questionAnswers}>
                          <p>Answers</p>
                          {question.Answer.map((answer, i) => (
                            <Input
                              key={i}
                              disabled={answer === "Paragraph"}
                              value={answer}
                              onChange={(value) => {
                                const newQuestions = [...aiQuestions];
                                const updatedAnswers = [
                                  ...newQuestions[index].Answer,
                                ];
                                updatedAnswers[i] = value;
                                newQuestions[index].Answer = updatedAnswers;
                                setAiQuestions(newQuestions);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className={styles.footer}>
                {" "}
                <Input
                  label={"Enter Question Group"}
                  value={questionGroup}
                  onChange={(value) => {
                    setQuestionGroup(value);
                  }}
                />
                <div className={styles.buttonContainer}>
                  <Button
                    onClick={() => {
                      setShowQuestionModal("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      insertQuestions(questionGroup, aiQuestions);
                    }}
                  >
                    Add Questions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      <Modal />
    </>
  );
};

export default Admin;
