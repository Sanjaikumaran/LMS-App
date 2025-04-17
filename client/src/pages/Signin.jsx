import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import MessageBox from "../utils/MessageBox";

import useModal from "../utils/useModal";
import shortcut from "../utils/shortcut";
import handleApiCall from "../utils/handleAPI";

import "../assets/styles/Signin.css";

const Signin = ({ setUserID }) => {
  const [responseMessage, setResponseMessage] = useState(null);
  const [userID, setUserIDInput] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const navigate = useNavigate();

  const { isModalOpen, showModal, closeModal, Modal } = useModal();

  const navigateTo = useCallback(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    navigate(userData.userType === "Admin" ? "/admin" : "/home");
    closeModal();
  }, [navigate, closeModal]);

  const handleLogin = useCallback(async () => {
    const trimmedUserID = userID.trim();
    const trimmedPassword = userPassword.trim();

    if (!trimmedUserID || !trimmedPassword) {
      setResponseMessage(
        !trimmedUserID && !trimmedPassword
          ? "Please Enter UserId & Password"
          : !trimmedUserID
          ? "Please Enter UserId"
          : "Please Enter Password"
      );
      return;
    }

    try {
      const response = await handleApiCall({
        API: "login",
        data: { Id: trimmedUserID, userPass: trimmedPassword },
      });

      if (response?.flag) {
        const userData = response.data.data;
        sessionStorage.setItem(
          "userLogged",
          JSON.stringify({ flag: true, userType: userData.userType })
        );
        localStorage.setItem("userData", JSON.stringify(userData));
        setUserID(userData._id);
        setResponseMessage("");

        showModal("Info", "Login Successful!", [
          { label: "Ok", shortcut: "Enter", onClick: navigateTo },
        ]);
      } else {
        setResponseMessage(response?.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setResponseMessage("An error occurred. Please try again.");
    }
  }, [userID, userPassword, setUserID, showModal, navigateTo]);

  shortcut(
    "enter",
    () => {
      isModalOpen ? navigateTo() : handleLogin();
    },
    null,
    true
  );

  return (
    <>
      <div className="login-container">
        <h1 className="login-header">Login</h1>
        <div className="login-form">
          <div className="institution-name">
            <h1>Jeppiaar University</h1>
          </div>

          <div className="input-group">
            <label htmlFor="user-id">User ID</label>
            <input
              id="user-id"
              type="text"
              value={userID}
              required
              onChange={(e) => {
                setResponseMessage(null);
                setUserIDInput(e.target.value);
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={userPassword}
              required
              onChange={(e) => {
                setResponseMessage(null);
                setUserPassword(e.target.value);
              }}
            />
          </div>

          {responseMessage && <MessageBox message={responseMessage} />}

          <button
            type="button"
            onClick={handleLogin}
            className="tooltip"
            tooltip="Enter"
          >
            Login
          </button>
        </div>
      </div>
      <Modal />
    </>
  );
};

export default Signin;
