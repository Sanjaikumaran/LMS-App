import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Signin from "./pages/Signin";
import Instructions from "./pages/Instructions";
import Quiz from "./pages/Quiz";
import TestSummary from "./pages/TestSummary";
import Admin from "./pages/Admin";
import Students from "./pages/Students";
import Tests from "./pages/Tests";

const App = () => {
  useEffect(() => {
    const localIPs = process.env.REACT_APP_LOCAL_IP1;

    localStorage.setItem("localIps", localIPs);
  }, []);

  const instructions = [
    "Instruction 1: Please read carefully.",
    "Instruction 2: Choose the correct answers.",
    "Instruction 3: Time limit is 10 minutes.",
  ];

  return (
    <Router>
      <Routes>
        <Route
          index
          element={
            <>
              <ChangeTitle title="Home" />
              <Signin />
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
        />
        <Route
          path="/students-module"
          element={
            <>
              <ChangeTitle title="Students Module" />
              <Students />
            </>
          }
        />{" "}
        <Route
          path="/test-module"
          element={
            <>
              <ChangeTitle title="Test Module" />
              <Tests />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

const ChangeTitle = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
};

export default App;
