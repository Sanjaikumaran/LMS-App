import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Instructions.css";
import { CgProfile } from "react-icons/cg";

const Instructions = ({ setFlag, instructions, profile1 }) => {
  const [userData, setUserData] = useState();
  const [hosts, setHosts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch local IPs from sessionStorage and set hosts state
    const localIps = JSON.parse(sessionStorage.getItem("localIps"));
    if (localIps) {
      setHosts(localIps);
    }
  }, []);

  setTimeout(
    useEffect(() => {
      // Fetch user profile data when hosts are available
      if (hosts.length > 0) {
        axios
          .post(`http://${hosts[0]}:5000/profile`)
          .then((response) => {
            setUserData(response.data); // Save user data to state
          })
          .catch((error) => {
            console.error("Error fetching profile:", error);
          });
      }
    }, [hosts]),
    100
  ); // Run this effect when 'hosts' changes

  const showProfile = (profileDetails) => {
    const isExist = document.querySelector(".profile-container");
    if (isExist) {
      return;
    }
    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container";
    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";

    Object.keys(profileDetails).forEach((detail) => {
      const detailList = document.createElement("li");
      detailList.classList = "detail";
      detailList.innerHTML = `<p><span>${detail}:</span>&nbsp;<span> ${profileDetails[detail]}</span></p>`;
      profileInfo.appendChild(detailList);
    });

    profileContainer.appendChild(profileInfo);
    document.body.appendChild(profileContainer);
  };

  // Close profile when clicking outside
  document.body.addEventListener("click", (event) => {
    if (
      event.target.closest("li.profile") ||
      event.target.closest("div.profile-container")
    ) {
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
          <div className="logo">Quizzards</div>
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
              {<CgProfile style={{ fontSize: "1.5rem" }} />}
            </li>
          </div>
        </nav>
      </div>
      <div className="instructionsDiv">
        <h1>INSTRUCTIONS</h1>
        <ul className="instructions">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
      <div className="start-test">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to start the test?")) {
              navigate("/quiz");
            }
          }}
        >
          Start Test
        </button>
      </div>
    </>
  );
};

export default Instructions;
