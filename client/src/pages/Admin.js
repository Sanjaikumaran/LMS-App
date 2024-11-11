import React, { useEffect, useState } from "react";
import components from "./components";
import "../styles/Admin.css";
const { ModuleCard, handleApiCall } = components;

const Admin = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "Tests" },
        });
        if (response.flag) {
          setTests(response.data.data);
          console.log(response.data.data);
        } else {
          console.log("No data found.");
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div style={{ padding: "" }}>
        <div className="cards">
          <ModuleCard
            header="Users"
            imageSrc={require("./education.png")}
            altText="Students Icon"
            navigateTo="/students-module"
          />
          <ModuleCard
            header="Questions"
            imageSrc={require("./list.png")}
            altText="Test Icon"
            navigateTo="/test-module"
          />
        </div>
        <div className="create-new-test">
          Create New Test{" "}
          <button onClick={() => (window.location.href = "/create-test")}>
            Create
          </button>
        </div>
        <div className="cards test-list">
          {tests &&
            tests.map((test) => (
              <ModuleCard
                key={test["Test Name"]} // Add a unique key to the ModuleCard
                header={test["Test Name"]}
                imageSrc="" // You can add an image URL here
                altText=""
                navigateTo="/test-module"
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Admin;
