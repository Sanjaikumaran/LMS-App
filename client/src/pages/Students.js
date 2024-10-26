import React, { useState, useEffect, createElement } from "react";
import axios from "axios";
import "../styles/Students.css";
import DataTable from "react-data-table-component";

import components from "./components";
const { Navbar, handleApiCall, Modal } = components;

const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();

  const [hosts, sd] = useState(false);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [isSelectable, setIsSelectable] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: "Users" },
      });

      if (response.flag) {
        response.data.forEach((value) => {
          delete value["_id"];
        });

        if (response.data.length > 0) {
          setTableColumns(Object.keys(response.data[0]));
          setTableData(response.data);
        } else {
          setTableColumns([]);
          setTableData([]);
          setModalOptions({
            type: "Info",
            message: "No data available.",
            buttons: ["Ok"],
            responseFunc: () => setIsModalOpen(false),
          });
          setIsModalOpen(true);
        }
      } else {
        setModalOptions({
          type: "Error",
          message: response.error,
          buttons: ["Retry", "Ok"],
          responseFunc: (button) => {
            if (button === "Retry") {
              fetchData();
            }
            setIsModalOpen(false);
          },
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      setModalOptions({
        type: "Error",
        message: `Uncaught error: ${error.message}`,
        buttons: ["Retry", "Ok"],
        responseFunc: (button) => {
          if (button === "Retry") {
            fetchData();
          }
          setIsModalOpen(false);
        },
      });
      setIsModalOpen(true);
    }
  }

  const fileUpload = (fetchData) => {
    const file = document.querySelector("#students-list");
    if (!file.files[0]) return;

    const reader = new FileReader();
    reader.readAsText(file.files[0]);

    reader.onload = async () => {
      try {
        const response = await handleApiCall({
          API: "Upload-data",
          data: reader.result,
        });

        if (response.flag) {
          fetchData();
          setModalOptions({
            type: "Info",
            message: "Data Uploaded Successfully!",
            buttons: ["Ok"],
            responseFunc: (button) => {
              if (button === "Ok") {
                file.value = "";
                setIsModalOpen(false);
              }
            },
          });
        } else {
          setModalOptions({
            type: "Error",
            message: response.error,
            buttons: ["Retry", "Ok"],
            responseFunc: (button) => {
              if (button === "Retry") {
                fileUpload(fetchData); // Retry with the same callback
              } else {
                file.value = "";
                setIsModalOpen(false);
              }
            },
          });
        }
      } catch (error) {
        setModalOptions({
          type: "Error",
          message: `Uncaught error: ${error.message}`,
          buttons: ["Retry", "Ok"],
          responseFunc: (button) => {
            if (button === "Retry") {
              fileUpload(fetchData);
            } else {
              file.value = "";
              setIsModalOpen(false);
            }
          },
        });
      } finally {
        setIsModalOpen(true);
      }
    };
  };

  const addNew = () => {
    setIsFormModalOpen(true);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";

    const heading = document.createElement("h1");
    heading.innerText = "Add New User";
    modalContainer.appendChild(heading);

    tableColumns.forEach((column) => {
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      modalContainer.appendChild(inputField);
    });

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.onclick = async () => {
      let data = {};
      tableColumns.forEach((column) => {
        const val = document.getElementsByClassName(column)[0].value;
        data[column] = val;
      });
      try {
        const response = await handleApiCall({
          API: "insert-data",
          data: { data: data, collection: "Users" },
        });

        if (response.flag) {
          setTableData([...tableData, data]);
          setModalOptions({
            type: "Info",
            message: "Data Inserted successfully!",
            buttons: ["Ok"],
            responseFunc: (button) => {
              if (button === "Ok") {
                setIsModalOpen(false);
              }
            },
          });
        } else {
          setModalOptions({
            type: "Error",
            message: response.error,
            buttons: ["Retry", "Ok"],
            responseFunc: (button) => {
              if (button === "Retry") {
                saveButton.click();
              }
              setIsModalOpen(false);
            },
          });
        }
      } catch (error) {
        setModalOptions({
          type: "Uncaught Error",
          message: error.message,
          buttons: ["Retry", "Ok"],
          responseFunc: (button) => {
            if (button === "Retry") {
              saveButton.click();
            }
            setIsModalOpen(false);
          },
        });
      } finally {
        setIsModalOpen(true);
      }

      modalContainer.remove();
      document.body.removeChild(overlay);
      setIsFormModalOpen(false);
    };

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.onclick = () => {
      setIsFormModalOpen(false);

      modalContainer.remove();
      document.body.removeChild(overlay);
    };

    modalContainer.appendChild(saveButton);
    modalContainer.appendChild(closeButton);
    document.body.appendChild(modalContainer);
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
          .post(`http://192.168.1.152:5000/delete-data`, {
            collection: "Users",
            data: selectedRows.map((row) => row.Contact), // Sending the _id values
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
            Upload Students List
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
          selectableRows={isSelectable} // Conditional selection
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

export default Students;
