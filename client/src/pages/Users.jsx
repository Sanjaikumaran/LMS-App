import React from "react";
import DataTableManagement from "../utils/customTable";
const Users = () => {
  return (
    <>
      <DataTableManagement
        tablePageName={"Users"}
        API={"Upload-data"}
        collectionName={"Users"}
      />
    </>
  );
};

export default Users;
