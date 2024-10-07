import React, { useState, useEffect } from "react";
import Quiz from "./components/Quiz";
import Instructions from "./components/Instructions";

const App = () => {
  // Retrieve the flag from localStorage or default to 0
  const [flag, setFlag] = useState(() => {
    const savedFlag = localStorage.getItem("flag");
    return savedFlag !== null ? JSON.parse(savedFlag) : 0;
  });

  const initialTime = 10; // Time for the quiz (in minutes)

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
    {
      question: "Which programming languages do you know?",
      type: "checkbox",
      options: ["Python", "JavaScript", "C++", "Ruby"],
    },
    {
      question: "What is the largest planet in our solar system?",
      type: "radio",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
    },
    {
      question: "What is the largest planet in our solar system?",
      type: "radio",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
    },
  ];

  const instructions = [
    "Instruction 1: Please read carefully.",
    "Instruction 2: Choose the correct answers.",
    "Instruction 3: Time limit is 10 minutes.",
    "Instruction 4: Once you start the quiz, no going back.",
    "Instruction 5: Submit your answers at the end.",
  ];

  // Whenever `flag` changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem("flag", JSON.stringify(flag));
  }, [flag]);

  return (
    <>
      {flag === 0 ? (
        <div className="App">
          <Instructions instructions={instructions} setFlag={setFlag} />
        </div>
      ) : (
        <div className="App">
          <Quiz initialTime={initialTime} questions={questions} />
        </div>
      )}
    </>
  );
};

export default App;
