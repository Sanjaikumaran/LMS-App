//import "../styles/Students.css";

import components from "./components";
const { DataTableManagement } = components;

const Students = () => {
  const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  if (userLogged.flag) {
    if (userLogged.userType !== "Admin") {
      window.location.href = "/";
    }
  }
  return (
    <>
      <DataTableManagement
        tablePageName={"Students"}
        collectionName={"Users"}
        API={"Upload-data"}
      />
    </>
  );
};

export default Students;
