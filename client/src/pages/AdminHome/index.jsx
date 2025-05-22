import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../utils/button";
import useModal from "../../utils/useModal";
import styles from "./admin.module.css";
import { useUser } from "../../utils/context/userContext";
import handleApiCall from "../../utils/handleAPI";
import CreateCourse from "./components/createCourse";
import CreateTest from "./components/createTest";
import { DataTableManagement } from "../../utils/customTable";
const Admin = ({ page }) => {
  localStorage.setItem("page", page);
  const { Modal, showModal, closeModal } = useModal();
  const { user } = useUser();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState("");
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
      {page === "Questions" && (
        <>
          <div className={styles.createCourse}>All {page}</div>

          <div style={{ padding: "0 20px" }}>
            <DataTableManagement
              tablePageName={page}
              API={"Upload-question"}
              collectionName={page}
            />
          </div>
        </>
      )}

      <Modal />
    </>
  );
};

export default Admin;
