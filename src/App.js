import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Quiz from "./pages/Quiz";
import Instructions from "./pages/Instructions";
import Signin from "./pages/Signin";
import Admin from "./pages/Admin";
import Students from "./pages/Students";

const App = () => {
  const initialTime = 100; // Time for the quiz (in minutes)

  // Example questions data
  const questions = [
    {
      question: "Which of the following are fruits?",
      type: "checkbox",
      options: ["Apple", "Carrot", "Banana", "Broccoli"],
    },
    {
      question: "What is the capital of France?",
      type: "radio",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
    },
    // Add more questions here
  ];

  const instructions = [
    "Instruction 1: Please read carefully.",
    "Instruction 2: Choose the correct answers.",
    "Instruction 3: Time limit is 10 minutes.",
  ];

  const profile = {
    Name: "SK",
    Department: "B.E Computer Science And Engineering",
    "Roll Number": "310821104083",
  };

  return (
    <Router>
      <Routes>
        <Route index element={<Signin />} />
        <Route
          path="/instructions"
          element={
            <Instructions instructions={instructions} profile1={profile} />
          }
        />
        <Route
          path="/quiz"
          element={
            <Quiz
              initialTime={initialTime}
              profile1={profile}
              questions={questions}
            />
          }
        />
        <Route
          path="/admin"
          element={<Admin initialTime={initialTime} profile1={profile} />}
        />
        <Route
          path="/students-module"
          element={<Students profile1={profile} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
