import React, { useEffect, useState } from "react";
import ModuleCard from "../../utils/ModuleCard";
import styles from "./admin.module.css";

import handleApiCall from "../../utils/handleAPI";
import IconAvatar from "../../assets/icons/education.png";
import IconList from "../../assets/icons/list.png";
import Button from "../../utils/button";

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
          console.log('[Admin Home] --> No Tests Found');
        }
      } catch (error) {
        console.log(`[Admin Home] --> ${error.message}`);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className={styles.cards}>
        <ModuleCard
          header="Users"
          imageSrc={IconAvatar}
          altText="Students Icon"
          navigateTo="/users-module"
        />
        <ModuleCard
          header="Questions"
          imageSrc={IconList}
          altText="Test Icon"
          navigateTo="/questions-module"
        />
      </div>
      <div className={styles.createTest}>
        Create New Test
        <Button onClick={() => (window.location.href = "/create-test")}>
          Create
        </Button>
      </div>
      <div className={styles.cards}>
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
    </>
  );
};

export default Admin;
