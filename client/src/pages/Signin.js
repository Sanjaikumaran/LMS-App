import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signin.css";
import components from "./components";
const { Modal, response, MessageBox, handleApiCall } = components;

const Signin = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [userID, setUserID] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmedUserID = userID.trim();
    const trimmedPassword = userPassword.trim();

    if (!trimmedUserID || !trimmedPassword) {
      if (!trimmedUserID && !trimmedPassword) {
        setResponseMessage("Please Enter UserId & Password");
      } else if (!trimmedUserID) {
        setResponseMessage("Please Enter UserId");
      } else {
        setResponseMessage("Please Enter Password");
      }
    } else {
      try {
        const response = await handleApiCall({
          API: "login",
          data: { Id: trimmedUserID, userPass: trimmedPassword },
        });

        if (response && response.flag) {
          sessionStorage.setItem(
            "userLogged",
            JSON.stringify({
              flag: true,
              userType: response.data.data.userType,
            })
          );

          localStorage.setItem("userData", JSON.stringify(response.data.data));

          
          props.setUserID(response.data.data._id)
          setResponseMessage("");
          setIsModalOpen(true);
        } else {
          setResponseMessage(response.error);
        }
      } catch (error) {
        setResponseMessage("An error occurred. Please try again.");
        console.error("Login error:", error);
      }
    }
  };

  const closeModal = (button) => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (response(["Ok"], button)) {
      if (userData.userType === "Admin") {
        navigate("/admin");
        setIsModalOpen(false);
      } else {
        navigate("/home");
        setIsModalOpen(false);
      }
    }
  };

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
              name="user-id"
              type="text"
              value={userID}
              required
              onChange={(e) => {
                setResponseMessage(false);
                setUserID(e.target.value);
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={userPassword}
              required
              onChange={(e) => {
                setResponseMessage(false);
                setUserPassword(e.target.value);
              }}
            />
          </div>
          {responseMessage && <MessageBox message={responseMessage} />}
          <button type="button" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          modalType="Info"
          modalMessage="Login Successful!"
          buttons={["Ok"]}
          response={closeModal}
        />
      )}
    </>
  );
};

export default Signin;
