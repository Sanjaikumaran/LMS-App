import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import handleApiCall from "./handleAPI";
import FileUpload from "./fileUpload";
import FormModal from "./formModal";
import useModal from "./useModal";
import Button from "./button";
import Input from "./input";

const ActionDiv = ({
  tablePageName,
  onFileUpload,
  onAddNew,
  onRemove,
  actionButtons,
}) => {
  const uploadFile = () => onFileUpload(document.querySelector("#data-file"));
  return (
    <div className="action-div">
      <Input
        label={`Upload ${tablePageName}`}
        className="upload-file"
        type="file"
        onChange={(value, e) =>
          console.log(document.querySelector("#data-file"))
        }
        id="data-file"
      />
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <Button onClick={uploadFile}>Upload</Button>
        <Button onClick={onAddNew}>Add New</Button>
        <Button onClick={onRemove}>Remove</Button>
        {actionButtons}
      </div>
    </div>
  );
};

const DataTableSection = ({ columns, data, onRowSelected, isSelectable }) => {
  const customStyles = {
    rows: {
      style: {
        maxHeight: "60px",
        width: "100%",
        minHeight: "35px",
        border: "1px solid #bebebe",
      },
    },
    headRow: {
      style: {
        minHeight: "40px",
        border: "1px solid #bebebe",
        borderBottom: "none",
      },
    },
    headCells: {
      style: {
        color: "#080c2bcc",
        fontSize: "15px",
        fontWeight: "bold",
        borderRight: "1px solid #bebebe",
        padding: "2px 8px",
        width: "100%",
      },
    },
    cells: { style: { width: "100%", borderRight: "1px solid #bebebe" } },
  };

  return (
    <div className="data-table">
      <DataTable
        columns={columns}
        data={data}
        highlightOnHover
        // striped
        fixedHeader
        responsive
        fixedHeaderScrollHeight="80vh"
        defaultSortFieldId={1}
        customStyles={customStyles}
        selectableRows={isSelectable}
        onSelectedRowsChange={onRowSelected}
      />
    </div>
  );
};

const DataTableManagement = (props) => {
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modalProps, setModalProps] = useState(null);
  const { closeModal, showModal, Modal } = useModal();
  const inputsRef = useRef({});

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (collectionName = props.collectionName) => {
    try {
      const response = await handleApiCall({
        API: "load-data",
        data: { collection: collectionName },
      });

      if (response.flag) {
        const filtered =
          response.data.data?.filter((v) => !("title" in v)) || [];
        const studentRows = filtered.filter((v) => v.userType === "Student");
        const sample = studentRows[0] || filtered[0] || {};
        setTableColumns(Object.keys(sample));
        setTableData(
          studentRows.length
            ? studentRows
            : filtered.map((v) => ({
                ...v,
                Option: Array.isArray(v.Option)
                  ? v.Option.join(", ")
                  : v.Option,
                Answer: Array.isArray(v.Answer)
                  ? v.Answer.join(", ")
                  : v.Answer,
              }))
        );
      } else {
        showRetryModal("Info", response.error, () => fetchData(collectionName));
      }
    } catch (err) {
      showRetryModal("Error", err.message, () => fetchData(collectionName));
    }
  };

  const handleRowSelected = (state) => setSelectedRows(state.selectedRows);

  const remove = async () => {
    if (!isSelectable) return setIsSelectable(true);
    if (!selectedRows.length) return;

    const updatedData = tableData.filter((row) => !selectedRows.includes(row));
    setTableData(updatedData);

    try {
      const response = await handleApiCall({
        API: "delete-data",
        data: {
          collection: props.collectionName,
          data: selectedRows.map((row) => row._id),
        },
      });

      response.flag
        ? showModal(
            "Info",
            `${response.data.deletedCount} ${response.data.message}`,
            [{ label: "Ok", shortcut: "Enter", onclick: closeModal }]
          )
        : showRetryModal("Error", response.error, remove);
    } catch (error) {
      showRetryModal("Error", error.message, remove);
    }
  };

  const addNew = () => {
    const page = localStorage.getItem("page");
    inputsRef.current = {};
    let errors = {};

    const fields = tableColumns.filter(
      (col) =>
        col !== "_id" &&
        col !== "userType" &&
        col !== "Password" &&
        (page === "Questions" || col !== "Group")
    );

    const elements = fields.map((col) => (
      <Input
        key={col}
        onChange={(value) => {
          inputsRef.current[col] = value;
        }}
        placeholder={col}
        error={errors[col]}
        className={col}
      />
    ));

    setModalProps({
      headingText: "Add New " + page,
      elements,
      saveCallback: (closeModal) => async () => {
        const newData = Object.fromEntries(
          fields.map((col) => [col, inputsRef.current[col] || ""])
        );

        if (page === "Users") {
          newData["Group"] = newData["Department"] || "";
          newData["userType"] = "Student";
          newData["Password"] = "123";
        }

        let hasErrors = false;
        Object.keys(newData).forEach((key) => {
          if (newData[key] === "") {
            errors[key] = "Field is required";
            hasErrors = true;
          } else {
            errors[key] = "";
          }
        });

        if (hasErrors) {
          closeModal();

          showModal("Error", "Please fill all the fields!", [
            {
              label: "Ok",
              shortcut: "Enter",
              onclick: () => {
                closeModal();
              },
            },
          ]);
          return;
        }

        try {
          const response = await handleApiCall({
            API: "insert-data",
            data: { data: newData, collection: props.collectionName },
          });

          if (response.flag) {
                  closeModal();

            showModal("Info", "Data Inserted successfully!", [
              {
                label: "Ok",
                shortcut: "Enter",
                onclick: () => {
                  setTableData((prev) => [...prev, newData]);
                },
              },
            ]);
          } else {
            showRetryModal("Error", response.error, addNew);
          }
        } catch (err) {
          showRetryModal("Error", err.message, addNew);
        }
      },
      onClose: () => setModalProps(null),
    });
  };

  const showRetryModal = (type, message, retryFn) => {
    showModal(type, message, [
      { label: "Retry", shortcut: "Enter", onclick: retryFn },
      { label: "Cancel", shortcut: "Escape", onclick: closeModal },
    ]);
  };

  const columns = [
    {
      name: "SNo",
      selector: (_, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    ...tableColumns
      .filter((col) => !["_id", "userType", "Password"].includes(col))
      .map((col) => ({
        name: col,
        selector: (row) => row[col],
        sortable: true,
        wrap: true,
      })),
  ];

  return (
    <>
      {modalProps && <FormModal {...modalProps} />}
      <ActionDiv
        tablePageName={props.tablePageName}
        onFileUpload={(file) => {
          console.log(file);

          FileUpload(
            fetchData,
            file,
            props.API,
            props.collectionName,
            showModal
          );
        }}
        onAddNew={addNew}
        onRemove={remove}
        actionButtons={props.actionButtons}
      />
      <DataTableSection
        columns={columns}
        data={tableData}
        onRowSelected={handleRowSelected}
        isSelectable={isSelectable}
      />
      <Modal />
    </>
  );
};

export { DataTableManagement, DataTableSection };
