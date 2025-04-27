import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useModal from "../../utils/useModal";

import Button from "../../utils/button";

import styles from "./instructions.module.css";

const Instructions = ({ instructions }) => {
  const navigate = useNavigate();
  const { showModal, closeModal, Modal } = useModal();

  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");

  const handleButtonClick = () => {
    showModal("Confirm", "Are you sure to start the test?", [
      {
        label: "Yes",
        shortcut: "Enter",
        onClick: () => navigate(`/quiz?id=${id}`),
      },
      { label: "No", shortcut: "Escape", onClick: () => closeModal },
    ]);
  };

  return (
    <>
      <div className={styles.instructionsContainer}>
        <h1 className={styles.instructionsTitle}>Instructions</h1>
        <p className={styles.instructionsDescription}>
          Please read the following instructions carefully before starting the
          test.
        </p>
        <ul>
          {instructions.map((instruction, index) => (
            <li key={index} className={styles.instructionsList}>
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.buttonContainer}>
        <Button onClick={handleButtonClick} className="start-test-button">
          Start Test
        </Button>

        <Modal />
      </div>
    </>
  );
};

export default Instructions;
