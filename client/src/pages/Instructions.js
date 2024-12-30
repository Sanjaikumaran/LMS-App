import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Instructions.css";
import components from "./components";
const { Modal, response } = components;

const Instructions = ({ instructions }) => {
  //const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  //if (userLogged.flag) {
  //  if (userLogged.userType !== "Student") {
  //    window.location.href = "/";
  //  }
  //}
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const handleButtonClick = () => {
    setIsModalOpen(true);
  };
  const closeModal = (button) => {
    if (response(["Yes", "No"], button)) {
      navigate(`/quiz?id=${id}`);
    } else {
      setIsModalOpen(false);
    }
  };
  return (
    <>
      <div className="instructions-div">
        <h1>INSTRUCTIONS</h1>
        <ul className="instructions">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
      <div className="start-test-div">
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
