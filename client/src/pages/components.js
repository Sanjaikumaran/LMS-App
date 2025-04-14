import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import Papa from "papaparse";

import "../styles/components.css";
import axios from "axios";
import { CgProfile } from "react-icons/cg";
import * as XLSX from "xlsx";
const shortcut = (keyCombo, callback, targetRef, global) => {
  const handleKeyDown = (event) => {
    const keys = keyCombo.split("+");
    const isMatch = keys.every((key) => {
      if (key === "ctrl") return event.ctrlKey;
      if (key === "shift") return event.shiftKey;
      if (key === "alt") return event.altKey;
      if (key === "enter") return event.key === "Enter";
      if (key === "delete") return event.key === "Delete";
      if (key === "esc" || key === "escape") return event.key === "Escape";

      return event.key.toLowerCase() === key.toLowerCase();
    });

    if (isMatch) {
      if (
        global ||
        !targetRef ||
        targetRef.current?.contains(document.activeElement)
      ) {
        event.preventDefault();
        callback(event);
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
};
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
              {props.buttons[0].map((button, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => props.response(button)}
                    className="tooltip"
                    tooltip={props.buttons[1][index]}
                  >
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
  shortcut("esc", closeModal);
  shortcut("enter", props.saveCallback(closeModal));
  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "modal-buttons";
  const saveButton = document.createElement("button");
  saveButton.classList.add("tooltip");
  saveButton.setAttribute("tooltip", "Enter");
  saveButton.innerText = "Save";
  saveButton.onclick = props.saveCallback(closeModal);

  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";

  closeButton.setAttribute("tooltip", "Esc");
  closeButton.className = "red-bg tooltip";
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
const FileUpload = async (
  fetchCallback,
  fileName,
  apiEndpoint,
  collectionName,
  showModal,
  setIsModalOpen,
  submitCallback = null
) => {
  var groupName;
  var enterShortcutFunction = null;
  shortcut(
    "esc",
    () => {
      setIsModalOpen(false);
    },
    null,
    true
  );
  shortcut(
    "enter",
    () => {
      console.log(enterShortcutFunction);

      enterShortcutFunction && enterShortcutFunction();
      enterShortcutFunction = null;
    },
    null,
    true
  );

  if (!fileName.files[0]) {
    enterShortcutFunction = () => {
      fileName.click();
      setIsModalOpen(false);
    };

    showModal(
      "Error",
      "No file is selected.",
      [
        ["Select File", "Cancel"],
        ["Enter", "Esc"],
      ],
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
        submitCallback && submitCallback(groupName);
        fetchCallback();
        enterShortcutFunction = () => {
          fileName.value = "";
          setIsModalOpen(false);
        };

        showModal(
          "Info",
          "Data Uploaded Successfully!",
          [["Ok"], ["Enter"]],
          () => {
            enterShortcutFunction();
          }
        );
      } else {
        enterShortcutFunction = () => {
          fileName.value = "";
          retryUpload();
          setIsModalOpen(false);
        };
        showModal(
          "Error",
          response.error,
          [
            ["Retry", "Cancel"],
            ["Enter", "Esc"],
          ],
          (button) => {
            if (button === "Retry") retryUpload();
            fileName.value = "";
            setIsModalOpen(false);
          }
        );
      }
    } catch (error) {
      enterShortcutFunction = () => {
        fileName.value = "";
        retryUpload();
        setIsModalOpen(false);
      };
      showModal(
        "Error",
        `Uncaught error: ${error.message || error}`,
        [
          ["Retry", "Cancel"],
          ["Enter", "Esc"],
        ],
        (button) => {
          if (button === "Retry") retryUpload();
          fileName.value = "";
          setIsModalOpen(false);
        }
      );
    }
  };

  const retryUpload = () => {
    FileUpload(
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
          console.log(insertData);

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

        break;
      case "xlsx":
        const workbook = XLSX.read(reader.result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        insertData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const arrayData = insertData.map((obj) => {
          return [obj.Question, obj.Options, Object.Answers];
        });
        insertData = [Object.keys(insertData[0]), ...arrayData];
        console.log(insertData);

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
                    ? question[1].split(/::|,,/).map((option) => option.trim())
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
        break;
      default:
        enterShortcutFunction = () => {
          setIsModalOpen(false);
        };
        showModal("Error", "Unsupported file type.", [["Ok"], ["Enter"]], () =>
          setIsModalOpen(false)
        );
        return;
    }

    if (apiEndpoint === "Upload-question") {
      enterShortcutFunction = () => {
        groupName = document.getElementById("groupName").value;
        insertData = insertData.map((data) => ({
          ...data,
          Group: groupName,
        }));
        handleUpload(insertData);
      };
      showModal(
        "Enter Question Group Name",
        <input type="text" id="groupName" />,
        [
          ["Ok", "Cancel"],
          ["Enter", "Esc"],
        ],
        (button) => {
          if (button === "Ok") {
            groupName = document.getElementById("groupName").value;
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

  // Read the up based on its type
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
    rows: { style: { padding: "10px", maxHeight: "72px", width: "100%" } },
    headCells: {
      style: {
        color: "white",
        fontSize: "larger",
        fontWeight: "bold",
        backgroundColor: "#007bff",
        paddingLeft: "8px",
        paddingRight: "8px",
        width: "100%",
      },
    },
    cells: {
      style: { paddingLeft: "8px", paddingRight: "8px", width: "100%" },
    },
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
  shortcut("esc", () => {
    setIsModalOpen(false);
  });
  var enterShortcutFunction = null;
  shortcut("enter", () => {
    enterShortcutFunction && enterShortcutFunction();
    enterShortcutFunction = null;
  });
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
        setTableData(data.filter((value) => value.userType === "Student"));
      } else {
        enterShortcutFunction = () => {
          fetchData(collectionName);
          setIsModalOpen(false);
        };
        showModal(
          "Info",
          response.error,
          [
            ["Retry", "Cancel"],
            ["Enter", "Esc"],
          ],
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
    } catch (error) {
      enterShortcutFunction = () => {
        fetchData(collectionName);
        setIsModalOpen(false);
      };
      showModal(
        "Error",
        `Uncaught error: ${error.message}`,
        [
          ["Retry", "Cancel"],
          ["Enter", "Esc"],
        ],
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
      enterShortcutFunction = () => {
        setIsSelectable(false);
        setIsModalOpen(false);
      };
      response.flag
        ? showModal(
            "Info",
            `${response.data.deletedCount} ${response.data.message}`,
            [["Ok"], ["Enter"]],
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
      if ("_id" === column) {
        return null;
      }
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      inputs[column] = inputField;
      return inputField;
    });

    createFormModal({
      headingText: "Add New User",
      elements: contentElements.filter((element) => element !== null),
      saveCallback: (closeModal) => async () => {
        const data = tableColumns
          .filter((column) => column !== "_id")
          .reduce(
            (acc, column) => ({ ...acc, [column]: inputs[column].value }),
            {}
          );
        try {
          const response = await handleApiCall({
            API: "insert-data",
            data: { data, collection: props.collectionName },
          });
          enterShortcutFunction = () => {
            setTableData([...tableData, data]);
            setIsModalOpen(false);
          };
          response.flag
            ? showModal(
                "Info",
                "Data Inserted successfully!",
                [["Ok"], ["Enter"]],
                () => {
                  setTableData([...tableData, data]);
                  setIsModalOpen(false);
                }
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
      buttons: [
        ["Retry", "Cancel"],
        ["Enter", "Esc"],
      ],
      responseFunc: (button) => {
        if (button === "Retry") retryFunction();
        if (button === "Cancel") setIsModalOpen(false);
      },
    });
  };

  const showModal = (type, message, buttons, responseFunc) => {
    setModalOptions({ type, message, buttons, responseFunc });
    setIsModalOpen(true);
  };

  const columns = [
    {
      name: "SNo",
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
          FileUpload(
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

const useShortcut = (keyCombo, callback, targetRef = null, global = false) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keys = keyCombo.split("+");
      const isMatch = keys.every((key) => {
        if (key === "ctrl") return event.ctrlKey;
        if (key === "shift") return event.shiftKey;
        if (key === "alt") return event.altKey;
        if (key === "enter") return event.key === "Enter";
        if (key === "delete") return event.key === "Delete";
        if (key === "esc" || key === "escape") return event.key === "Escape";

        return event.key.toLowerCase() === key.toLowerCase();
      });

      if (isMatch) {
        if (
          global ||
          !targetRef ||
          targetRef.current?.contains(document.activeElement)
        ) {
          event.preventDefault();
          callback(event);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyCombo, callback, targetRef, global]);
};

const components = {
  Navbar,
  Modal,
  createFormModal,
  response,
  MessageBox,
  handleApiCall,
  ModuleCard,
  FileUpload,
  DataTableSection,
  DataTableManagement,
  useShortcut,
};

export default components;
