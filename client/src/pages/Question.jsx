import React from "react";
import DataTableManagement from "../utils/customTable";

const Questions = () => {
  return (
    <>
      <DataTableManagement
        tablePageName={"Question"}
        collectionName={"Questions"}
        API={"Upload-question"}
      />
    </>
  );
};

export default Questions;
