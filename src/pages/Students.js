import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Students.css";
import DataTable from "react-data-table-component";
import { CgProfile } from "react-icons/cg";

const Students = ({ profile1 }) => {
  const [hosts, setHosts] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const localIps = sessionStorage.getItem("localIps");
    if (localIps) {
      setHosts(localIps.split(",")); // Ensure it's an array
    }
  }, []);

  useEffect(() => {
    if (hosts.length > 0) {
      loadData();
    }
  });

  const loadData = () => {
    if (!hosts[0]) return; // Ensure the host is available

    axios
      .post(`http://${hosts[0]}:5000/load-data`, {})
      .then((result) => {
        console.log("Uploaded to primary server");
        setTableColumns(Object.keys(result.data[0]).slice(1));
        setTableData(result.data);
      })
      .catch((error) => {
        console.error("Error uploading to primary server:", error);
      });
  };

  const showProfile = (profileDetails) => {
    const isExist = document.querySelector(".profile-container");
    if (isExist) return;

    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container";
    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";
    Object.keys(profileDetails).forEach((detail) => {
      const detailList = document.createElement("li");
      detailList.className = "detail";
      detailList.innerHTML = `<p><span>${detail}:</span>&nbsp;<span> ${profileDetails[detail]}</span></p>`;
      profileInfo.appendChild(detailList);
    });
    profileContainer.appendChild(profileInfo);
    document.body.appendChild(profileContainer);
  };

  const fileUpload = () => {
    let file = document.querySelector("#students-list").files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      axios
        .post(`http://${hosts[0]}:5000/Upload-file`, { data: reader.result })
        .then(() => {
          window.alert("Uploaded to primary server");
        })
        .catch(() => {
          if (hosts[1]) {
            axios
              .post(`http://${hosts[1]}:5000/Upload-file`, {
                data: reader.result,
              })
              .then(() => {
                console.log("Uploaded to secondary server");
              })
              .catch((error) => {
                console.error("Error uploading to secondary server:", error);
              });
          }
        });
    };

    reader.readAsText(file);
  };

  const columns = tableColumns.map((column) => ({
    name: column,
    selector: (row) => row[column],
    sortable: true,
  }));

  const data = tableData;

  const customStyles = {
    rows: {
      style: {
        maxHeight: "72px", // override the row height
      },
    },
    headCells: {
      style: {
        color: "white",
        fontSize: "larger",
        fontWeight: "bold",
        backgroundColor: "#007bff",
        paddingLeft: "8px", // override the cell padding for head cells
        paddingRight: "8px",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px", // override the cell padding for data cells
        paddingRight: "8px",
      },
    },
  };

  return (
    <>
      <div>
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
                showProfile(profile1);
              }}
              className="profile"
            >
              <CgProfile style={{ fontSize: "1.5rem" }} />
            </li>
          </div>
        </nav>
      </div>
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
          <button type="button" onClick={fileUpload} className="upload-button">
            Upload
          </button>
        </div>
      </div>
      <div className="datatable">
        <DataTable
          columns={columns}
          data={data}
          highlightOnHover
          striped
          fixedHeaderScrollHeight="90vh"
          defaultSortFieldId={1}
          selectableRows
          customStyles={customStyles}
          responsive
          fixedHeader
        />
      </div>
    </>
  );
};

export default Students;
