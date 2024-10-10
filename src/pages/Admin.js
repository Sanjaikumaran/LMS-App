import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import { CgProfile } from "react-icons/cg";

const Admin = ({ profile1 }) => {
  const navigate = useNavigate();
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

  return (
    <>
      {/* Top Navigation Bar */}
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
      <div className="cards">
        <div className="card-container">
          <h1 className="card-header">Students Module</h1>
          <div className="card-body">
            <div>{/*<img src="" />*/}</div>

            <button
              onClick={() => {
                navigate("/students-module");
              }}
              type="button"
            >
              Open
            </button>
          </div>
        </div>
        <div className="card-container">
          <h1 className="card-header">Test Module</h1>
          <div className="card-body">
            <div className="institution-name">
              <h1>Image container</h1>
            </div>

            <button
              onClick={() => {
                navigate("/test-module");
              }}
              type="button"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
