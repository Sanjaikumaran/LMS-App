import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import handleApiCall from "../../utils/handleAPI";

import ModuleCard from "../../utils/ModuleCard";
import styles from "./manageCourse.module.css";
import Button from "../../utils/button";

const ManageCourse = () => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [modules, setModules] = useState([]);
  const [testData, setTestData] = useState(null);

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

  const courseId = new URLSearchParams(window.location.search).get("id");
  const selectedModule = modules[selectedModuleIndex];

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { flag, data } = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Courses",
            condition: { key: "_id", value: courseId },
          },
        });

        if (flag && data.data.length) {
          const course = data.data[0];

          setCourseData(course);
          setModules(course.modules || []);
        }
      } catch (err) {
        console.log("Error fetching course data:", err.message);
      }
    };
    const fetchTest = async () => {
      try {
        const { flag, data } = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Tests",
            condition: { key: "courseId", value: courseId },
          },
        });

        if (flag && data.data.length) {
          setTestData(data.data[0]);
        }
      } catch (err) {
        console.log("Error fetching course data:", err.message);
      }
    };
    fetchTest();
    fetchCourseData();
  }, [courseId]);

  return (
    <div className={styles.manageCourseContainer}>
      <aside className={styles.sidebar}>
        <h3>Course Details:-</h3>
        <div className={styles.courseInfo}>
          <h2>{courseData ? courseData["Course Title"] : "Loading..."}</h2>
          <p>
            Duration: {courseData?.["Start Date"]} to {courseData?.["End Date"]}
          </p>
          <p>No. of Modules: {courseData?.modules?.length}</p>
        </div>

        <h3>Modules:-</h3>
        <div className={styles.courseInfo}>
          {modules.map((mod, index) => (
            <div
              key={index}
              className={`${styles.moduleItem} ${
                selectedModuleIndex === index ? styles.active : ""
              }`}
              onClick={() => setSelectedModuleIndex(index)}
            >
              <span> {mod["Module Title"]}</span>
            </div>
          ))}
        </div>

        <h3>Course Test:-</h3>
        <div className={styles.courseInfo}>
          <h2>{testData ? testData["Test Name"] : "No Test Created Yet"}</h2>
          <p>
            Start date:
            {testData?.["Start Time"].split("T")[0].split("-").join("/")}
          </p>
          <p>
            End date:
            {testData?.["End Time"].split("T")[0].split("-").join("/")}
          </p>
          <p>Duration: {testData?.Duration}</p>
          <p>Attempts Limit: {testData?.["Attempts Limit"]}</p>
          {testData && (
            <Button
              onClick={() => navigate(`/instructions?id=${testData?._id}`)}
            >
              Goto Test
            </Button>
          )}
        </div>
      </aside>
      <main className={styles.moduleContent}>
        {selectedModule && (
          <div
            style={{
              padding: "20px",
              // width: "100%",
              display: "flex",
              columnGap: "20px",
              justifyContent: "space-between",
              // height: "70vh",
              flexDirection: "row",
            }}
          >
            {selectedModule.path && (
              <video controls>
                <source
                  src={require(`../../assets/videos/${selectedModule.path
                    .split("/")
                    .slice(-2)
                    .join("/")}`)}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}
            <div style={{ width: "400px", display: "flex" }}>
              <ModuleCard header={selectedModule["Module Title"]}>
                <div className={styles.moduleDetails}>
                  <p>{selectedModule["Module Description"]}</p>
                </div>
              </ModuleCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageCourse;
