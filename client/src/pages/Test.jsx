import React, { useState, useEffect } from "react";
import components from "./components";
import { useLocation } from "react-router-dom";

const { Modal, fileUpload, handleApiCall, DataTableSection } = components;

const Test = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();
  const [testId, setTestId] = useState("");
  const [testName, setTestName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedUsersGroups, setSelectedUsersGroups] = useState([]);
  const [selectedQuestionsGroups, setSelectedQuestionsGroups] = useState([]);

  const [isUsersDropdownVisible, setUsersIsDropdownVisible] = useState(false);
  const [isQuestionsDropdownVisible, setIsQuestionsDropdownVisible] =
    useState(false);
  const [allUsersGroups, setAllUsersGroups] = useState([]);
  const [allQuestionsGroups, setAllQuestionsGroups] = useState([]);

  const [isTableDropdownVisible, setTableIsDropdownVisible] = useState(false);
  const [tableName, setTableName] = useState("Users");

  const [usersTableColumns, setUsersTableColumns] = useState([]);
  const [usersTableData, setUsersTableData] = useState([]);

  const [questionsTableColumns, setQuestionsTableColumns] = useState([]);
  const [questionsTableData, setQuestionsTableData] = useState([]);

  const [tableData, setTableData] = useState([""]);
  const [tableColumns, setTableColumns] = useState([""]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await handleApiCall({
          API: "find-data",
          data: {
            collection: "Tests",
            condition: { key: "_id", value: id },
          },
        });

        if (response.flag) {
          setTestId(response.data.data._id);
          setSelectedUsersGroups(
            response.data.data["Participants Group"] || []
          );
          setSelectedQuestionsGroups(
            response.data.data["Questions Group"] || []
          );
          setTestName(response.data.data["Test Name"]);
          setStartTime(response.data.data["Start Time"]);
          setEndTime(response.data.data["End Time"]);
          setDuration(response.data.data.Duration);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Users" },
        });

        if (response.flag) {
          const uniqueGroups = Array.from(
            new Set(response.data.data.map((user) => user.Group))
          ).filter((group) => !selectedUsersGroups.includes(group));
          const data =
            response.data.data?.filter((value) => !("title" in value)) || [];
          const studentData = data.find(
            (value) => value.userType === "Student"
          );
          setUsersTableColumns(Object.keys(studentData || data[0]));
          setUsersTableData(data);

          setAllUsersGroups(uniqueGroups);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedUsersGroups.length > 0) {
      fetchUsersData();
    }
  }, [selectedUsersGroups]);
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Questions" },
        });

        if (response.flag) {
          const uniqueGroups = Array.from(
            new Set(response.data.data.map((question) => question.Group))
          ).filter((group) => !selectedUsersGroups.includes(group));
          const data = response.data.data;
          setQuestionsTableColumns(Object.keys(data[0]));
          setQuestionsTableData(data);

          setAllQuestionsGroups(uniqueGroups);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedUsersGroups.length > 0) {
      fetchUsersData();
    }
  }, [selectedUsersGroups]);

  const showModal = (type, message, buttons, responseFunc) => {
    setModalOptions({ type, message, buttons, responseFunc });
    setIsModalOpen(true);
  };

  const addGroup = (
    group,
    selectedGroups,
    setSelectedGroups,
    allGroups,
    setAllGroups
  ) => {
    if (group === "No Groups Available") {
      setUsersIsDropdownVisible(false);
      setIsQuestionsDropdownVisible(false);
      return;
    }
    if (!selectedGroups.includes(group)) {
      setSelectedGroups([...selectedGroups, group]);
      setAllGroups(allGroups.filter((g) => g !== group));
      setIsQuestionsDropdownVisible(false);
      setUsersIsDropdownVisible(false);
    }
  };

  const removeGroup = (
    group,
    selectedGroups,
    setSelectedGroups,
    allGroups,
    setAllGroups
  ) => {
    setSelectedGroups(selectedGroups.filter((selected) => selected !== group));
    setAllGroups([...allGroups, group]);
  };

  const handleClickOutside = (e) => {
    const dropdown = document.querySelector(".group-dropdown");
    if (dropdown && !dropdown.contains(e.target)) {
      setIsQuestionsDropdownVisible(false);
      setUsersIsDropdownVisible(false);
      setTableIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check for required fields
    if (!testName) {
      showModal("Error", "Please fill in all required fields.", ["Ok"]);
      return;
    }

    // Validate start and end time
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      showModal("Error", "End time must be greater than start time.", ["Ok"]);
      return;
    }

    console.log(
      testName,
      startTime,
      endTime,
      duration,
      selectedUsersGroups,
      selectedQuestionsGroups
    );

    const files = document.querySelectorAll("input[type=file]");

    //fileUpload(
    //  () => {},
    //  files[0],
    //  "Upload-data",
    //  "Users",
    //  showModal,
    //  setIsModalOpen
    //);
    fileUpload(
      () => {},
      files[0],
      "Upload-question",
      "Questions",
      showModal,
      setIsModalOpen
    );

    try {
      let configurations = {};

      if (testName) configurations["Test Name"] = testName;
      if (startTime) configurations["Start Time"] = startTime;
      if (endTime) configurations["End Time"] = endTime;
      if (duration) configurations["Duration"] = duration;

      if (
        Array.isArray(selectedUsersGroups) &&
        selectedUsersGroups.length > 0
      ) {
        configurations["Participants Group"] = selectedUsersGroups;
      }

      if (
        Array.isArray(selectedQuestionsGroups) &&
        selectedQuestionsGroups.length > 0
      ) {
        configurations["Questions Group"] = selectedQuestionsGroups;
      }

      if (!testName) {
        throw new Error("Test Name is required.");
      }

      const response = await handleApiCall({
        API: "update-data",
        data: {
          condition: { _id: testId },
          collection: "Tests",
          data: configurations,
        },
      });

      if (response.flag) {
        console.log("Data inserted successfully.");
      } else {
        console.log("Failed to insert data.");
      }
    } catch (error) {
      console.error("Error occurred:", error.message);
    }

    showModal("Success", "Test Created Successfully", ["Close"]);
  };

  const displayUsersGroups =
    allUsersGroups.length === 0 ? ["No Groups Available"] : allUsersGroups;
  const displayQuestionsGroups =
    allQuestionsGroups.length === 0
      ? ["No Groups Available"]
      : allQuestionsGroups;

  useEffect(() => {
    const columns =
      tableName === "Users"
        ? [
            {
              name: "S.No",
              selector: (row, index) => index + 1,
              sortable: true,
              width: "70px",
            },
            ...usersTableColumns
              .filter(
                (column) =>
                  column !== "Password" &&
                  column !== "userType" &&
                  column !== "_id" &&
                  column !== "Group"
              )
              .map((column) => ({
                name: column,
                selector: (row) => row[column],
                sortable: true,
                wrap: true,
                padding: "10px",
              })),
          ]
        : [
            {
              name: "S.No",
              selector: (row, index) => index + 1,
              sortable: true,
              width: "70px",
            },
            ...questionsTableColumns
              .filter((column) => column !== "Group" && column !== "_id")
              .map((column) => ({
                name: column,
                selector: (row) => row[column],
                sortable: true,
                wrap: true,
                padding: "10px",
              })),
          ];
    const data =
      tableName === "Users"
        ? usersTableData.filter(
            (user) =>
              user.userType !== "Admin" &&
              selectedUsersGroups.includes(user.Group)
          )
        : questionsTableData.filter((question) =>
            selectedQuestionsGroups.includes(question.Group)
          );
    setTableColumns(columns);
    setTableData(data);
  }, [
    tableName,
    selectedUsersGroups,
    selectedQuestionsGroups,
    usersTableData,
    usersTableColumns,
    questionsTableColumns,
    questionsTableData,
  ]);

  return (
    <>
      {isModalOpen && (
        <Modal
          modalType={modalOptions?.type || "Info"}
          modalMessage={
            modalOptions?.message || "An unexpected issue occurred."
          }
          buttons={modalOptions?.buttons || ["Ok"]}
          response={modalOptions?.responseFunc || (() => setIsModalOpen(false))}
        />
      )}

      <div style={{ display: "flex" }}>
        <form
          className="test-form"
          onSubmit={handleSubmit}
          style={{ margin: " 20px " }}
        >
          <h1 className="card-header">{testName}</h1>
          <div className="form-group">
            <label>Test Name *</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Start Date and Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onFocus={(e) => e.target.showPicker()}
              onChange={(e) => setStartTime(e.target.value)}
              className="datetime-input"
            />
          </div>

          <div className="form-group">
            <label>End Date and Time </label>
            <input
              type="datetime-local"
              value={endTime}
              onFocus={(e) => e.target.showPicker()}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Duration (HH:MM:SS)</label>
            <input
              type="time"
              onClick={(e) => e.target.showPicker()}
              step={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Participants Group</label>
            <div className="group-selector">
              <input
                type="text"
                className="group-selector-input"
                value={selectedUsersGroups.join(", ") || "Select Groups"}
                onFocus={() => setUsersIsDropdownVisible(true)}
                readOnly
              />

              {isUsersDropdownVisible && (
                <div className="group-dropdown">
                  {displayUsersGroups.map((group) => (
                    <div
                      key={group}
                      className="group-item"
                      onClick={() =>
                        addGroup(
                          group,
                          selectedUsersGroups,
                          setSelectedUsersGroups,
                          allUsersGroups,
                          setAllUsersGroups
                        )
                      }
                    >
                      <span>{group}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="selected-groups">
              {selectedUsersGroups.map((group) => (
                <span key={group} className="selected-group">
                  {group}{" "}
                  <button
                    onClick={() =>
                      removeGroup(
                        group,
                        selectedUsersGroups,
                        setSelectedUsersGroups,
                        allUsersGroups,
                        setAllUsersGroups
                      )
                    }
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Questions Group</label>
            <div className="group-selector">
              <input
                type="text"
                className="group-selector-input"
                value={selectedQuestionsGroups.join(", ") || "Select Groups"}
                onFocus={() => setIsQuestionsDropdownVisible(true)}
                readOnly
              />

              {isQuestionsDropdownVisible && (
                <div className="group-dropdown">
                  {displayQuestionsGroups.map((group) => (
                    <div
                      key={group}
                      className="group-item"
                      onClick={() =>
                        addGroup(
                          group,
                          selectedQuestionsGroups,
                          setSelectedQuestionsGroups,
                          allQuestionsGroups,
                          setAllQuestionsGroups
                        )
                      }
                    >
                      <span>{group}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="selected-groups">
              {selectedQuestionsGroups.map((group) => (
                <span key={group} className="selected-group">
                  {group}{" "}
                  <button
                    onClick={() =>
                      removeGroup(
                        group,
                        selectedQuestionsGroups,
                        setSelectedQuestionsGroups,
                        allQuestionsGroups,
                        setAllQuestionsGroups
                      )
                    }
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/*<div className="form-group">
            <label>Upload New Group</label>
            <input type="file" name="users-group-file" />
          </div>*/}

          <div className="form-group">
            <label>Upload Questions</label>
            <input type="file" name="questions-group-file" />
          </div>

          <button type="submit">Submit</button>
        </form>
        <div>
          <div style={{ margin: "20px" }}>
            <div className="form-group">
              <label>Select Data to Show</label>
              <div className="group-selector">
                <input
                  type="text"
                  className="group-selector-input"
                  value={tableName}
                  onFocus={() => setTableIsDropdownVisible(true)}
                  readOnly
                />

                {isTableDropdownVisible && (
                  <div className="group-dropdown">
                    {["Questions", "Users"].map((group) => (
                      <div
                        key={group}
                        className="group-item"
                        onClick={(e) => {
                          console.log(e.target.innerText);

                          setTableName(e.target.innerText);
                          setTableIsDropdownVisible(false);
                        }}
                      >
                        <span>{group}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className="data-table"
            style={{ marginTop: "25px", border: "1px solid #007bff" }}
          >
            {tableColumns && tableData && (
              <DataTableSection columns={tableColumns} data={tableData} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Test;
