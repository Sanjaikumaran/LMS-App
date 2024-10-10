import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signin.css";

const Signin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/instructions");
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
