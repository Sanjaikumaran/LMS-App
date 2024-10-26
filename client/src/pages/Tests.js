import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Tests.css";
import DataTable from "react-data-table-component";
import { CgProfile } from "react-icons/cg";
import components from "./components";
const { Navbar } = components;

const Tests = () => {
  const [hosts, setHosts] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [userData, setUserData] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectable, setIsSelectable] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setUserData(userData);
  }, []);

  useEffect(() => {
    const localIps = localStorage.getItem("localIps");

    if (localIps) {
      setHosts(localIps.split(","));
    }
  }, []);

  useEffect(() => {
    if (hosts.length > 0) {
      loadData();
    }
  }, [hosts]);
  useEffect(() => {
    if (tableData) {
      // Filter out objects that have the "title" key
      const filteredData = tableData.filter(
        (obj) => !obj.hasOwnProperty("title")
      );

      // Check if there are any objects left after filtering
      if (filteredData.length > 0) {
        // Set table columns based on keys of the first object
        setTableColumns(Object.keys(filteredData[0]));
      } else {
        // Handle case where no objects are left after filtering
        setTableColumns([]); // or set a default value
      }
    }
  }, [tableData]);

  const loadData = () => {
    if (!hosts[0]) return;

    axios
      .post(`http://${hosts[0]}:5000/load-data`, {
        data: { collection: "Tests" },
      })
      .then((result) => {
        setTableData(result.data);
      })
      .catch((error) => {
        console.error("Error uploading to primary server:", error);
      });
  };

  const showProfile = (profileDetails) => {
    const isExist = document.querySelector(".profile-container");
    if (isExist) {
      return;
    }
    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container";
    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";
    Object.keys(profileDetails).map(async (detail) => {
      const detailList = document.createElement("li");
      detailList.classList = "detail";
      detailList.innerHTML = `<p><span>${detail}:</span>&nbsp;<span> ${profileDetails[detail]}</span></p>`;
      profileInfo.appendChild(detailList);
    });
    profileContainer.appendChild(profileInfo);
    document.body.appendChild(profileContainer);
  };

  document.body.addEventListener("click", (event) => {
    if (event.target.closest("li.profile")) {
      return;
    } else if (event.target.closest("div.profile-container")) {
      return;
    }

    const profileExist = document.querySelector(".profile-container");

    if (profileExist) {
      profileExist.remove();
    }
  });

  const fileUpload = (loadData) => {
    let file = document.querySelector("#tests-list");
    if (!file.files[0]) return;
    const GIFTParser = (text) => {
      const questions = [];
      const regex = /::Question \d+:: (.*?)\n\{([\s\S]*?)\}/g;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const questionText = match[1].trim();
        const optionsBlock = match[2].trim().split("\n");

        const options = [];
        const correctAnswers = [];

        optionsBlock.forEach((option) => {
          const optionText = option.replace(/[=~]/g, "").trim();

          if (option.trim().startsWith("=")) {
            correctAnswers.push(optionText);
          }
          options.push(optionText);
        });

        questions.push({
          Question: questionText,
          Option: options,
          Answer: correctAnswers,
        });
      }

      return questions;
    };

    const reader = new FileReader();
    reader.readAsText(file.files[0]);
    reader.onload = () => {
      const parsedQuestions = GIFTParser(reader.result);
      axios
        .post(`http://${hosts[0]}:5000/Upload-question`, {
          collection: "Tests",
          questions: parsedQuestions,
        })
        .then(() => {
          window.alert("Question Uploaded!");
          loadData();
          file.value = null;
        })
        .catch((error) => {
          console.error(error);
        });
    };
  };

  const addNew = () => {
    setIsModalOpen(true);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";

    tableColumns.forEach((column) => {
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      modalContainer.appendChild(inputField);
    });

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.onclick = () => {
      let data = {};
      tableColumns.forEach((column) => {
        const val = document.getElementsByClassName(column)[0].value;
        data[column] = val;
      });
      console.log(data);

      axios
        .post(`http://${hosts[0]}:5000/insert-data`, {
          data,
          collection: "Tests",
        })
        .then(() => {
          setTableData([...tableData, data]);
          window.alert("New user added successfully!");
        })
        .catch((error) => {
          console.error(error);
        });

      modalContainer.remove();
      document.body.removeChild(overlay);
      closeModal();
    };

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.onclick = () => {
      closeModal();
      modalContainer.remove();
      document.body.removeChild(overlay);
    };

    modalContainer.appendChild(saveButton);
    modalContainer.appendChild(closeButton);
    document.body.appendChild(modalContainer);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const remove = () => {
    if (!isSelectable) {
      setIsSelectable(true);
    } else {
      if (selectedRows.length > 0) {
        const filteredData = tableData.filter(
          (row) => !selectedRows.includes(row)
        );

        setTableData(filteredData);

        axios
          .post(`http://${hosts[0]}:5000/delete-data`, {
            collection: "Tests",

            data: selectedRows.map((row) => row.Answer), // Sending the _id values
          })
          .then((result) => {
            window.alert(`${result.data.deletedCount} Deleted Successfully!`);
          })
          .catch((error) => {
            console.error("Error deleting documents:", error);
          });

        setSelectedRows([]);
      }
      setIsSelectable(false);
    }
  };
  const setTime = () => {
    setIsModalOpen(true);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";

    const createInputField = (column, value = "") => {
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      inputField.value = value;
      inputField.type = "number";
      return inputField;
    };

    axios
      .post(`http://${hosts[0]}:5000/find-data`, {
        collection: "Tests",
        condition: { title: "Time" },
      })
      .then((result) => {
        const data = result.data.result;
        ["Hours", "Minutes", "Seconds"].forEach((column) => {
          modalContainer.appendChild(createInputField(column, data[column]));
        });
      })
      .catch(() => {
        // If there's an error, allow manual input
        window.alert("Error fetching time data, please enter manually.");
        ["Hours", "Minutes", "Seconds"].forEach((column) => {
          modalContainer.appendChild(createInputField(column));
        });
      })
      .finally(() => {
        const saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.onclick = () => {
          let data = { title: "Time" };
          ["Hours", "Minutes", "Seconds"].forEach((column) => {
            const val = document.getElementsByClassName(column)[0].value;
            data[column] = parseInt(val, 10);
          });

          axios
            .post(`http://${hosts[0]}:5000/update-data`, {
              condition: { title: "Time" },
              data: data,
              collection: "Tests",
            })
            .then((result) => {
              if (result.data.upsertedCount || result.data.modifiedCount) {
                window.alert("Time updated successfully!");
              } else {
                throw new Error("No data found for update.");
              }
            })
            .catch(() => {
              // If no update, insert new data
              axios
                .post(`http://${hosts[0]}:5000/insert-data`, {
                  data,
                  collection: "Tests",
                })
                .then(() => {
                  window.alert("Time added successfully!");
                })
                .catch((error) => {
                  console.error(error);
                  window.alert("Error saving time data.");
                });
            });

          closeModalAndCleanup();
        };

        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.onclick = closeModalAndCleanup;

        modalContainer.appendChild(saveButton);
        modalContainer.appendChild(closeButton);
      });

    document.body.appendChild(modalContainer);

    const closeModalAndCleanup = () => {
      setIsModalOpen(false);
      modalContainer.remove();
      document.body.removeChild(overlay);
    };
  };

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  let columns = [
    {
      name: "S.No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    ...tableColumns.map((column) => ({
      name: column,
      selector: (row) => row[column],
      sortable: true,
    })),
  ];

  tableData.forEach((data) => {
    if (data["Option"] && data["Answer"]) {
      delete data["_id"];
      data["Option"] = data["Option"].toString();
      data["Answer"] = data["Answer"].toString();
    }
  });

  const data = tableData.filter((obj) => !obj.hasOwnProperty("title"));

  const customStyles = {
    rows: {
      style: {
        maxHeight: "72px",
      },
    },
    headCells: {
      style: {
        color: "white",
        fontSize: "larger",
        fontWeight: "bold",
        backgroundColor: "#007bff",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  return (
    <>
      <Navbar />
      <div className="tests-action-div">
        <div
          style={{
            display: "inline-flex",
            textAlign: "start",
            flexDirection: "column",
          }}
        >
          <label style={{ marginLeft: "5px", marginBottom: "5px" }}>
            Upload Tests List
          </label>
          <input name="student-list" id="tests-list" type="file" required />
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileUpload(loadData)}
            className="upload-button"
          >
            Upload
          </button>
          <button type="button" onClick={addNew} className="upload-button">
            Add New
          </button>
          <button type="button" onClick={remove} className="upload-button">
            Remove
          </button>{" "}
          <button type="button" onClick={setTime} className="upload-button">
            Set Time
          </button>
        </div>
      </div>
      <div className="datatable">
        <DataTable
          columns={columns}
          data={data}
          highlightOnHover
          striped
          fixedHeaderScrollHeight="80vh"
          defaultSortFieldId={1}
          customStyles={customStyles}
          responsive
          fixedHeader
          selectableRows={isSelectable}
          onSelectedRowsChange={handleRowSelected}
        />
      </div>
    </>
  );
};

export default Tests;
