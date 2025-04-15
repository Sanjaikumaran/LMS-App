import React, { useEffect, useState } from "react";
import ModuleCard from "../utils/ModuleCard";
import "../assets/styles/Admin.css";
import handleApiCall from "../utils/handleAPI";


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
            navigateTo="/users-module"
          />
          <ModuleCard
            header="Questions"
            imageSrc={require("./list.png")}
            altText="Test Icon"
            navigateTo="/questions-module"
          />
        </div>
        <div className="create-new-test">
          Create New Test
          <button onClick={() => (window.location.href = "/create-test")}>
            Create
          </button>
        </div>
        <div className="cards test-list">
          {tests &&
            tests.map((test) => (
              <ModuleCard
                key={test["Test Name"]}
                header={test["Test Name"]}
                imageSrc=""
                altText=""
                navigateTo={`/manage-test?id=${test._id}`}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Admin;
