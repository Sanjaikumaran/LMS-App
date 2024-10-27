import "../styles/Students.css";
import { useState } from "react";
import components from "./components";
const { DataTableManagement, handleApiCall, Modal } = components;

const Tests = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const setTime = async () => {
    setIsFormModalOpen(true);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";

    const createInputField = (column, value = "") => {
      const inputField = document.createElement("input");
      inputField.className = column;
      inputField.placeholder = column;
      inputField.value = value;
      inputField.type = "number";
      return inputField;
    };
    try {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: collectionName },
      });

      if (response.flag) {
        response.data.forEach((value) => delete value["_id"]);
        response.data = response.data.filter(
          (data) => !data.hasOwnProperty("title")
        );
        if (response.data.length > 0) {
          setTableColumns(Object.keys(response.data[0]));
          setTableData(response.data);
        } else {
          showModal("Info", "No data available.", ["Ok"], () =>
            setIsModalOpen(false)
          );
          setIsModalOpen(true);
        }
      } else {
        showModal("Error", response.error, ["Retry", "Ok"], (button) => {
          if (button === "Retry") fetchData(collectionName);
          setIsModalOpen(false);
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      showModal(
        "Error",
        `Uncaught error: ${error.message}`,
        ["Retry", "Ok"],
        (button) => {
          if (button === "Retry") fetchData(collectionName);
          setIsModalOpen(false);
        }
      );
      setIsModalOpen(true);
    }
    axios
      .post(`http://${hosts[0]}:5000/find-data`, {
        collection: "Tests",
        condition: { title: "Time" },
      })
      .then((result) => {
        const data = result.data.result;
        ["Hours", "Minutes", "Seconds"].forEach((column) => {
          modalContainer.appendChild(createInputField(column, data[column]));
        });
      })
      .catch(() => {
        // If there's an error, allow manual input
        window.alert("Error fetching time data, please enter manually.");
        ["Hours", "Minutes", "Seconds"].forEach((column) => {
          modalContainer.appendChild(createInputField(column));
        });
      })
      .finally(() => {
        const saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.onclick = () => {
          let data = { title: "Time" };
          ["Hours", "Minutes", "Seconds"].forEach((column) => {
            const val = document.getElementsByClassName(column)[0].value;
            data[column] = parseInt(val, 10);
          });

          axios
            .post(`http://${hosts[0]}:5000/update-data`, {
              condition: { title: "Time" },
              data: data,
              collection: "Tests",
            })
            .then((result) => {
              if (result.data.upsertedCount || result.data.modifiedCount) {
                window.alert("Time updated successfully!");
              } else {
                throw new Error("No data found for update.");
              }
            })
            .catch(() => {
              // If no update, insert new data
              axios
                .post(`http://${hosts[0]}:5000/insert-data`, {
                  data,
                  collection: "Tests",
                })
                .then(() => {
                  window.alert("Time added successfully!");
                })
                .catch((error) => {
                  console.error(error);
                  window.alert("Error saving time data.");
                });
            });

          closeModalAndCleanup();
        };

        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.onclick = closeModalAndCleanup;

        modalContainer.appendChild(saveButton);
        modalContainer.appendChild(closeButton);
      });

    document.body.appendChild(modalContainer);

    const closeModalAndCleanup = () => {
      setIsFormModalOpen(false);
      modalContainer.remove();
      document.body.removeChild(overlay);
    };
  };
  return (
    <>
      <DataTableManagement
        tablePageName={"Test"}
        collectionName={"Tests"}
        actionButtons={
          <button
            type="button"
            className="upload-button"
            onClick={setTime}
          ></button>
        }
      />
    </>
  );
};

export default Tests;
