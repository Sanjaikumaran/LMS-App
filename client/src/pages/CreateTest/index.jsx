import React, { useState, useEffect } from "react";

import FileUpload from "../../utils/fileUpload";
import useModal from "../../utils/useModal";
import styles from "./createTest.module.css";
import handleApiCall from "../../utils/handleAPI";
import ModuleCard from "../../utils/ModuleCard";
import Input from "../../utils/input";
import Button from "../../utils/button";
import Dropdown from "../../utils/select";

const CreateTest = () => {
  const { Modal, showModal, closeModal } = useModal();

  const [formData, setFormData] = useState({
    testName: "",
    startTime: "",
    endTime: "",
    duration: "",
    attempts: "",
    selectedUsersGroups: [],
    selectedQuestionsGroups: [],
  });

  const [groupData, setGroupData] = useState({
    allUsersGroups: [],
    allQuestionsGroups: [],
  });

  const [error, setError] = useState({});

  const {
    testName,
    startTime,
    endTime,
    duration,
    attempts,
    selectedUsersGroups,
    selectedQuestionsGroups,
  } = formData;
  const { allUsersGroups, allQuestionsGroups } = groupData;

  useEffect(() => {
    const fetchGroups = async (collection, key) => {
      try {
        const { flag, data } = await handleApiCall({
          API: "load-data",
          data: { collection },
        });
        if (flag) {
          const uniqueGroups = [
            ...new Set(data.data.map((item) => item.Group)),
          ];
          setGroupData((prev) => ({ ...prev, [key]: uniqueGroups }));
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    fetchGroups("Users", "allUsersGroups");
    fetchGroups("Questions", "allQuestionsGroups");
  }, []);

  const updateForm = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const modifyGroup = (group, type, action) => {
    if (group === "No Groups Available") return;

    const selectedKey = `selected${type}Groups`;
    const allKey = `all${type}Groups`;

    setFormData((prev) => ({
      ...prev,
      [selectedKey]:
        action === "add"
          ? prev[selectedKey].includes(group)
            ? prev[selectedKey]
            : [...prev[selectedKey], group]
          : prev[selectedKey].filter((g) => g !== group),
    }));

    setGroupData((prev) => ({
      ...prev,
      [allKey]:
        action === "add"
          ? prev[allKey].filter((g) => g !== group)
          : [...prev[allKey], group],
    }));
  };

  const handleSubmit = async () => {
    if (!testName) {
      setError((prev) => ({ ...prev, testName: "Test Name is required" }));
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError((prev) => ({
        ...prev,
        startTime: "End time must be greater than start time.",
        endTime: "End time must be greater than start time.",
      }));
      return;
    }

    const submitCallback = async (newGroupName = "") => {
      const configurations = {
        "Test Name": testName,
        "Start Time": startTime,
        "End Time": endTime,
        Duration: duration,
        "Attempts Limit": attempts,
        "Participants Group": selectedUsersGroups,
        "Questions Group": [
          ...selectedQuestionsGroups,
          ...(newGroupName ? [newGroupName] : []),
        ],
        "Test Results": [],
      };

      try {
        const { flag } = await handleApiCall({
          API: "insert-data",
          data: { data: configurations, collection: "Tests" },
        });
        showModal(
          flag ? "Success" : "Error",
          flag ? "Test Created Successfully" : "Test not Created",
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
    };

    const file = document.querySelector("input[type=file]")?.files?.[0];
    if (file) {
      await FileUpload(
        (groupName) => {
          setFormData((prev) => ({
            ...prev,
            selectedQuestionsGroups: [
              ...prev.selectedQuestionsGroups,
              groupName,
            ],
          }));
        },
        { files: [file] },
        "Upload-question",
        "Questions",
        submitCallback
      );
    } else {
      submitCallback();
    }
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

  return (
    <>
      <div className={styles.createTestContainer}>
        <ModuleCard header="Create New Test">
          <form className={styles.createTestForm}>
            <Input
              label="Test Name *"
              value={testName}
              onChange={(value) => {
                updateForm("testName")(value);
                setError((prev) => ({ ...prev, testName: "" }));
              }}
              error={error.testName}
            />
            <Input
              type="datetime-local"
              label="Start Date and Time"
              value={startTime}
              onChange={(value) => {
                updateForm("startTime")(value);
                setError((prev) => ({ ...prev, startTime: "", endTime: "" }));
              }}
              error={error.startTime}
            />
            <Input
              type="datetime-local"
              label="End Date and Time"
              value={endTime}
              onChange={(value) => {
                updateForm("endTime")(value);
                setError((prev) => ({ ...prev, startTime: "", endTime: "" }));
              }}
              error={error.endTime}
            />
            <Input
              type="time"
              step="1"
              label="Duration (HH:MM:SS)"
              value={duration}
              onChange={updateForm("duration")}
            />
            <Input
              type="number"
              label="Attempts Limit"
              value={attempts}
              onChange={updateForm("attempts")}
            />
            <Dropdown
              label="Participants Group"
              value={selectedUsersGroups.join(", ") || "Select Groups"}
              onSelect={(value) => modifyGroup(value, "Users", "add")}
              options={
                allUsersGroups.length ? allUsersGroups : ["No Groups Available"]
              }
            />
            <RenderSelectedGroups groups={selectedUsersGroups} type="Users" />
            <Dropdown
              label="Questions Group"
              value={selectedQuestionsGroups.join(", ") || "Select Groups"}
              onSelect={(value) => modifyGroup(value, "Questions", "add")}
              options={
                allQuestionsGroups.length
                  ? allQuestionsGroups
                  : ["No Groups Available"]
              }
            />
            <RenderSelectedGroups
              groups={selectedQuestionsGroups}
              type="Questions"
            />
            <Input label="Upload Questions" type="file" />
            <Button shortcut="Ctrl + S" onClick={handleSubmit}>
              Submit
            </Button>
          </form>
        </ModuleCard>
      </div>
      <Modal />
    </>
  );
};

export default CreateTest;
