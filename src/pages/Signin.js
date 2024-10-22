import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signin.css";
import axios from "axios";

const Signin = ({ handleUserData }) => {
  const [hosts, setHosts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const localIps = localStorage.getItem("localIps");

    if (localIps) {
      setHosts(JSON.parse(localIps));
    }
  }, []);
  const handleLogin = () => {
    const userID = document.getElementsByName("user-id")[0].value;
    const userPassword = document.getElementsByName("password")[0].value;

    //08148802594
    axios
      .post(`http://${hosts[0]}:5000/login`, {
        Id: userID,
        password: userPassword,
      })
      .then((result) => {
        window.alert("User Authentication Successful!");
        //handleUserData(result.data);
        localStorage.setItem("userData", JSON.stringify(result.data));
        navigate("/instructions");
      });
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
            </a>
          </div>
        </nav>
      </div>

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
    </>
  );
};

export default Signin;
