import React, { useState, useEffect } from "react";
import components from "./components";
import "../styles/CreateTest.css";
const { Modal, handleApiCall } = components;

const CreateTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();
  const [testName, setTestName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [allGroups, setAllGroups] = useState([
    "Group A",
    "Group B",
    "Group C",
    "Group D",
    "Group E",
    "Group F",
    "Group G",
    "Group H",
  ]);

  const showModal = (type, message, buttons, responseFunc) => {
    setModalOptions({ type, message, buttons, responseFunc });
    setIsModalOpen(true);
  };

  const addGroup = (group) => {
    if (group === "No Groups Available") {
      setIsDropdownVisible(false);
      return;
    }
    if (!selectedGroups.includes(group)) {
      setSelectedGroups([...selectedGroups, group]);
      setAllGroups(allGroups.filter((g) => g !== group));
      setIsDropdownVisible(false);
    }
  };

  const removeGroup = (group) => {
    setSelectedGroups(selectedGroups.filter((selected) => selected !== group));
    setAllGroups([...allGroups, group]);
  };

  const handleClickOutside = (e) => {
    const dropdown = document.querySelector(".group-dropdown");
    if (dropdown && !dropdown.contains(e.target)) {
      setIsDropdownVisible(false);
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
    console.log(testName, startTime, endTime, duration, selectedGroups);

    showModal("Success", "Test Created Successfully", ["Close"]);
    try {
      let configurations = {};

      if (testName) {
        configurations["Test Name"] = testName;
      }
      if (startTime) {
        configurations["Start Time"] = startTime;
      }
      if (endTime) {
        configurations["End Time"] = endTime;
      }
      if (duration) {
        configurations["Duration"] = duration;
      }

      if (Array.isArray(selectedGroups) && selectedGroups.length > 0) {
        configurations["Participants Group"] = selectedGroups;
      }

      if (!testName) {
        throw new Error("Test Name is required.");
      }

      const response = await handleApiCall({
        API: "insert-data",
        data: { data: configurations, collection: "Tests" },
      });

      if (response.flag) {
        console.log("Data inserted successfully.");
      } else {
        console.log("Failed to insert data.");
      }
    } catch (error) {
      console.error("Error occurred:", error.message);
    }
  };

  const displayGroups =
    allGroups.length === 0 ? ["No Groups Available"] : allGroups;

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
          <label>Participants Group</label>
          <div className="group-selector">
            <input
              type="text"
              className="group-selector-input"
              value={selectedGroups.join(", ") || "Select Groups"}
              onFocus={() => setIsDropdownVisible(true)}
              readOnly
            />

            {isDropdownVisible && (
              <div className="group-dropdown">
                {displayGroups.map((group) => (
                  <div
                    key={group}
                    className="group-item"
                    onClick={() => addGroup(group)}
                  >
                    <span>{group}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="selected-groups">
            {selectedGroups.map((group) => (
              <span key={group} className="selected-group">
                {group} <button onClick={() => removeGroup(group)}>x</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Upload New Group</label>
          <input type="file" />
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
