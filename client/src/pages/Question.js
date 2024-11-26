import components from "./components";
const { DataTableManagement } = components;

const Questions = () => {
  const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  if (userLogged.flag) {
    if (userLogged.userType !== "Admin") {
      window.location.href = "/";
    }
  }

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
