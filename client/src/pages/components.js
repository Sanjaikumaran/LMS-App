import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

import "../styles/components.css";
import axios from "axios";
import { CgProfile } from "react-icons/cg";

const Navbar = (props) => {
  const [userData, setUserData] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    userData && setUserData(userData);
  }, []);
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
      if (event.target.closest("li.profile")) {
        return;
      } else if (event.target.closest("div.profile-container")) {
        return;
      }

      const profileExist = document.querySelector(".profile-container");

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
            <span
              onClick={() => {
                navigate("/admin");
              }}
            >
              Home
            </span>
            <a href="#about">About</a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://sanjaikumaran.online/contact/"
            >
              Contact
            </a>
            {!props.page && (
              <li
                onClick={() => {
                  showProfile(userData);
                }}
                className="profile"
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
          <h1>{props.modalType}</h1>
          <div className="modal-body">
            <h3>{props.modalMessage}</h3>
          </div>
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
    </>
  );
};
const createFormModal = (props) => {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  const modalContainer = document.createElement("div");
  modalContainer.className = "modal-container";

  const heading = document.createElement("h1");
  heading.innerText = props.headingText;
  modalContainer.appendChild(heading);

  props.elements.forEach((element) => modalContainer.appendChild(element));

  const closeModal = () => {
    overlay.remove();
    modalContainer.remove();
  };

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.onclick = props.saveCallback(closeModal);

  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.onclick = closeModal;

  modalContainer.appendChild(saveButton);
  modalContainer.appendChild(closeButton);
  document.body.appendChild(modalContainer);
};
const MessageBox = (props) => {
  return (
    <>
      <div className="error-message" style={{ color: "red" }}>
        {props.message}
      </div>
    </>
  );
};
const handleApiCall = async (props) => {
  const localIps = localStorage.getItem("localIps").split(",");

  try {
    return await axios
      .post(`http://${localIps[0]}:5000/${props.API}`, {
        data: props.data,
      })
      .then((result) => {
        if (result.status === 200) {
          return { data: result.data, flag: true };
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
        <div>
          <img src={props.imageSrc} alt={props.altText} />
        </div>
        <button onClick={() => navigate(props.navigateTo)} type="button">
          Open
        </button>
      </div>
    </div>
  );
};
const DataTableManagement = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();

  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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
        response.data.forEach((value) => delete value["_id"]);
        response.data = response.data.filter(
          (data) => !data.hasOwnProperty("title")
        );

        if (response.data) {
          setTableColumns(Object.keys(response.data[0]));
          setTableData(response.data);
        } else {
          showModal("Info", "No data available.", ["Ok"], () =>
            setIsModalOpen(false)
          );
          setIsModalOpen(true);
        }
      } else {
        showModal("Error", response.error, ["Retry", "Ok"], (button) => {
          if (button === "Retry") fetchData(collectionName);
          setIsModalOpen(false);
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      console.log(error);

      showModal(
        "Error",
        `Uncaught error: ${error.message}`,
        ["Retry", "Ok"],
        (button) => {
          if (button === "Retry") fetchData(collectionName);
          setIsModalOpen(false);
        }
      );
      setIsModalOpen(true);
    }
  }

  const fileUpload = (
    fetchCallback = fetchData,
    apiEndpoint = props.API,
    collectionName = props.collectionName
  ) => {
    const file = document.querySelector("#students-list");
    if (!file.files[0]) {
      showModal(
        "Error",
        "No file is selected.",
        ["Select File", "Ok"],
        (button) => {
          if (button === "Select File") file.click();
          setIsModalOpen(false);
        }
      );
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file.files[0]);
    let insertData;
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

    reader.onload = async () => {
      if (collectionName === "Tests") {
        insertData = GIFTParser(reader.result);
      } else {
        insertData = reader.result;
      }
      try {
        const response = await handleApiCall({
          API: apiEndpoint,
          data: { data: insertData, collection: collectionName },
        });

        if (response.flag) {
          fetchCallback();
          showModal("Info", "Data Uploaded Successfully!", ["Ok"], () => {
            file.value = "";
            setIsModalOpen(false);
          });
        } else {
          showModal("Error", response.error, ["Retry", "Ok"], (button) => {
            if (button === "Retry") fileUpload(fetchCallback, apiEndpoint);
            file.value = "";
            setIsModalOpen(false);
          });
        }
      } catch (error) {
        showModal(
          "Error",
          `Uncaught error: ${error.message}`,
          ["Retry", "Ok"],
          (button) => {
            if (button === "Retry") fileUpload(fetchCallback, apiEndpoint);
            file.value = "";
            setIsModalOpen(false);
          }
        );
      } finally {
        setIsModalOpen(true);
      }
    };
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

    const saveCallback = (closeModal) => async () => {
      const data = tableColumns.reduce((acc, column) => {
        acc[column] = inputs[column].value;
        return acc;
      }, {});

      try {
        const response = await handleApiCall({
          API: "insert-data",
          data: { data, collection: props.collectionName },
        });

        if (response.flag) {
          setTableData([...tableData, data]);
          showModal("Info", "Data Inserted successfully!", ["Ok"], () => {
            setIsModalOpen(false);
          });
        } else {
          handleRetry("Error", response.error, saveCallback(closeModal));
        }
      } catch (error) {
        handleRetry("Uncaught Error", error.message, saveCallback(closeModal));
      } finally {
        setIsModalOpen(true);
      }

      closeModal();
    };

    createFormModal({
      headingText: "Add New User",
      elements: contentElements,
      saveCallback: saveCallback,
    });
  };
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
          data: selectedRows.map((row) =>
            row.Contact ? row.Contact : row.Answer
          ),
        },
      });

      if (response.flag) {
        showModal(
          "Info",
          `${response.data.deletedCount} ${response.data.message}`,
          ["Ok"],
          () => {
            setIsModalOpen(false);
            setSelectedRows([]);
            setIsSelectable(false);
          }
        );
      } else {
        handleRetry("Error", response.error, remove);
      }
    } catch (error) {
      handleRetry("Uncaught Error", error.message, remove);
    } finally {
      setIsModalOpen(true);
    }
  };
  const handleRetry = (type, message, retryFunction) => {
    setModalOptions({
      type,
      message,
      buttons: ["Retry", "Ok"],
      responseFunc: (button) => {
        if (button === "Retry") {
          retryFunction();
        } else {
          setIsModalOpen(false);
          setSelectedRows([]);
          setIsSelectable(false);
        }
      },
    });
  };

  const showModal = (type, message, buttons, responseFunc) => {
    setModalOptions({ type, message, buttons, responseFunc });
    setIsModalOpen(true);
  };

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const columns = [
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

  const data = tableData;

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
      <div className="students-action-div">
        <div
          style={{
            display: "inline-flex",
            textAlign: "start",
            flexDirection: "column",
          }}
        >
          <label style={{ marginLeft: "5px", marginBottom: "5px" }}>
            Upload {props.tablePageName}
          </label>
          <input name="student-list" id="students-list" type="file" required />
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileUpload(fetchData)}
            className="upload-button"
          >
            Upload
          </button>
          <button type="button" onClick={addNew} className="upload-button">
            Add New
          </button>
          <button type="button" onClick={remove} className="upload-button">
            Remove
          </button>
          {props.actionButtons && props.actionButtons}
        </div>
      </div>
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
          onSelectedRowsChange={handleRowSelected}
        />
      </div>
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
  DataTableManagement,
};
