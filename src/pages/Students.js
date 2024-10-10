import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Students.css";
import DataTable from "react-data-table-component";

import { CgProfile } from "react-icons/cg";

const Students = (profile1) => {
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
  const fileUpload = (flag) => {
    let file = document.querySelector("#students-list").files;
    file = file[0];
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        console.log(typeof reader.result);

        // First post attempt
        axios
          .post(`http://${dataa[0]}:5000/Upload-file`, {
            data: reader.result,
          })
          .then((result) => {
            console.log("Uploaded to primary server");
          })
          .catch((error) => {
            console.error("Error uploading to primary server:", error);

            // If the first post fails, try posting to the secondary server
            axios
              .post(`http://${dataa[1]}:5000/Upload-file`, {
                data: reader.result,
              })
              .then((result) => {
                console.log("Uploaded to secondary server");
              })
              .catch((error) => {
                console.error("Error uploading to secondary server:", error);
              });
          });
      },
      false
    );

    if (file) {
      reader.readAsText(file);
    }
  };

  const [dataa, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/data");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    axios.post(`http://${dataa[0]}:5000/load-data`);
  }, []);

  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Year",
      selector: (row) => row.year,
      sortable: true,
    },
  ];

  const data = [
    {
      id: 1,
      title: "Beetlejuice",
      year: "1988",
    },
    {
      id: 2,
      title: "Ghostbusters",
      year: "1984",
    },
  ];
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
      {/*Top Navigation Bar*/}
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
            </a>{" "}
            <li
              onClick={() => {
                showProfile(profile1);
              }}
              className="profile"
            >
              {<CgProfile style={{ fontSize: "1.5rem" }} />}
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
          <label
            style={{
              marginLeft: "5px",
              marginBottom: "5px",
            }}
          >
            Upload Students List
          </label>
          <input name="student-list" id="students-list" type="file" required />
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              fileUpload();
            }}
            className="upload-button"
          >
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
          //  progressPending
          responsive
          fixedHeader
        />
      </div>
    </>
  );
};

export default Students;
