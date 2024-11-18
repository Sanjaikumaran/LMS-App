import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import Papa from "papaparse";

import "../styles/components.css";
import axios from "axios";
import { CgProfile } from "react-icons/cg";
const XLSX = require("xlsx");

const Navbar = (props) => {
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

  useEffect(() => {
    const bodyClick = (event) => {
      const profileExist = document.querySelector(".profile-container");

      if (event.target.closest("li.show-profile")) {
        return;
      } else if (event.target.closest("div.profile-container")) {
        return;
      }

      if (profileExist) {
        profileExist.remove();
      }
    };
    document.body.addEventListener("click", bodyClick);
    return () => {
      document.body.removeEventListener("click", bodyClick);
    };
  }, []);
  return (
    <>
      {/*Top Navigation Bar*/}
      <div>
        <nav className="navbar">
          <div className="logo">
            <h1 style={{ margin: 0 }}>Quizzards</h1>
          </div>
          <div className="nav-links">
            {/* <span>Home</span>
            <span>About</span>*/}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://sanjaikumaran.online/contact/"
            >
              Contact
            </a>
            {!props.showProfile && (
              <li
                onClick={() => {
                  showProfile(props.userData);
                }}
                className="show-profile"
              >
                <CgProfile style={{ fontSize: "1.5rem" }} />
              </li>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};
const response = (buttons, response) => {
  return response === buttons[0] ? true : false;
};
const Modal = (props) => {
  return (
    <>
      <div className="modal-background">
        <div className="modal-container">
          <h1 className="card-header">{props.modalType}</h1>
          <div className="card-body">
            <h3>{props.modalMessage}</h3>{" "}
            <div className="modal-buttons">
              {props.buttons.map((button, index) => {
                return (
                  <button key={index} onClick={() => props.response(button)}>
                    {button}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
const createFormModal = (props) => {
  const overlay = document.createElement("div");
  overlay.className = "modal-background";
  document.body.appendChild(overlay);

  const modalContainer = document.createElement("div");
  modalContainer.className = "modal-container";

  const heading = document.createElement("h1");
  heading.className = "card-header";
  heading.innerText = props.headingText;
  modalContainer.appendChild(heading);
  const modalBody = document.createElement("div");
  modalBody.className = "card-body";
  props.elements.forEach((element) => modalBody.appendChild(element));

  const closeModal = () => {
    overlay.remove();
    modalContainer.remove();
  };
  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "modal-buttons";
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.onclick = props.saveCallback(closeModal);

  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.className = "red-bg";
  closeButton.onclick = closeModal;

  buttonsDiv.appendChild(closeButton);
  buttonsDiv.appendChild(saveButton);
  modalBody.appendChild(buttonsDiv);
  modalContainer.appendChild(modalBody);
  document.body.appendChild(modalContainer);
};
const MessageBox = (props) => {
  return (
    <>
      <div className="error-message">{props.message}</div>
    </>
  );
};
const handleApiCall = async (props) => {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  try {
    return await axios
      .post(`http://${hostname}:5000/${props.API}`, {
        data: props.data,
      })
      .then((result) => {
        if (result.status === 200) {
          return { data: result.data, flag: true };
        } else {
          return { error: result.data.message, flag: false };
        }
      })
      .catch((error) => {
        return { error: error.response.data.message, flag: false };
      });
  } catch (error) {
    return { error: error.message, flag: false };
  }
};

const ModuleCard = (props) => {
  const navigate = useNavigate();

  return (
    <div className="card-container">
      <h1 className="card-header">{props.header}</h1>
      <div className="card-body">
        <div className="image-container">
          <img src={props.imageSrc} alt={props.altText} />
        </div>
        <div className="button-container">
          <button onClick={() => navigate(props.navigateTo)} type="button">
            Open
          </button>
        </div>
      </div>
    </div>
  );
};
const fileUpload = async (
  fetchCallback,
  fileName,
  apiEndpoint,
  collectionName,
  showModal,
  setIsModalOpen
) => {
  // Check if file is selected
  if (!fileName.files[0]) {
    showModal(
      "Error",
      "No file is selected.",
      ["Select File", "Ok"],
      (button) => {
        if (button === "Select File") fileName.click();
        setIsModalOpen(false);
      }
    );
    return;
  }

  const reader = new FileReader();
  const fileType = fileName.files[0].name.split(".").pop().toLowerCase();

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
        if (option.trim().startsWith("=")) correctAnswers.push(optionText);
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

  const handleUpload = async (data) => {
    try {
      const response = await handleApiCall({
        API: apiEndpoint,
        data: { data, collection: collectionName },
      });

      if (response.flag) {
        fetchCallback();
        showModal("Info", "Data Uploaded Successfully!", ["Ok"], () => {
          fileName.value = "";
          setIsModalOpen(false);
        });
      } else {
        showModal("Error", response.error, ["Retry", "Ok"], (button) => {
          if (button === "Retry") retryUpload();
          fileName.value = "";
          setIsModalOpen(false);
        });
      }
    } catch (error) {
      showModal(
        "Error",
        `Uncaught error: ${error.message || error}`,
        ["Retry", "Ok"],
        (button) => {
          if (button === "Retry") retryUpload();
          fileName.value = "";
          setIsModalOpen(false);
        }
      );
    }
  };

  const retryUpload = () => {
    fileUpload(
      fetchCallback,
      fileName,
      apiEndpoint,
      collectionName,
      showModal,
      setIsModalOpen
    );
  };

  reader.onload = async () => {
    let insertData;

    switch (fileType) {
      case "csv":
        if (collectionName === "Users") {
          insertData = Papa.parse(reader.result).data;
        } else {
          insertData = Papa.parse(reader.result).data;
          insertData = insertData
            .map((question) => {
              if (
                question[0].toLowerCase().trim() !== "question" &&
                question[0].toLowerCase().trim() !== "questions"
              ) {
                if (question[0].includes("____")) {
                  return {
                    Question: question[0].trim(),
                    Option: question[1]
                      ? question[1]
                          .split(/::|,,/)
                          .map((option) => option.trim())
                      : ["None"],
                    Answer: question[2]
                      .split(/::|,,/)
                      .map((option) => option.trim()),
                  };
                }
                const options = question[1]
                  ? question[1].split(/::|,,/).map((option) => option.trim())
                  : [];
                const answers = question[2]
                  ? question[2].split(/::|,,/).map((answer) => answer.trim())
                  : [];

                return {
                  Question: question[0].trim(),
                  Option: options,
                  Answer: answers,
                };
              }
              return null;
            })
            .filter((item) => item !== null);
        }
        break;
      case "gift":
        insertData = GIFTParser(reader.result);
        console.log(insertData);

        break;
      case "xlsx":
        const workbook = XLSX.read(reader.result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        insertData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        break;
      default:
        showModal("Error", "Unsupported file type.", ["Ok"], () =>
          setIsModalOpen(false)
        );
        return;
    }

    if (apiEndpoint === "Upload-question") {
      showModal(
        "Enter Question Group Name",
        <input type="text" id="groupName" />,
        ["Ok", "Cancel"],
        (button) => {
          if (button === "Ok") {
            const groupName = document.getElementById("groupName").value;
            insertData = insertData.map((data) => ({
              ...data,
              Group: groupName,
            }));
            handleUpload(insertData);
          } else setIsModalOpen(false);
        }
      );
    } else {
      handleUpload(insertData);
    }
  };

  // Read the file based on its type
  if (fileType === "xlsx") {
    reader.readAsArrayBuffer(fileName.files[0]);
  } else {
    reader.readAsText(fileName.files[0]);
  }
};

const ActionDiv = ({
  tablePageName,
  onFileUpload,
  onAddNew,
  onRemove,
  actionButtons,
}) => {
  return (
    <div className="action-div">
      <div className="upload-file">
        <label>Upload {tablePageName}</label>
        <input name="list" id="data-file" type="file" required />
      </div>
      <div>
        <button
          type="button"
          onClick={() => onFileUpload(document.querySelector("#data-file"))}
        >
          Upload
        </button>
        <button type="button" onClick={onAddNew}>
          Add New
        </button>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
        {actionButtons && actionButtons}
      </div>
    </div>
  );
};

const DataTableSection = ({
  columns,
  data,
  onRowSelected = () => {},
  isSelectable = false,
}) => {
  const customStyles = {
    rows: { style: { padding: "10px", maxHeight: "72px" } },
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
    cells: { style: { paddingLeft: "8px", paddingRight: "8px" } },
  };

  return (
    <div className="data-table">
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
        onSelectedRowsChange={onRowSelected}
      />
    </div>
  );
};

const DataTableManagement = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData(collectionName = props.collectionName) {
    try {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: collectionName },
      });
      if (response.flag) {
        const data =
          response.data.data?.filter((value) => !("title" in value)) || [];
        const studentData = data.find((value) => value.userType === "Student");
        setTableColumns(Object.keys(studentData || data[0]));
        setTableData(data);
      } else {
        showModal("Info", response.error, ["Retry", "Ok"], (button) => {
          if (button === "Retry") {
            fetchData(collectionName);
            setIsModalOpen(false);
          } else {
            setIsModalOpen(false);
          }
        });
      }
    } catch (error) {
      showModal(
        "Error",
        `Uncaught error: ${error.message}`,
        ["Retry", "Ok"],
        (button) => {
          if (button === "Retry") {
            fetchData(collectionName);
            setIsModalOpen(false);
          } else {
            setIsModalOpen(false);
          }
        }
      );
    }
  }

  const handleRowSelected = (state) => setSelectedRows(state.selectedRows);

  const remove = async () => {
    if (!isSelectable) {
      setIsSelectable(true);
      return;
    }
    if (selectedRows.length === 0) return;
    const filteredData = tableData.filter((row) => !selectedRows.includes(row));
    setTableData(filteredData);
    try {
      const response = await handleApiCall({
        API: "delete-data",
        data: {
          collection: props.collectionName,
          data: selectedRows.map((row) => row._id),
        },
      });
      response.flag
        ? showModal(
            "Info",
            `${response.data.deletedCount} ${response.data.message}`,
            ["Ok"],
            () => {
              setIsSelectable(false);
              setIsModalOpen(false);
            }
          )
        : handleRetry("Error", response.error, remove);
    } catch (error) {
      handleRetry("Uncaught Error", error.message, remove);
    } finally {
      setIsModalOpen(true);
    }
  };

  const addNew = () => {
    const inputs = {};
    const contentElements = tableColumns.map((column) => {
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      inputs[column] = inputField;
      return inputField;
    });

    createFormModal({
      headingText: "Add New User",
      elements: contentElements,
      saveCallback: (closeModal) => async () => {
        const data = tableColumns.reduce(
          (acc, column) => ({ ...acc, [column]: inputs[column].value }),
          {}
        );
        try {
          const response = await handleApiCall({
            API: "insert-data",
            data: { data, collection: props.collectionName },
          });
          response.flag
            ? showModal("Info", "Data Inserted successfully!", ["Ok"], () =>
                setTableData([...tableData, data])
              )
            : handleRetry("Error", response.error, addNew);
        } catch (error) {
          handleRetry("Uncaught Error", error.message, addNew);
        } finally {
          setIsModalOpen(true);
        }
        closeModal();
      },
    });
  };

  const handleRetry = (type, message, retryFunction) => {
    setModalOptions({
      type,
      message,
      buttons: ["Retry", "Ok"],
      responseFunc: (button) => {
        if (button === "Retry") retryFunction();
      },
    });
  };

  const showModal = (type, message, buttons, responseFunc) => {
    setModalOptions({ type, message, buttons, responseFunc });
    setIsModalOpen(true);
  };

  const columns = [
    {
      name: "S.No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    ...tableColumns
      .filter((column) => !["Password", "userType", "_id"].includes(column))
      .map((column) => ({
        name: column,
        selector: (row) => row[column],
        sortable: true,
        wrap: true,
        padding: "10px",
      })),
  ];

  return (
    <>
      <ActionDiv
        tablePageName={props.tablePageName}
        onFileUpload={(file) =>
          fileUpload(
            fetchData,
            file,
            props.API,
            props.collectionName,
            showModal,
            setIsModalOpen
          )
        }
        onAddNew={addNew}
        onRemove={remove}
        actionButtons={props.actionButtons}
      />
      <DataTableSection
        columns={columns}
        data={tableData}
        onRowSelected={handleRowSelected}
        isSelectable={isSelectable}
      />
      {isModalOpen && (
        <Modal
          modalType={modalOptions.type || "Info"}
          modalMessage={modalOptions.message || "An unexpected issue occurred."}
          buttons={modalOptions.buttons || ["Ok"]}
          response={modalOptions.responseFunc || (() => setIsModalOpen(false))}
        />
      )}
    </>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  Navbar,
  Modal,
  createFormModal,
  response,
  MessageBox,
  handleApiCall,
  ModuleCard,
  fileUpload,
  DataTableSection,
  DataTableManagement,
};
