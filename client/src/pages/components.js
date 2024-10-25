import React, { useEffect, useState } from "react";
import "../styles/components.css";
import axios from "axios";
import { CgProfile } from "react-icons/cg";

const Navbar = (props) => {
  const [userData, setUserData] = useState();
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
            <a href="#home">Home</a>
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
const Response = (buttons, response) => {
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

const HandleApiCall = (props) => {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const localIps = localStorage.getItem("localIps");
    if (localIps) {
      setHosts(localIps.split(","));
    }
  }, []);

  useEffect(() => {
    if (hosts.length === 0) return;

    try {
      axios
        .post(`http://${hosts[0]}:5000/${props.API}`, {
          data: props.data,
        })
        .then((result) => {
          if (result.status === 200) {
            props.response(result.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error("API call failed:", error);
    }
  }, [hosts, props]);

  return null; // Adjust if you want to render something in this component
};
export default { Navbar, Modal, Response, HandleApiCall };
