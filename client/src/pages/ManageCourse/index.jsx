import React, { useState, useEffect } from "react";

import { generateDescription } from "../../utils/AIHelper";
import handleApiCall from "../../utils/handleAPI";
import Button from "../../utils/button";
import ModuleCard from "../../utils/ModuleCard";
import styles from "./manageCourse.module.css";
import Input from "../../utils/input";
import Dropdown from "../../utils/select";
import useModal from "../../utils/useModal";
import { useNavigate } from "react-router-dom";
import CreateTest from "../AdminHome/components/createTest";

const ManageCourse = () => {
  const { Modal, showModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [modules, setModules] = useState([]);
  const [editMode, setEditMode] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [testData, setTestData] = useState(null);

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseDescription: "",
    courseStartDate: "",
    courseEndDate: "",
    participantsGroup: [],
    moduleTitle: "",
    moduleDescription: "",
    moduleVideo: "",
    newModuleTitle: "",
    newModuleDescription: "",
  });

  const [error, setError] = useState({
    courseTitle: "",
    courseDescription: "",
    courseStartDate: "",
    courseEndDate: "",
    participantsGroup: "",
    moduleTitle: "",
    moduleDescription: "",
    newModuleTitle: "",
    newModuleDescription: "",
  });

  const courseId = new URLSearchParams(window.location.search).get("id");

  const selectedModule = modules[selectedModuleIndex];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { flag, data } = await handleApiCall({
          API: "load-data",
          data: { collection: "Users" },
        });
        if (flag) {
          const uniqueGroups = [
            ...new Set(data.data.map((item) => item.Group)),
          ];
          setGroupData(uniqueGroups);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroups();
  }, []);
  useEffect(() => {
    console.log(testData);
  }, [testData]);
  useEffect(() => {
    if (selectedModule) {
      setFormData((prev) => ({
        ...prev,
        moduleTitle: selectedModule["Module Title"] || "",
        moduleDescription: selectedModule["Module Description"] || "",
        modulePath: selectedModule.path || "",
      }));
    }
  }, [selectedModule, selectedModuleIndex]);
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
        setFormData((prev) => ({
          ...prev,
          courseTitle: course["Course Title"],
          courseDescription: course["Course Description"],
          courseStartDate: course["Start Date"],
          courseEndDate: course["End Date"],
          participantsGroup: course["Participants Group"] || [],
        }));

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
        console.log(data.data[0]);

        setTestData(data.data[0]);
      }
    } catch (err) {
      console.log("Error fetching course data:", err.message);
    }
  };
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const updateForm = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError((prev) => ({ ...prev, [field]: "" }));
  };

  const modifyGroup = (group, type, action) => {
    if (group === "No Groups Available") return;

    const selectedKey = `participantsGroup`;

    setFormData((prev) => ({
      ...prev,
      [selectedKey]:
        action === "add"
          ? prev[selectedKey].includes(group)
            ? prev[selectedKey]
            : [...prev[selectedKey], group]
          : prev[selectedKey].filter((g) => g !== group),
    }));
  };

  const RenderSelectedGroups = ({ groups, type }) =>
    groups.length > 0 && (
      <div className={styles.selectedGroups}>
        {groups.map((group) => (
          <span key={group} className={styles.selectedGroup}>
            {group}
            <Button
              className={styles.removeGroupButton}
              onClick={() => modifyGroup(group, type, "remove")}
            >
              ×
            </Button>
          </span>
        ))}
      </div>
    );
  const validateForm = (type) => {
    const newErrors = {};
    if (type === "course") {
      if (!formData.courseTitle.trim())
        newErrors.courseTitle = "Course Title is required";
      if (!formData.courseDescription.trim())
        newErrors.courseDescription = "Course Description is required";
      if (!formData.courseStartDate)
        newErrors.courseStartDate = "Start Date is required";
      if (!formData.courseEndDate)
        newErrors.courseEndDate = "End Date is required";
      if (!formData.participantsGroup.length)
        newErrors.participantsGroup = "Participants Group is required";
    }
    if (type === "module") {
      if (!formData.moduleTitle.trim())
        newErrors.moduleTitle = "Module Title is required";
      if (!formData.moduleDescription.trim())
        newErrors.moduleDescription = "Module Description is required";
    }
    if (type === "addModule") {
      if (!formData.newModuleTitle.trim())
        newErrors.newModuleTitle = "Module Title is required";
      if (!formData.newModuleDescription.trim())
        newErrors.newModuleDescription = "Module Description is required";
      if (!formData.moduleVideo?.target?.files?.[0])
        newErrors.moduleVideo = "Module Video is required";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleUpdateCourse = async () => {
    if (!validateForm("course")) {
      return;
    }
    const {
      courseTitle,
      courseDescription,
      courseStartDate,
      courseEndDate,
      participantsGroup,
    } = formData;

    const config = {
      "Course Title": courseTitle,
      "Course Description": courseDescription,
      "Start Date": courseStartDate,
      "End Date": courseEndDate,
      "Participants Group": participantsGroup,
    };

    try {
      const { flag } = await handleApiCall({
        API: "update-data",
        data: {
          collection: "Courses",
          condition: { _id: courseId },
          data: config,
        },
      });

      if (flag) {
        showModal("Info", "Course updated successfully.", [
          { label: "Ok", shortcut: "Enter", onClick: closeModal },
        ]);
        setEditMode("");
      } else {
        showModal("Error", "Failed to update course.", [
          { label: "Ok", shortcut: "Enter", onClick: closeModal },
        ]);
        setEditMode("");
      }
    } catch (err) {
      console.log("Update Error:", err.message);
      showModal("Error", "Failed to update course.", [
        { label: "Ok", shortcut: "Enter", onClick: closeModal },
      ]);
    }
  };

  const handleUpdateModule = async () => {
    if (!validateForm("module")) {
      return;
    }
    const updatedModules = [...modules];
    updatedModules[selectedModuleIndex] = {
      ...updatedModules[selectedModuleIndex],
      "Module Title": formData.moduleTitle,
      "Module Description": formData.moduleDescription,
    };

    try {
      const { flag } = await handleApiCall({
        API: "update-data",
        data: {
          collection: "Courses",
          condition: { _id: courseId },
          data: { modules: updatedModules },
        },
      });

      if (flag) {
        setEditMode("");
        showModal("Info", "Module updated successfully.", [
          { label: "Ok", shortcut: "Enter", onClick: closeModal },
        ]);

        setModules(updatedModules);
      } else {
        setEditMode("");
        showModal("Error", "Failed to update module.", [
          { label: "Ok", shortcut: "Enter", onClick: closeModal },
        ]);
      }
    } catch (err) {
      console.log("Update Error:", err.message);
      showModal("Error", "Failed to update course.", [
        { label: "Ok", shortcut: "Enter", onClick: closeModal },
      ]);
    }
  };

  const handleVideoUpload = async (file, filename, path, courseName) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("filename", filename);
    formData.append("path", path);
    formData.append("courseName", courseName);

    try {
      const response = await fetch("http://localhost:5000/upload-video", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.flag) {
        console.log("Video uploaded successfully:", result.data);
      } else {
        console.error("Video upload failed:", result.message);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };
  const handleAddModule = async () => {
    if (!validateForm("addModule")) {
      return;
    }
    const file = formData.moduleVideo.target.files[0];
    const newModule = {
      "Module Title": formData.newModuleTitle,
      "Module Description": formData.newModuleDescription,
    };
    if (file) {
      const oldPath = selectedModule?.path || "";
      const pathParts = oldPath.split("/");

      const extension = file.name.split(".").pop();
      const newFilename = `${formData.courseTitle.replace(
        /\s+/g,
        "-"
      )}-${formData.newModuleTitle.replace(/\s+/g, "-")}.${extension}`;

      const path = [...pathParts.slice(0, -1)].join("/");
      newModule.path = path + "/" + newFilename;

      await handleVideoUpload(file, newFilename, path, formData.courseTitle);
    }

    const updatedModules = [...modules, newModule];

    try {
      const { flag } = await handleApiCall({
        API: "update-data",
        data: {
          collection: "Courses",
          condition: { _id: courseId },
          data: { modules: updatedModules },
        },
      });

      if (flag) {
        setModules(updatedModules);
        showModal("Info", "Module added successfully.", [
          { label: "Ok", shortcut: "Enter", onClick: closeModal },
        ]);
      } else {
        showModal("Error", "Failed to add module.", [
          { label: "Ok", shortcut: "Enter", onClick: closeModal },
        ]);
      }
    } catch (err) {
      console.log("Update Error:", err.message);
      showModal("Error", "Failed to add module.", [
        { label: "Ok", shortcut: "Enter", onClick: closeModal },
      ]);
    } finally {
      setEditMode("");
      setFormData((prev) => ({
        ...prev,
        newModuleTitle: "",
        newModuleDescription: "",
      }));
    }
  };
  const handleDeleteModule = async (index) => {
    if (index < 0 || index >= modules.length) return;
    showModal(
      "Confirm Module Deletion",
      "Are you sure you want to delete the module, " +
        modules[index]["Module Title"] +
        "?",
      [
        {
          label: "Cancel",
          shortcut: "Escape",
          onClick: closeModal,
        },
        {
          label: "Yes, Delete",
          shortcut: "Enter",
          onClick: async () => {
            const updatedModules = modules.filter((_, i) => i !== index);
            const { flag } = await handleApiCall({
              API: "update-data",
              data: {
                collection: "Courses",
                condition: { _id: courseId },
                data: { modules: updatedModules },
              },
            });
            if (flag) {
              setModules(updatedModules);
              setSelectedModuleIndex(0);
            }
            showModal(
              flag ? "Success" : "Error",
              flag ? "Module deleted successfully" : "Failed to delete module",
              [
                {
                  label: "Ok",
                  shortcut: "Enter",
                  onClick: closeModal,
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <>
      {editMode === "createTest" ? (
        <CreateTest
          setShowCreateTest={setEditMode}
          showModal={showModal}
          closeModal={() => {
            closeModal();
            setEditMode("");
            fetchTest();
          }}
          courseId={courseId}
        />
      ) : (
        <></>
      )}
      <div className={styles.manageCourseContainer}>
        {editMode === "course" ? (
          <div className={styles.createCourseContainer}>
            <ModuleCard header="Edit Course">
              <form className={styles.createCourseForm}>
                <Input
                  label="Course Title *"
                  value={formData.courseTitle}
                  onChange={updateForm("courseTitle")}
                  error={error.courseTitle}
                />
                <div>
                  {
                    <span
                      className={styles.hitAiButton}
                      onClick={() =>
                        generateDescription(
                          formData.courseTitle,
                          "courseDescription",
                          updateForm,
                          setError
                        )
                      }
                    >
                      ✨
                    </span>
                  }
                  <Input
                    type="textarea"
                    label={`Course Description *`}
                    value={formData.courseDescription}
                    onChange={(value) => {
                      updateForm("courseDescription")(value);
                      setError((prev) => ({ ...prev, courseDescription: "" }));
                    }}
                    error={error.courseDescription}
                  />
                </div>
                <Input
                  type="date"
                  label="Start Date *"
                  value={formData.courseStartDate}
                  onChange={updateForm("courseStartDate")}
                  error={error.courseStartDate}
                />
                <Input
                  type="date"
                  label="End Date *"
                  value={formData.courseEndDate}
                  onChange={updateForm("courseEndDate")}
                  error={error.courseEndDate}
                />
                <Dropdown
                  label="Participants Group"
                  value={
                    Array.isArray(formData.participantsGroup)
                      ? formData.participantsGroup.join(", ")
                      : "Select Groups"
                  }
                  onSelect={(value) => modifyGroup(value, "Users", "add")}
                  options={
                    groupData.length ? groupData : ["No Groups Available"]
                  }
                />
                <RenderSelectedGroups
                  groups={formData.participantsGroup}
                  type="Users"
                />
                <div className={styles.buttonContainer}>
                  <Button
                    style={{ backgroundColor: "red" }}
                    onClick={() => setEditMode("")}
                  >
                    Cancel
                  </Button>
                  <Button shortcut="Enter" onClick={handleUpdateCourse}>
                    Save
                  </Button>
                </div>
              </form>
            </ModuleCard>
          </div>
        ) : editMode === "module" ? (
          <div className={styles.createCourseContainer}>
            <ModuleCard header="Edit Module">
              <form className={styles.createCourseForm}>
                <Input
                  label="Module Title *"
                  value={formData.moduleTitle}
                  onChange={updateForm("moduleTitle")}
                  error={error.moduleTitle}
                />
                <div>
                  {
                    <span
                      className={styles.hitAiButton}
                      onClick={() =>
                        generateDescription(
                          formData.moduleTitle,
                          "moduleDescription",
                          updateForm,
                          setError
                        )
                      }
                    >
                      ✨
                    </span>
                  }
                  <Input
                    type="textarea"
                    label="Module Description *"
                    value={formData.moduleDescription || ""}
                    onChange={(value) => {
                      updateForm("moduleDescription")(value);
                      setError((prev) => ({ ...prev, moduleDescription: "" }));
                    }}
                    error={error.moduleDescription}
                  />
                </div>
                <div className={styles.buttonContainer}>
                  <Button
                    style={{ backgroundColor: "red" }}
                    onClick={() => setEditMode("")}
                  >
                    Cancel
                  </Button>
                  <Button shortcut="Enter" onClick={handleUpdateModule}>
                    Save
                  </Button>
                </div>
              </form>
            </ModuleCard>
          </div>
        ) : editMode === "addModule" ? (
          <div className={styles.createCourseContainer}>
            <ModuleCard header="Add Module">
              <form className={styles.createCourseForm}>
                <Input
                  label="Module Title *"
                  value={formData.newModuleTitle}
                  onChange={updateForm("newModuleTitle")}
                  error={error.newModuleTitle}
                />
                <div>
                  {
                    <span
                      className={styles.hitAiButton}
                      onClick={() =>
                        generateDescription(
                          formData.newModuleTitle,
                          "newModuleDescription",
                          updateForm,
                          setError
                        )
                      }
                    >
                      ✨
                    </span>
                  }
                  <Input
                    type="textarea"
                    label="Module Description *"
                    value={formData.newModuleDescription}
                    onChange={updateForm("newModuleDescription")}
                    error={error.newModuleDescription}
                  />
                </div>
                <Input
                  style={{ padding: "0" }}
                  type="file"
                  accept=".mp4, .mkv, .webm, .avi, .mov, .hevc, video/*"
                  label="Upload Module Video *"
                  onChange={(value, e) => {
                    updateForm("moduleVideo")(e);
                    setError((prev) => ({ ...prev, moduleVideo: "" }));
                  }}
                  error={error.moduleVideo}
                />
                <div className={styles.buttonContainer}>
                  <Button
                    style={{ backgroundColor: "red" }}
                    onClick={() => setEditMode("")}
                  >
                    Cancel
                  </Button>
                  <Button shortcut="Enter" onClick={handleAddModule}>
                    Save
                  </Button>
                </div>
              </form>
            </ModuleCard>
          </div>
        ) : (
          <></>
        )}
        <aside className={styles.sidebar}>
          <h3>Course Details:-</h3>
          <div className={styles.courseInfo}>
            <h2>{courseData ? courseData["Course Title"] : "Loading..."}</h2>
            <p>Start Date: {courseData?.["Start Date"]}</p>
            <p>End Date: {courseData?.["End Date"]}</p>
            <p>No. of Modules: {courseData?.modules?.length}</p>
            <Button onClick={() => setEditMode("course")}>Edit</Button>
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
                <span
                  className={styles.deleteModuleButton}
                  onClick={() => handleDeleteModule(index)}
                >
                  🗑
                </span>
              </div>
            ))}
            <Button onClick={() => setEditMode("addModule")}>
              + Add Module
            </Button>
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
            <p>No. of Attempts: {testData?.["Test Results"].length}</p>
            <Button
              onClick={() => {
                if (testData) {
                  navigate(`/manage-test?courseId=${courseId}`);
                } else {
                  setEditMode("createTest");
                }
              }}
            >
              {testData ? "Manage Test" : "Create Test"}
            </Button>
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
                    <Button
                      className={styles.moduleEditButton}
                      onClick={() => setEditMode("module")}
                    >
                      Edit Module
                    </Button>
                  </div>
                </ModuleCard>
              </div>
            </div>
          )}
        </main>
        <Modal />
      </div>
    </>
  );
};

export default ManageCourse;
