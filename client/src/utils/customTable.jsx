import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Modal from "./modal";
import handleApiCall from "./handleAPI";
import FileUpload from "./fileUpload";
//import shortcut from "./shortcut";
//import createFormModal from "./formModal";
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
const ActionDiv = ({
  tablePageName,
  onFileUpload,
  onAddNew,

  onRemove,
  actionButtons,
}) => {
  const uploadFile = () => {
    onFileUpload(document.querySelector("#data-file"));
  };
  return (
    <div className="action-div">
      <div className="upload-file">
        <label>Upload {tablePageName}</label>
        <input name="list" id="data-file" type="file" required />
      </div>
      <div>
        <button type="button" onClick={uploadFile}>
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
  //shortcut("esc", () => {
  //  setIsModalOpen(false);
  //});
  //var enterShortcutFunction = null;
  //shortcut("enter", () => {
  //  enterShortcutFunction && enterShortcutFunction();
  //  enterShortcutFunction = null;
  //});
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
        //enterShortcutFunction = () => {
        //  fetchData(collectionName);
        //  setIsModalOpen(false);
        //};
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
      //enterShortcutFunction = () => {
      //  fetchData(collectionName);
      //  setIsModalOpen(false);
      //};
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
      //enterShortcutFunction = () => {
      //  setIsSelectable(false);
      //  setIsModalOpen(false);
      //};
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

          //enterShortcutFunction = () => {
          //  setTableData([...tableData, data]);
          //  setIsModalOpen(false);
          //};
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
  useEffect(() => {
    console.log("Table Data Updated:", tableData);
  }, [tableData]);
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

export default DataTableManagement;
