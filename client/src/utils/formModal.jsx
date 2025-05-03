import React, { useEffect, useCallback } from "react";
import Button from "./button";

const FormModal = ({ headingText, elements, saveCallback, onClose }) => {
  const closeModal = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    const overlay = document.createElement("div");
    overlay.className = "modal-background";
    document.body.appendChild(overlay);
    return () => {
      document.body.removeChild(overlay);
    };
  }, []);

  const handleSave = () => {
    if (typeof saveCallback === "function") {
      const result = saveCallback(closeModal);
      if (typeof result === "function") result(); // handles saveCallback(closeModal)()
    }
  };

  return (
    <div className="modal-container" role="dialog" aria-modal="true">
      <h1 className="card-header">{headingText}</h1>
      <div className="card-body">
        {elements.map((el, index) => (
          <React.Fragment key={index}>{el}</React.Fragment>
        ))}
        <div className="modal-buttons">
          <Button shortcut="Escape" onClick={closeModal}>
            Close
          </Button>
          <Button shortcut="Enter" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
