import React, { useState, useEffect } from "react";
import Input from "../../../../utils/input";
import Dropdown from "../../../../utils/select";
import { useUser } from "../../../../utils/context/userContext";
import handleApiCall from "../../../../utils/handleAPI";
import Button from "../../../../utils/button";
import styles from "./createCourse.module.css";
import { generateDescription } from "../../../../utils/AIHelper";
const CreateCourse = ({ setShowCreateCourse, showModal, closeModal }) => {
  const { user } = useUser();

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseDescription: "",
    courseStartDate: "",
    courseEndDate: "",
    moduleVideo: "",
    moduleTitle: "",
    moduleDescription: "",
    participantsGroup: [],
  });
  const [groupData, setGroupData] = useState([]);
  const [error, setError] = useState({
    courseTitle: "",
    courseDescription: "",
    courseStartDate: "",
    courseEndDate: "",
    moduleVideo: "",
    moduleTitle: "",
    moduleDescription: "",
  });
  const {
    courseTitle,
    courseDescription,
    courseStartDate,
    courseEndDate,
    moduleVideo,
    moduleTitle,
    moduleDescription,
    participantsGroup,
  } = formData;
  useEffect(() => {
    const fetchGroups = async (collection) => {
      try {
        const { flag, data } = await handleApiCall({
          API: "load-data",
          data: { collection },
        });
        if (flag) {
          const uniqueGroups = [
            ...new Set(data.data.map((item) => item.Group)),
          ];
          setGroupData((prev) => uniqueGroups);
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    fetchGroups("Users");
  }, []);
  const updateForm = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
  const validateForm = () => {
    const newErrors = {};
    if (!courseTitle.trim()) newErrors.courseTitle = "Course Title is required";
    if (!courseDescription.trim())
      newErrors.courseDescription = "Course Description is required";
    if (!courseStartDate) newErrors.courseStartDate = "Start Date is required";
    if (!courseEndDate) newErrors.courseEndDate = "End Date is required";
    if (!moduleVideo?.target?.files?.[0])
      newErrors.moduleVideo = "Module Video is required";
    if (!moduleTitle.trim()) newErrors.moduleTitle = "Module Title is required";
    if (!moduleDescription.trim())
      newErrors.moduleDescription = "Module Description is required";

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async () => {
    console.log(validateForm());

    if (!validateForm()) return;

    showModal(
      "Confirm Course Creation",
      "Are you sure you want to create this course?",
      [
        {
          label: "Cancel",
          shortcut: "Escape",
          onClick: closeModal,
        },
        {
          label: "Yes, Create",
          shortcut: "Enter",
          onClick: async () => {
            const file = moduleVideo.target.files[0];
            const filename = `${courseTitle.replace(
              /\s+/g,
              "-"
            )}-${moduleTitle.replace(/\s+/g, "-")}.${file.name
              .split(".")
              .pop()}`;
            const path = `../client/src/assets/videos/${courseTitle.replace(
              /\s+/g,
              "-"
            )}-${Date.now()}/`;

            if (file) {
              await handleVideoUpload(file, filename, path, courseTitle);
            }

            const configurations = {
              userId: user?.userId || user?._id,
              "Course Title": courseTitle,
              "Course Description": courseDescription,
              "Start Date": courseStartDate,
              "End Date": courseEndDate,
              modules: [
                {
                  "Module Title": moduleTitle,
                  "Module Description": moduleDescription,
                  path: `${path}${filename}`,
                },
              ],

              "Participants Group": participantsGroup,
            };

            try {
              const { flag } = await handleApiCall({
                API: "insert-data",
                data: { data: configurations, collection: "Courses" },
              });
              if (flag) {
                setShowCreateCourse(false);
              }
              showModal(
                flag ? "Success" : "Error",
                flag ? "Course Created Successfully" : "Course not Created",
                [
                  {
                    label: "Ok",
                    shortcut: "Enter",
                    onClick: flag
                      ? () => (window.location.href = "/admin")
                      : closeModal,
                  },
                ]
              );
            } catch (err) {
              showModal("Uncaught Error", err.message, [
                { label: "Ok", shortcut: "Enter", onClick: closeModal },
              ]);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <div className={styles.scrim}></div>
      <div className={styles.createCourseContainer}>
        <div className={styles.createCoursePanel}>
          <h1 className={styles.createCourseHeader}>Create Course</h1>
          <form className={styles.createCourseForm}>
            <Input
              label="Course Title *"
              value={courseTitle}
              onChange={(value) => {
                updateForm("courseTitle")(value);
                setError((prev) => ({ ...prev, courseTitle: "" }));
              }}
              error={error.courseTitle}
            />
            <div>
              {
                <span
                  className={styles.hitAiButton}
                  onClick={() =>
                    generateDescription(
                      courseTitle,
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
                row={4}
                label={`Course Description *`}
                value={courseDescription}
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
              value={courseStartDate}
              onChange={(value) => {
                updateForm("courseStartDate")(value);
                setError((prev) => ({
                  ...prev,
                  courseStartDate: "",
                  endTime: "",
                }));
              }}
              error={error.courseStartDate}
            />
            <Input
              type="date"
              label="End Date *"
              value={courseEndDate}
              onChange={(value) => {
                updateForm("courseEndDate")(value);
                setError((prev) => ({ ...prev, c: "", courseEndDate: "" }));
              }}
              error={error.courseEndDate}
            />
          </form>
          <h1 className={styles.createCourseHeader}>Module Details</h1>
          <form className={styles.createCourseForm}>
            <Input
              label="Module Title *"
              value={moduleTitle}
              onChange={(value) => {
                updateForm("moduleTitle")(value);
                setError((prev) => ({ ...prev, moduleTitle: "" }));
              }}
              error={error.moduleTitle}
            />
            <div>
              {
                <span
                  className={styles.hitAiButton}
                  onClick={() =>
                    generateDescription(
                      moduleTitle,
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
                row={4}
                type="textarea"
                label="Module Description *"
                value={moduleDescription}
                onChange={(value) => {
                  updateForm("moduleDescription")(value);
                  setError((prev) => ({ ...prev, moduleDescription: "" }));
                }}
                error={error.moduleDescription}
              />
            </div>
            <Input
              type="file"
              accept=".mp4, .mkv, .webm, .avi, .mov, .hevc, video/*"
              label="Upload Module Video *"
              onChange={(value, e) => {
                updateForm("moduleVideo")(e);
                setError((prev) => ({ ...prev, moduleVideo: "" }));
              }}
              error={error.moduleVideo}
            />

            <Dropdown
              label="Participants Group"
              value={participantsGroup.join(", ") || "Select Groups"}
              onSelect={(value) => modifyGroup(value, "Users", "add")}
              options={groupData.length ? groupData : ["No Groups Available"]}
            />
            <RenderSelectedGroups groups={participantsGroup} type="Users" />
          </form>
          <div className={styles.buttonContainer}>
            <Button
              shortcut={"Escape"}
              className={styles.cancelButton}
              onClick={() => setShowCreateCourse(false)}
            >
              Cancel
            </Button>
            <Button shortcut="Ctrl + S" onClick={handleSubmit}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCourse;
