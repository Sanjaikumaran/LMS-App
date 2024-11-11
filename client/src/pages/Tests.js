import { useState } from "react";
import components from "./components";
const {
  DataTableManagement,
  handleApiCall,
  Modal,
  createFormModal,
} = components;

const Tests = () => {
  //const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  //if (userLogged.flag) {
  //  if (userLogged.userType !== "Admin") {
  //    window.location.href = "/";
  //  }
  //}
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState();

  const setTime = async () => {
    const createInputField = (column, value = "") => {
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      inputField.value = value;
      inputField.type = "number";
      return inputField;
    };
    const columns = ["Hours", "Minutes", "Seconds"];
    let contentElements = [];
    try {
      const response = await handleApiCall({
        API: "find-data",
        data: {
          collection: "Tests",
          condition: { key: "title", value: "Time" },
        },
      });

      contentElements = columns.map((column) =>
        createInputField(
          column,
          response.flag ? response.data.data[column] : ""
        )
      );
    } catch (error) {
      console.error(error.message);
      contentElements = columns.map((column) => createInputField(column));
    }

    const saveCallback = (closeModal) => async () => {
      let data = { title: "Time" };
      contentElements.forEach(
        (field) => (data[field.className] = parseInt(field.value, 10) || 0)
      );

      try {
        const response = await handleApiCall({
          API: "update-data",
          data: { condition: { title: "Time" }, data, collection: "Tests" },
        });
        if (response.flag) {
          showModal("Info", "Time Updated Successfully!", ["Ok"], () =>
            setIsModalOpen(false)
          );
          closeModal();
        } else {
          throw new Error("Update failed");
        }
      } catch (error) {
        try {
          const response = await handleApiCall({
            API: "insert-data",
            data: { data, collection: "Tests" },
          });
          showModal(
            response.flag ? "Info" : "Error",
            response.flag
              ? "Time Added Successfully!"
              : "Error Saving Time Data",
            ["Ok"],
            () => setIsModalOpen(false)
          );
          closeModal();
        } catch (error) {
          console.error(error);
          showModal("Uncaught Error", "Error Saving Time Data", ["Ok"], () =>
            setIsModalOpen(false)
          );
          closeModal();
        }
      }
    };

    createFormModal({
      headingText: "Set Time",
      elements: contentElements,
      saveCallback: saveCallback,
    });
  };

  const showModal = (type, message, buttons, responseFunc) => {
    setModalOptions({ type, message, buttons, responseFunc });
    setIsModalOpen(true);
  };
  return (
    <>
      <DataTableManagement
        tablePageName={"Test"}
        collectionName={"Tests"}
        API={"Upload-question"}
        actionButtons={
          <button type="button" onClick={setTime}>
            Set Time
          </button>
        }
      />
      {isModalOpen && (
        <Modal
          modalType={modalOptions.type || "Info"}
          modalMessage={modalOptions.message || "An unexpected issue occurred."}
          buttons={modalOptions.buttons || ["Ok"]}
          response={modalOptions.responseFunc || (() => setIsModalOpen(false))}
        />
      )}
    </>
  );
};

export default Tests;
