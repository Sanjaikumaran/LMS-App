//import "../styles/Students.css";

import components from "./components";
const { DataTableManagement } = components;

const Students = () => {
  //const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  //if (userLogged.flag) {
  //  if (userLogged.userType !== "Admin") {
  //    window.location.href = "/";
  //  }
  //}
  return (
    <>
      <DataTableManagement
        tablePageName={"Students"}
        API={"Upload-data"}
        collectionName={"Users"}
      />
    </>
  );
};

export default Students;
