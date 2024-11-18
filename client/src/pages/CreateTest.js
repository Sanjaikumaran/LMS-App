import React, { useState, useEffect } from "react";
import components from "./components";
import "../styles/CreateTest.css";
const { Modal, handleApiCall, fileUpload } = components;

const CreateTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();
  const [testName, setTestName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [attempts, setAttempts] = useState("");
  const [selectedUsersGroups, setSelectedUsersGroups] = useState([]);
  const [selectedQuestionsGroups, setSelectedQuestionsGroups] = useState([]);
  const [isUsersDropdownVisible, setUsersIsDropdownVisible] = useState(false);
  const [isQuestionsDropdownVisible, setIsQuestionsDropdownVisible] = useState(
    false
  );
  const [allUsersGroups, setAllUsersGroups] = useState([]);
  const [allQuestionsGroups, setAllQuestionsGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Users" },
        });

        if (response.flag) {
          const uniqueGroups = Array.from(
            new Set(response.data.data.map((user) => user.Group))
          );

          setAllUsersGroups(uniqueGroups);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Questions" },
        });

        if (response.flag) {
          const uniqueGroups = Array.from(
            new Set(response.data.data.map((question) => question.Group))
          );

          setAllQuestionsGroups(uniqueGroups);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
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

    if (!testName) {
      showModal("Error", "Please fill in all required fields.", ["Ok"]);
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      showModal("Error", "End time must be greater than start time.", ["Ok"]);
      return;
    }

    const files = document.querySelectorAll("input[type=file]");

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
      if (attempts) configurations["Attempts Limit"] = attempts;

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
      configurations["Test Results"] = [];

      if (!testName) {
        throw new Error("Test Name is required.");
      }

      const response = await handleApiCall({
        API: "insert-data",
        data: { data: configurations, collection: "Tests" },
      });
      if (response.flag) {
        showModal("Success", "Test Created Successfully", ["Close"]);
        window.location.href = "/admin";
      } else {
        showModal("Error", "Test not Created", ["Close"]);
      }
    } catch (error) {
      showModal("Uncaught Error", error.message, ["Close"]);
    }
  };
  const displayUsersGroups =
    allUsersGroups.length === 0 ? ["No Groups Available"] : allUsersGroups;
  const displayQuestionsGroups =
    allQuestionsGroups.length === 0
      ? ["No Groups Available"]
      : allQuestionsGroups;

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

      <form className="test-form" onSubmit={handleSubmit}>
        <h1 className="card-header">Create New Test</h1>
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
          <label>Attempts Limit</label>
          <input
            type="number"
            value={attempts}
            onChange={(e) => setAttempts(e.target.value)}
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

        <div className="form-group">
          <label>Upload Questions</label>
          <input type="file" />
        </div>

        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default CreateTest;
