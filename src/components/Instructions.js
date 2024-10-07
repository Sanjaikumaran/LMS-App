import React from "react";
import "../styles/Quiz.css";

const Instructions = ({ setFlag, instructions }) => {
  return (
    <>
      {/* Top Navigation Bar */}
      <div>
        <nav className="navbar">
          <div className="logo">Quizzards</div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a target="_blank" href="https://sanjaikumaran.online/contact/">
              Contact
            </a>
          </div>
        </nav>
      </div>
      <div>
        <h1>Instructions</h1>
        <ul>
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
      <div>
        <button onClick={() => setFlag(1)}>Start Test</button>
      </div>
    </>
  );
};

export default Instructions;
