import React from "react";
import "../styles/Admin.css";
import components from "./components";
const { Navbar, ModuleCard } = components;

const Admin = () => {
  return (
    <>
      <>
        <Navbar />
      </>
      <div className="cards">
        <ModuleCard
          header="Students Module"
          imageSrc={require("./education.png")}
          altText="Students Icon"
          navigateTo="/students-module"
        />
        <ModuleCard
          header="Test Module"
          imageSrc="./education.png"
          altText="Test Icon"
          navigateTo="/tests-module"
        />
      </div>
    </>
  );
};

export default Admin;
