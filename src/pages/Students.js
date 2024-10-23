import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Students.css";
import DataTable from "react-data-table-component";
import { CgProfile } from "react-icons/cg";

const Students = () => {
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
      setHosts(JSON.parse(localIps.split(",")));
    }
  }, []);

  useEffect(() => {
    if (hosts.length > 0) {
      loadData();
    }
  }, [hosts]);

  const loadData = () => {
    if (!hosts[0]) return;

    axios
      .post(`http://${hosts[0]}:5000/load-data`, { collection: "Users" })
      .then((result) => {
        setTableColumns(Object.keys(result.data[0]).slice(1));
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
    let file = document.querySelector("#students-list");
    if (!file.files[0]) return;

    const reader = new FileReader();
    reader.onload = () => {
      axios
        .post(`http://${hosts[0]}:5000/Upload-data`, { data: reader.result })
        .then(() => {
          window.alert("Uploaded to primary server");
          file.value = null;
          loadData();
        })
        .catch(() => {
          if (hosts[1]) {
            axios
              .post(`http://${hosts[1]}:5000/Upload-file`, {
                data: reader.result,
              })
              .then(() => {
                console.log("Uploaded to secondary server");
                loadData();
              })
              .catch((error) => {
                console.error("Error uploading to secondary server:", error);
              });
          }
        });
    };

    reader.readAsText(file.files[0]);
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

      axios
        .post(`http://${hosts[0]}:5000/insert-data`, {
          data,
          collection: "Users",
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
    //console.log(selectedRows);
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
      <nav className="navbar">
        <div className="logo">
          <h1 style={{ margin: 0 }}>Quizzards</h1>
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://sanjaikumaran.online/contact/"
          >
            Contact
          </a>
          <li
            onClick={() => {
              showProfile(userData);
            }}
            className="profile"
          >
            <CgProfile style={{ fontSize: "1.5rem" }} />
          </li>
        </div>
      </nav>
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
    </>
  );
};

export default Students;
