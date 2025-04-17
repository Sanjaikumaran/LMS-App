import React, { useState, useCallback } from "react";

const useModal = () => {
  const [isModalOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState({
    type: "",
    message: "",
    buttons: [], 
  });

  const showModal = useCallback((type, message, buttons) => {
    setModalOptions({ type, message, buttons });
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((callback) => {
    setIsOpen(false);
    if (typeof callback === "function") {
      setTimeout(callback, 0);
    }
  }, []);

  const Modal = () =>
    isModalOpen && (
      <div className="modal-background">
        <div className="modal-container">
          <h1 className="card-header">{modalOptions.type}</h1>
          <div className="card-body">
            <h3>{modalOptions.message}</h3>
            <div className="modal-buttons">
              {modalOptions.buttons.map(({ label, shortcut, onClick }, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onClick) onClick();
                    closeModal();
                  }}
                  className="tooltip"
                  tooltip={shortcut}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  return {isModalOpen, showModal, closeModal, Modal };
};

export default useModal;
