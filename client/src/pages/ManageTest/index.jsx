import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import handleApiCall from "../../utils/handleAPI";
import { generateDescription } from "../../utils/AIHelper";
import FileUpload from "../../utils/fileUpload";
import { DataTableSection } from "../../utils/customTable";
import useModal from "../../utils/useModal";

import Input from "../../utils/input";
import Button from "../../utils/button";
import Dropdown from "../../utils/select";

import styles from "./manage.module.css";
// import "../../assets/styles/Test.css";

const Test = () => {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");

  const navigate = useNavigate();
  const { showModal, Modal, closeModal } = useModal();
  const [courseDetails, setCourseDetails] = useState({});

  const [formData, setFormData] = useState({
    testName: "",
    startTime: "",
    endTime: "",
    duration: "",
    attempts: "",
    selectedUsersGroups: [],
    selectedQuestionsGroups: [],
    instructions: [""],
  });
  const [groupData, setGroupData] = useState({
    allUsersGroups: [],
    allQuestionsGroups: [],
  });
  const [error, setError] = useState({});
  const [tableData, setTableData] = useState({
    Participants: [],
    Questions: [],
    "Test Results": [],
  });
  const [tableColumns, setTableColumns] = useState({
    Participants: [],
    Questions: [],
    "Test Results": [],
  });
  const [testId, setTestId] = useState("");
  const [tableName, setTableName] = useState("Participants");
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [displayAnswer, setDisplayAnswer] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [courseId, setCourseId] = useState(
    new URLSearchParams(location.search).get("courseId")
  );
  const tabs = ["Overview", "Participants", "Questions", "Test Results"];

  const {
    testName,
    testDescription,
    startTime,
    endTime,
    duration,
    attempts,
    selectedUsersGroups,
    selectedQuestionsGroups,
    instructions,
  } = formData;
  const { allUsersGroups, allQuestionsGroups } = groupData;
  const [instruction, setInstruction] = useState(instructions || [""]);
  const fetchCourseData = async (courseId) => {
    const response = await handleApiCall({
      API: "find-data",
      data: {
        collection: "Courses",
        condition: { key: "_id", value: courseId },
      },
    });
    if (response.flag) {
      const data = response.data.data[0];
      setCourseDetails(data);
    }
  };
  const fetchTest = async () => {
    const response = await handleApiCall({
      API: "find-data",
      data: {
        collection: "Tests",
        condition: id
          ? { key: "_id", value: id }
          : { key: "courseId", value: courseId },
      },
    });

    if (response.flag) {
      const data = response.data.data[0];
      if (data?.courseId) {
        fetchCourseData(data.courseId);
        setCourseId(data.courseId);
      }
      setFormData({
        testName: data["Test Name"],
        testDescription: data["Test Description"],
        startTime: data["Start Time"],
        endTime: data["End Time"],
        duration: data["Duration"],
        attempts: data["Attempts Limit"],
        selectedUsersGroups: data["Participants Group"],
        selectedQuestionsGroups: data["Questions Group"],
        instructions: data["Instructions"],
      });
      setInstruction(data["Instructions"] || [""]);
      setTestId(data._id);
      console.log(data["Test Results"]);

      setTableData((prev) => ({
        ...prev,
        "Test Results": data["Test Results"],
      }));
    }
  };
  useEffect(() => {
    if (id || courseId) {
      fetchTest();
    }
  }, [id, courseId]);

  useEffect(() => {
    const loadData = async () => {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: "Users" },
      });

      if (!response.flag) return;

      const users = response.data.data.filter(
        (u) => !("title" in u) && u.userType !== "Admin"
      );
      const uniqueGroups = [...new Set(users.map((u) => u.Group))].filter(
        (g) => !selectedUsersGroups.includes(g)
      );

      const studentSample =
        users.find((u) => u.userType === "Student") || users[0] || {};
      const userColumns = [
        {
          name: "SNo",
          selector: (row, index) => index + 1,
          sortable: true,
          width: "70px",
        },
        ...Object.keys(studentSample)
          .filter(
            (key) => !["Password", "userType", "_id", "Group"].includes(key)
          )
          .map((key) => ({
            name: key,
            selector: (row) => row[key],
            sortable: true,
            wrap: true,
            padding: "10px",
          })),
      ];
      const data =
        response.data.data?.filter((value) => !("title" in value)) || [];
      const matchedItems = tableData["Test Results"].map((testItem) => {
        return data.find((value) => value._id === testItem.UserID);
      });

      const uniqueItems = new Set(
        matchedItems.map((item) => item && JSON.stringify(item))
      );
      const uniqueItemsArray = Array.from(uniqueItems).map(
        (item) => item && JSON.parse(item)
      );

      const updatedTestResult = tableData["Test Results"].map(
        (testItem, index) => {
          const matchedItem = uniqueItemsArray.find(
            (item) => item && item._id === testItem.UserID
          );

          
          if (matchedItem) {
            testItem.Answer = JSON.parse(testItem.Answer);

            const totalQuestions = testItem["Answer"].length;
            const answers = Object.values(testItem.Answer);

            try {
              var answeredQuestions = answers.filter(
                (answer) =>
                  Object.values(answer)[0] !== "not-answered" &&
                  Object.values(answer)[0] !== "skipped"
              ).length;
              var skipped = answers.filter((answer) =>
                Object.values(answer)[0].includes("skipped")
              ).length;
              var notAnswered = answers.filter(
                (answer) => Object.values(answer)[0] === "not-answered"
              ).length;
            } catch (error) {}

            return {
              Name: matchedItem.Name,
              "Roll No": matchedItem["Roll No"],
              Department: matchedItem.Department,
              "Total Questions": totalQuestions || 0,
              "Answered Questions": answeredQuestions || 0,
              Skipped: skipped || 0,
              "Not Answered": notAnswered || 0,
              "Score": testItem.Score,
              "View Summary": (
                <Button
                className={styles.viewSummary}
                  onClick={() => {
                    localStorage.setItem("page", "tests");
                    navigate(`/summary?id=${testId}&userId=${testItem.UserID}`);
                  }}
                >
                  View
                </Button>
              ),
              // "Remarks": JSON.parse(testItem.Summary)["Overall Comments"],
              // ...testItem,
              // answersObj: answers,
              // Answers: showAnswers(index),
            };
          }

          return testItem;
        }
      );

      const resultColumns = [
        {
          name: "SNo",
          selector: (row, index) => index + 1,
          sortable: true,
          width: "70px",
        },
        ...Object.keys(updatedTestResult[0] || {}).map((key) => ({
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
        Participants: userColumns,
        "Test Results": resultColumns,
      }));
      setTableData((prev) => ({
        ...prev,
        Participants: users.filter((u) =>
          selectedUsersGroups.includes(u.Group)
        ),
        "Test Results": updatedTestResult,
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
        const questions = data
          .filter((q) => selectedQuestionsGroups.includes(q.Group))
          .map((v) => ({
            ...v,
            Option: Array.isArray(v.Option) ? v.Option.join(", ") : v.Option,
            Answer: Array.isArray(v.Answer) ? v.Answer.join(", ") : v.Answer,
          }));
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
        "Test Description": testDescription,
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
    setActiveTab("Overview");
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
  const generateReport = (format = "csv") => {
    const tableHead = tableColumns[tableName]
      .filter((column) => column.name !== "Answer" && column.name !== "Answers")
      .map((column) => column.name)
      .join(",");

    const tableBody = tableData[tableName]
      .map((row) => {
        return tableColumns[tableName]
          .filter(
            (column) => column.name !== "Answer" && column.name !== "Answers"
          )
          .map((column) => {
            const value = row[column.name];
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`; // Escape quotes
            }
            return value;
          })
          .join(",");
      })
      .join("\n");

    const fileContent = `${tableHead}\n${tableBody}`;
    const mimeType =
      format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;";
    const fileExtension = format === "pdf" ? "pdf" : "csv";

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${testName} report.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const generateReport = () => {
  //   const tableHead = tableColumns[tableName]
  //     .filter((column) => column.name !== "Answer" && column.name !== "Answers")
  //     .map((column) => column.name)
  //     .join(",");

  //   const tableBody = tableData[tableName]
  //     .map((row) => {
  //       const filteredRow = { ...row };
  //       delete filteredRow.Answer;
  //       delete filteredRow.Answers;

  //       return tableColumns[tableName]
  //         .filter((column) => column.name !== "Answer")
  //         .map((column) => filteredRow[column.name])
  //         .join(",");
  //     })
  //     .join("\n");

  //   const csvContent = `${tableHead}\n${tableBody}`;

  //   const blob = new Blob([csvContent], { type: "text/pdf;charset=utf-8;" });

  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = `${testName} report.csv`;
  //   link.click();
  // };
  const deleteItem = async () => {
    showModal("Confirm", "Are you sure you want to delete?", [
      { label: "Cancel", shortcut: "Escape", onClick: closeModal },
      {
        label: "Yes, Delete",
        shortcut: "Enter",
        onClick: async () => {
          await handleApiCall({
            API: "delete-data",
            data: { collection: "Tests", data: [testId] },
          });
          showModal("Success", "Deleted Successfully", [
            {
              label: "Ok",
              shortcut: "Enter",
              onClick: () => {
                navigate(`/admin`);
                closeModal();
              },
            },
          ]);
        },
      },
    ]);
  };
  const handleInstructionSubmit = async () => {
    const trimmedInstruction = instruction.map((instr) => instr.trim());
    if (trimmedInstruction.length === 0) {
      setError({ instruction: "Instruction is required" });
      return;
    }
    showModal("Confirm", "Want to save the changes?", [
      {
        label: "Yes",
        shortcut: "Enter",
        onClick: async () => {
          try {
            const response = await handleApiCall({
              API: "Update-data",
              data: {
                collection: "Tests",
                condition: { _id: testId },
                data: { Instructions: instruction },
              },
            });
            if (response.flag) {
              showModal("Success", "Instructions updated successfully", [
                {
                  label: "Ok",
                  shortcut: "Enter",
                  onClick: () => {
                    fetchTest();
                    setActiveTab("Overview");
                    closeModal();
                  },
                },
              ]);
            } else {
              showModal("Faild", "Failed to update instructions", [
                {
                  label: "Ok",
                  shortcut: "Enter",
                  onClick: () => {
                    setActiveTab("Overview");
                    closeModal();
                  },
                },
              ]);
            }
          } catch (error) {
            showModal("Uncaught Error", "Failed to update instructions", [
              {
                label: "Ok",
                shortcut: "Enter",
                onClick: () => {
                  setActiveTab("Overview");
                  closeModal();
                },
              },
            ]);
            console.log(error);
          }
        },
      },
      {
        label: "No",
        shortcut: "Escape",
        onClick: () => {
          setActiveTab("Overview");
          closeModal();
        },
      },
    ]);
  };

  useEffect(() => {
    console.log(instruction, instructions);
  }, [instruction, instructions]);
  return (
    <>
      <>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1>{testName}</h1>
            <div className={styles.headerButtons}>
              {tableName === "Test Results" && (
                <Button
                  disabled={!tableData["Test Results"].length}
                  tooltip={
                    tableData["Test Results"].length
                      ? ""
                      : "No Test Results Found"
                  }
                  onClick={() => generateReport("csv")}
                >
                  Generate Report
                </Button>
              )}
              {activeTab === "Overview" && (
                <Button
                  onClick={() => setActiveTab("editTest")}
                  tooltip="Edit Test"
                >
                  Edit
                </Button>
              )}
              <Button onClick={deleteItem} tooltip="Delete Test">
                Delete
              </Button>
            </div>
          </div>
          <div className={styles.tabs}>
            {tabs.map((tab, index) => (
              <span
                key={index}
                onClick={() => {
                  setActiveTab(tab);
                  setTableName(tab);
                }}
                className={tab === activeTab ? styles.activeTab : ""}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
      </>
      <div style={{ padding: "20px" }}>
        {activeTab === "Overview" ||
        activeTab === "editTest" ||
        activeTab === "editInstructions" ? (
          <>
            <div className={styles.testDetailsContainer}>
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
                      <p style={{ color: "#080c2bd9" }}>
                        {startTime.split("T")[0]}
                      </p>
                    </div>
                    <div>
                      <p>End Date:</p>
                      <p style={{ color: "#080c2bd9" }}>
                        {endTime.split("T")[0]}
                      </p>
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
                  <div className={styles.detailsColumn}>
                    <div>
                      <p>Participants Group:</p>
                      {selectedUsersGroups.length
                        ? selectedUsersGroups.map((group) => (
                            <p key={group} style={{ color: "#080c2bd9" }}>
                              {group}
                            </p>
                          ))
                        : "No Groups Selected"}
                    </div>
                    <div>
                      <p>Questions Group:</p>
                      {selectedQuestionsGroups.length
                        ? selectedQuestionsGroups.map((group) => (
                            <p style={{ color: "#080c2bd9" }}>{group}</p>
                          ))
                        : "No Groups Selected"}
                    </div>
                  </div>
                  <hr />
                </div>
                {courseId && (
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
                )}
              </div>
              <div className={styles.instructionsContainer}>
                <div
                  className={styles.detailCardHeader}
                  style={{
                    justifyContent: "space-between",
                    paddingRight: "20px",
                  }}
                >
                  <h1>Instructions</h1>
                  <Button onClick={() => setActiveTab("editInstructions")}>
                    {instructions?.length ? "Edit" : "Add"}
                  </Button>
                </div>
                <div className={styles.detailCardBody}>
                  {instructions?.map((instruction, index) => (
                    <p style={{ color: "#080c2bd9" }}>
                      {index + 1}. {instruction}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          (activeTab !== "editTest" || activeTab !== "editInstructions") && (
            <div>
              <div
                className="data-table"
                style={{ marginTop: "25px", borderRadius: "4px" }}
              >
                {tableColumns && tableData && (
                  <DataTableSection
                    columns={tableColumns[tableName]}
                    data={tableData[tableName]}
                  />
                )}
              </div>
            </div>
          )
        )}
      </div>
      {(activeTab === "editTest" || activeTab === "editInstructions") && (
        <>
          <div className={styles.scrim}></div>
          <div className={styles.createTestContainer}>
            <div className={styles.createTestPanel}>
              {activeTab === "editTest" ? (
                <>
                  <h1 className={styles.createTestHeader}>Create Test</h1>
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
                    <div>
                      {
                        <span
                          className={styles.hitAiButton}
                          onClick={() =>
                            generateDescription(
                              testName,
                              "testDescription",
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
                        label="Test Description *"
                        value={testDescription || ""}
                        onChange={(value) => {
                          updateForm("testDescription")(value);
                          setError((prev) => ({
                            ...prev,
                            testDescription: "",
                          }));
                        }}
                        error={error.testDescription}
                      />
                    </div>
                    <Input
                      type="datetime-local"
                      label="Start Date and Time"
                      value={startTime}
                      onChange={(value) => {
                        updateForm("startTime")(value);
                        setError((prev) => ({
                          ...prev,
                          startTime: "",
                          endTime: "",
                        }));
                      }}
                      error={error.startTime}
                    />
                    <Input
                      type="datetime-local"
                      label="End Date and Time"
                      value={endTime}
                      onChange={(value) => {
                        updateForm("endTime")(value);
                        setError((prev) => ({
                          ...prev,
                          startTime: "",
                          endTime: "",
                        }));
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
                        allUsersGroups.length
                          ? allUsersGroups
                          : ["No Groups Available"]
                      }
                    />
                    <RenderSelectedGroups
                      groups={selectedUsersGroups}
                      type="Users"
                    />
                    <Dropdown
                      label="Questions Group"
                      value={
                        selectedQuestionsGroups.join(", ") || "Select Groups"
                      }
                      onSelect={(value) =>
                        modifyGroup(value, "Questions", "add")
                      }
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
                  </form>
                </>
              ) : activeTab === "editInstructions" ? (
                <>
                  <h1 className={styles.createTestHeader}>
                    {instructions?.length > 1
                      ? "Edit Instructions"
                      : "Add Instructions"}
                  </h1>

                  <form className={styles.createTestForm}>
                    {instruction.map((instr, index) => (
                      <Input
                        label={`Instruction ${index + 1}`}
                        placeHolder="Enter Instruction"
                        type="textarea"
                        row={4}
                        key={index}
                        value={instr}
                        onChange={(value) => {
                          const updated = [...instruction];
                          updated[index] = value;
                          setInstruction(updated);
                        }}
                        error={error.instruction}
                      />
                    ))}

                    <Button
                      type="button"
                      className={styles.addInstructionBtn}
                      onClick={() => setInstruction((prev) => [...prev, ""])}
                    >
                      + Add Instruction
                    </Button>
                  </form>
                </>
              ) : (
                <></>
              )}
              <div className={styles.buttonContainer}>
                <Button
                  className={styles.cancelButton}
                  onClick={() => setActiveTab("Overview")}
                  shortcut={"Escape"}
                >
                  Cancel
                </Button>
                <Button
                  shortcut="Ctrl + S"
                  onClick={
                    activeTab === "editTest"
                      ? handleSubmit
                      : handleInstructionSubmit
                  }
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {<Modal />}
    </>
  );
};

export default Test;
