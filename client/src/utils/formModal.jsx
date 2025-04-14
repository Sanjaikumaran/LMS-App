import React, { useEffect } from "react";
import shortcut from "./shortcut";

const FormModal = ({ headingText, elements, saveCallback, onClose }) => {
  const closeModal = () => {
    if (onClose) onClose();
  };

  shortcut("esc", closeModal, null, true);
  shortcut("enter", () => saveCallback(closeModal));

  useEffect(() => {
    const overlay = document.createElement("div");
    overlay.className = "modal-background";
    document.body.appendChild(overlay);
    return () => overlay.remove();
  }, []);

  return (
    <div className="modal-container">
      <h1 className="card-header">{headingText}</h1>
      <div className="card-body">
        {elements.map((el, index) => (
          <React.Fragment key={index}>{el}</React.Fragment>
        ))}
        <div className="modal-buttons">
          <button className="red-bg tooltip" tooltip="Esc" onClick={closeModal}>
            Close
          </button>
          <button
            className="tooltip"
            tooltip="Enter"
            onClick={() => saveCallback(closeModal)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
