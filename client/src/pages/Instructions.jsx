import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/styles/Instructions.css";

import shortcut from "../utils/shortcut";
import Modal from "../utils/modal";

const Instructions = ({ instructions }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  shortcut(
    "enter",
    () => isModalOpen && navigate(`/quiz?id=${id}`),
    null,
    true
  );
  shortcut("esc", () => setIsModalOpen(false), null, true);
  const handleButtonClick = () => {
    setIsModalOpen(true);
  };
  const closeModal = (button) => {
    if ("Yes" === button) {
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
            buttons={[
              ["Yes", "No"],
              ["Enter", "Esc"],
            ]}
            response={closeModal}
          />
        )}
      </div>
    </>
  );
};

export default Instructions;
