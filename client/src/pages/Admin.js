import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Admin.css";
import Navbar from "./components";
import { CgProfile } from "react-icons/cg";

const Admin = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState();
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setUserData(userData);
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
      <Navbar />
      <div className="cards">
        <div className="card-container">
          <h1 className="card-header">Students Module</h1>
          <div className="card-body">
            <div>
              <img
                src="/home/sk/Documents/quiz-app/src/pages/education.png"
                alt="Students Icon"
              />
            </div>

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
