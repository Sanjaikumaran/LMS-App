import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signin from "./pages/Signin";
import AssignedQuiz from "./pages/AssignedQuiz";
import Instructions from "./pages/Instructions";
import Quiz from "./pages/Quiz";
import TestSummary from "./pages/TestSummary";
import Admin from "./pages/Admin";
import CreateTest from "./pages/CreateTest";
import Users from "./pages/Users";
import Question from "./pages/Question";
import Test from "./pages/Test";
import components from "./pages/components";
const { Navbar } = components;

const App = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState();

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userDetails._id) {
      delete userDetails["_id"];
      delete userDetails["Group"];
      delete userDetails["userType"];
      delete userDetails["Password"];

      setUserData(userDetails);
    }
  }, [showProfile]);

  const instructions = [
    "Instruction 1: Please read carefully.",
    "Instruction 2: Choose the correct answers.",
    "Instruction 3: Time limit is 10 minutes.",
  ];
  const ChangeTitle = ({ title }) => {
    useEffect(() => {
      document.title = title;
      if (title === "Home") {
        setShowProfile(true);
      } else {
        setShowProfile(false);
      }
    }, [title]);
    return null;
  };
  return (
    <>
      <Navbar showProfile={showProfile} userData={userData} />

      <Router>
        <Routes>
          <Route
            path="/"
            index
            element={
              <>
                <ChangeTitle title="Login" />
                <Signin setShowProfile={setShowProfile} />
              </>
            }
          />{" "}
          <Route
            path="/home"
            element={
              <>
                <ChangeTitle title="Home" />
                <AssignedQuiz />
              </>
            }
          />
          <Route
            path="/instructions"
            element={
              <>
                <ChangeTitle title="Instructions" />
                <Instructions instructions={instructions} />
              </>
            }
          />
          <Route
            path="/quiz"
            element={
              <>
                <ChangeTitle title="Quiz" />
                <Quiz />
              </>
            }
          />{" "}
          <Route
            path="/summary"
            element={
              <>
                <ChangeTitle title="Summary" />
                <TestSummary />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              <>
                <ChangeTitle title="Admin" />
                <Admin />
              </>
            }
          />{" "}
          <Route
            path="/create-test"
            element={
              <>
                <ChangeTitle title="Create Test" />
                <CreateTest />
              </>
            }
          />{" "}
          <Route
            path="/manage-test"
            element={
              <>
                <ChangeTitle title="Manage-Test" />
                <Test />
              </>
            }
          />
          <Route
            path="/users-module"
            element={
              <>
                <ChangeTitle title="Users Module" />
                <Users />
              </>
            }
          />{" "}
          <Route
            path="/questions-module"
            element={
              <>
                <ChangeTitle title="Questions Module" />
                <Question />
              </>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
