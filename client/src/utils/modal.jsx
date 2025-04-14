import React from "react";

const Modal = (props) => {
  return (
    <>
      <div className="modal-background">
        <div className="modal-container">
          <h1 className="card-header">{props.modalType}</h1>
          <div className="card-body">
            <h3>{props.modalMessage}</h3>
            <div className="modal-buttons">
              {props.buttons[0].map((button, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => props.response(button)}
                    className="tooltip"
                    tooltip={props.buttons[1][index]}
                  >
                    {button}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Modal;
