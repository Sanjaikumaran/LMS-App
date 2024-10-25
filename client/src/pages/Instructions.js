import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Instructions.css";
import components from "./components";
const { Navbar, Modal, Response } = components;

const Instructions = ({ instructions }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };
  const closeModal = (button) => {
    if (Response(["Yes", "No"], button)) {
      navigate("/quiz");
    } else {
      setIsModalOpen(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="instructionsDiv">
        <h1>INSTRUCTIONS</h1>
        <ul className="instructions">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
      <div className="start-test">
        <button onClick={handleButtonClick}>Start Test</button>
        {isModalOpen && (
          <Modal
            modalType="Confirm"
            modalMessage="Are you sure to start the test?"
            buttons={["Yes", "No"]}
            response={closeModal}
          />
        )}
      </div>
    </>
  );
};

export default Instructions;
