import React from "react";

import components from "./components";

const { ModuleCard } = components;

const Admin = () => {
  const userLogged = JSON.parse(sessionStorage.getItem("userLogged"));
  if (userLogged.flag) {
    if (userLogged.userType !== "Admin") {
      window.location.href = "/";
    }
  }
  return (
    <>
      <div className="cards">
        <ModuleCard
          header="Students Module"
          imageSrc={require("./education.png")}
          altText="Students Icon"
          navigateTo="/students-module"
        />
        <ModuleCard
          header="Test Module"
          imageSrc={require("./list.png")}
          altText="Test Icon"
          navigateTo="/test-module"
        />
      </div>
    </>
  );
};

export default Admin;
