import components from "./components";
const { DataTableManagement } = components;

const Users = () => {
  //const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  //if (userLogged.flag) {
  //  if (userLogged.userType !== "Admin") {
  //    window.location.href = "/";
  //  }
  //}
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
