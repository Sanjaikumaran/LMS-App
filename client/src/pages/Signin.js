import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signin.css";
import components from "./components";
const { HandleApiCall, Modal, Navbar, Response } = components;

const Signin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const navigate = useNavigate();

  const handleLogin = () => {
    const userID = document.getElementsByName("user-id")[0].value;
    const userPassword = document.getElementsByName("password")[0].value;
    setCredentials({
      API: "login",
      data: { Id: userID, userPass: userPassword },
    });
  };

  useEffect(() => {
    if (apiData) {
      localStorage.setItem("userData", JSON.stringify(apiData));
      setIsModalOpen(true);
    }
  }, [apiData]);

  const closeModal = (button) => {
    if (Response(["Ok"], button)) {
      navigate("/instructions");
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Navbar page={true} />

      <div className="login-container">
        <h1 className="login-header">Login</h1>
        <div className="login-form">
          <div className="institution-name">
            <h1>Jeppiaar University</h1>
          </div>
          <div className="input-group">
            <label htmlFor="user-id">User ID</label>
            <input name="user-id" type="text" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input name="password" type="password" required />
          </div>
          <button onClick={handleLogin} type="button">
            Login
          </button>
        </div>
      </div>
      {credentials && (
        <HandleApiCall
          API={credentials.API}
          data={credentials.data}
          response={setApiData}
        />
      )}
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
