import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components.css";
import axios from "axios";
import { CgProfile } from "react-icons/cg";

const Navbar = (props) => {
  const [userData, setUserData] = useState();
  const navigate = useNavigate();
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
            <a
              href="#home"
              onClick={() => {
                navigate("/admin");
              }}
            >
              Home
            </a>
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
const MessageBox = (props) => {
  return (
    <>
      <div className="error-message" style={{ color: "red" }}>
        {props.message}
      </div>
    </>
  );
};
const handleApiCall = async (props) => {
  const localIps = localStorage.getItem("localIps").split(",");

  try {
    return await axios
      .post(`http://${localIps[0]}:5000/${props.API}`, {
        data: props.data,
      })
      .then((result) => {
        if (result.status === 200) {
          return { data: result.data, flag: true };
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
        <div>
          <img src={props.imageSrc} alt={props.altText} />
        </div>
        <button onClick={() => navigate(props.navigateTo)} type="button">
          Open
        </button>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  Navbar,
  Modal,
  Response,
  MessageBox,
  handleApiCall,
  ModuleCard,
};
