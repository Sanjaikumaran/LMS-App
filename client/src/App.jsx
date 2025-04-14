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
import Navbar from "./utils/navBar";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  const [showProfile, setShowProfile] = useState(true);
  const [userData, setUserData] = useState();
  const [UserID, setUserID] = useState("");

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
      if (title === "Login") {
        setShowProfile(true);
      } else {
        setShowProfile(false);
      }
    }, [title]);
    return null;
  };
  return (
    <>
      <Router>
        <Navbar showProfile={showProfile} userData={userData} />
        <Routes>
          <Route
            path="/"
            index
            element={
              <>
                <ChangeTitle title="Login" />
                <Signin setShowProfile={setShowProfile} setUserID={setUserID} />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <>
                  <ChangeTitle title="Home" />
                  <AssignedQuiz UserID={UserID} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructions"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <>
                  <ChangeTitle title="Instructions" />
                  <Instructions instructions={instructions} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <>
                  <ChangeTitle title="Quiz" />
                  <Quiz UserID={UserID} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <>
                  <ChangeTitle title="Summary" />
                  <TestSummary />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <>
                  <ChangeTitle title="Admin" />
                  <Admin />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-test"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <>
                  <ChangeTitle title="Create Test" />
                  <CreateTest />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-test"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <>
                  <ChangeTitle title="Manage-Test" />
                  <Test />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users-module"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <>
                  <ChangeTitle title="Users Module" />
                  <Users />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions-module"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <>
                  <ChangeTitle title="Questions Module" />
                  <Question />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
