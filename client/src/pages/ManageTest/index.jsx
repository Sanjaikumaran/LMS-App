import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import handleApiCall from "../../utils/handleAPI";
import FileUpload from "../../utils/fileUpload";
import { DataTableSection } from "../../utils/customTable";
import useModal from "../../utils/useModal";
import ModuleCard from "../../utils/ModuleCard";
import Input from "../../utils/input";
import Button from "../../utils/button";
import Dropdown from "../../utils/select";

import styles from "./manage.module.css";
import "../../assets/styles/Test.css";

const Test = () => {
  const { showModal, Modal, closeModal } = useModal();
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
  const [tableData, setTableData] = useState({
    Users: [],
    Questions: [],
    "Test Results": [],
  });
  const [tableColumns, setTableColumns] = useState({
    Users: [],
    Questions: [],
    "Test Results": [],
  });
  const [testId, setTestId] = useState("");
  const [tableName, setTableName] = useState("Users");
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [displayAnswer, setDisplayAnswer] = useState("");

  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");

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
    (async () => {
      const response = await handleApiCall({
        API: "find-data",
        data: { collection: "Tests", condition: { key: "_id", value: id } },
      });

      if (response.flag) {
        const data = response.data.data;
        setFormData({
          testName: data["Test Name"],
          startTime: data["Start Time"],
          endTime: data["End Time"],
          duration: data["Duration"],
          attempts: data["Attempts Limit"],
          selectedUsersGroups: data["Participants Group"],
          selectedQuestionsGroups: data["Questions Group"],
        });
        setTestId(data._id);
        setTableData((prev) => ({
          ...prev,
          "Test Results": data["Test Results"],
        }));
      }
    })();
  }, [id]);
  useEffect(() => {
    console.log(tableData);
  }, [tableData]);
  useEffect(() => {
    const loadData = async () => {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: "Users" },
      });
  
      if (!response.flag) return;
  
      const users = response.data.data.filter((u) => !("title" in u));
      const uniqueGroups = [...new Set(users.map((u) => u.Group))].filter(
        (g) => !selectedUsersGroups.includes(g)
      );
  
      const studentSample = users.find((u) => u.userType === "Student") || users[0] || {};
      const userColumns = [
        {
          name: "SNo",
          selector: (row, index) => index + 1,
          sortable: true,
          width: "70px",
        },
        ...Object.keys(studentSample)
          .filter((key) => !["Password", "userType", "_id", "Group"].includes(key))
          .map((key) => ({
            name: key,
            selector: (row) => row[key],
            sortable: true,
            wrap: true,
            padding: "10px",
          })),
      ];
  
      const rawResults = response.data.data.testResults || []; 
      const processedResults = rawResults.map((result, index) => {
        const matched = users.find((u) => u._id === result.UserID);
        if (!matched) return result;
  
        result.Answer = JSON.parse(result.Answer || "{}");
        const answers = Object.values(result.Answer);
  
        const answered = answers.filter((a) => {
          const key = Object.keys(a)[0];
          const value = a[key];
          return value !== "not-answered" && !value.includes("skipped");
        }).length;
  
        const skipped = answers.filter((a) => {
          const key = Object.keys(a)[0];
          return a[key].includes("skipped");
        }).length;
  
        const notAnswered = answers.filter((a) => {
          const key = Object.keys(a)[0];
          return a[key] === "not-answered";
        }).length;
  
        return {
          Name: matched?.Name || "Unknown",
          "Roll No": matched?.["Roll No"] || "N/A",
          Department: matched?.Department || "N/A",
          "Total Questions": answers.length,
          "Answered Questions": answered,
          Skipped: skipped,
          "Not Answered": notAnswered,
          ...result,
          answersObj: answers,
          Answers: (
            <button
              onClick={() => {
                setIsAnswersModalOpen(true);
                setDisplayAnswer(index);
              }}
            >
              View
            </button>
          ),
        };
      });
  
      const resultColumns = [
        {
          name: "SNo",
          selector: (row, index) => index + 1,
          sortable: true,
          width: "70px",
        },
        ...Object.keys(processedResults[0] || {}).map((key) => ({
          name: key,
          selector: (row) => row[key],
          sortable: true,
          wrap: true,
          padding: "10px",
        })),
      ];
  
      setGroupData((prev) => ({ ...prev, allUsersGroups: uniqueGroups }));
      setTableColumns((prev) => ({
        ...prev,
        Users: userColumns,
        "Test Results": resultColumns,
      }));
      setTableData((prev) => ({
        ...prev,
        Users: users,
        "Test Results": processedResults,
      }));
    };
  
    loadData();
  }, [selectedUsersGroups]);
  
  useEffect(() => {
    (async () => {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: "Questions" },
      });
      if (response.flag) {
        const data = response.data.data;
        const uniqueGroups = [...new Set(data.map((q) => q.Group))].filter(
          (g) => !selectedQuestionsGroups.includes(g)
        );
        const questions = data.filter((q) =>
          selectedQuestionsGroups.includes(q.Group)
        );
        setGroupData((prev) => ({ ...prev, allQuestionsGroups: uniqueGroups }));
        setTableData((prev) => ({ ...prev, Questions: questions }));
        const columns = [
          {
            name: "SNo",
            selector: (row, index) => index + 1,
            sortable: true,
            width: "70px",
          },
          ...Object.keys(data[0])
            .filter((column) => !["Group", "_id"].includes(column))
            .map((column) => ({
              name: column,
              selector: (row) => row[column],
              sortable: true,
              wrap: true,
              padding: "10px",
            })),
        ];

        setTableColumns((prev) => ({
          ...prev,
          Questions: columns,
        }));
      }
    })();
  }, [selectedQuestionsGroups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!testName)
      return setError((prev) => ({
        ...prev,
        testName: "Test Name is required",
      }));
    if (end <= start)
      return setError((prev) => ({
        ...prev,
        startTime: "Start must be before End",
        endTime: "End must be after Start",
      }));

    const files = document.querySelectorAll("input[type=file]");

    const submitCallback = async (newGroupName) => {
      const config = {
        "Test Name": testName,
        "Start Time": startTime,
        "End Time": endTime,
        Duration: duration,
        "Attempts Limit": attempts,
        "Participants Group": selectedUsersGroups,
        "Questions Group": [...selectedQuestionsGroups, newGroupName].filter(
          Boolean
        ),
      };

      const response = await handleApiCall({
        API: "update-data",
        data: { condition: { _id: testId }, collection: "Tests", data: config },
      });

      showModal(
        response.flag ? "Success" : "Error",
        response.flag ? "Test Updated Successfully" : response.error,
        [{ label: "Ok", shortcut: "Enter", onClick: closeModal }]
      );
    };

    if (files[0]?.files[0]) {
      await FileUpload(
        () => {},
        files[0],
        "Upload-question",
        "Questions",
        showModal,
        submitCallback
      );
    } else {
      submitCallback();
    }
  };
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
    <div>
      <div
        style={{
          display: "grid",
          padding: "20px",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        <ModuleCard header={testName}>
          <form className={styles.createTestForm} onSubmit={handleSubmit}>
            <Input
              label="Test Name *"
              value={testName}
              onChange={(value) => {
                updateForm("testName")(value);
                setError((prev) => ({ ...prev, testName: "" }));
              }}
              error={error.testName}
            />

            {[
              {
                label: "Start Date and Time",
                value: startTime,
                field: "startTime",
              },
              { label: "End Date and Time", value: endTime, field: "endTime" },
            ].map(({ label, value, field }) => (
              <Input
                key={field}
                type="datetime-local"
                label={label}
                value={value}
                onChange={(val) => {
                  updateForm(field)(val);
                  setError((prev) => ({ ...prev, startTime: "", endTime: "" }));
                }}
                onFocus={(e) => e.target?.showPicker?.()}
                error={error[field]}
              />
            ))}

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

            <Button type="submit" shortcut="ctrl+s">
              Submit
            </Button>
          </form>
        </ModuleCard>

        <div>
          <div className={styles.dataSelectorContainer}>
            <Dropdown
              value={tableName}
              label="Select Data to Show"
              options={["Users", "Questions", "Test Results"]}
              onSelect={(value) => setTableName(value)}
            />

            {tableName === "Test Results" && (
              // tableData["Test Results"].length > 0 &&
              <Button>Generate Report</Button>
            )}
          </div>

          <div
            className="data-table"
            style={{ marginTop: "25px", border: "1px solid #007bff" }}
          >
            {tableColumns && tableData && (
              <DataTableSection
                columns={tableColumns[tableName]}
                data={tableData[tableName]}
              />
            )}
          </div>
        </div>
      </div>
      {<Modal />}
    </div>
  );
};

export default Test;
