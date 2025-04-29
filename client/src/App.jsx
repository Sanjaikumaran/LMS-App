import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./utils/variable.css";
import Login from "./pages/Login";
import AssignedQuiz from "./pages/Home";
import Instructions from "./pages/Instruction";
import Quiz from "./pages/Test";
import TestSummary from "./pages/TestSummary";
import Admin from "./pages/AdminHome";
import CreateTest from "./pages/CreateTest";
import Users from "./pages/Users";
import Question from "./pages/Questions";
import Test from "./pages/ManageTest/Test";
import Navbar from "./utils/navBar";
import ProtectedRoute from "./utils/ProtectedRoute";
import { UserProvider } from "./utils/context/userContext";

const App = () => {
  const [showProfile, setShowProfile] = useState(true);

 
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
    <UserProvider>
      <Router>
        <Navbar showProfile={showProfile} />
        <Routes>
          <Route
            path="/"
            index
            element={
              <>
                <ChangeTitle title="Login" />
                <Login setShowProfile={setShowProfile}  />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <>
                  <ChangeTitle title="Home" />
                  <AssignedQuiz />
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
                  <Quiz />
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
    </UserProvider>
  );
};

export default App;
