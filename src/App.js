import React from "react";
import Quiz from "./components/Quiz";

const App = () => {
  const initialTime = 10; // 5 minutes (300 seconds)

  // Example questions data
  const questions = [
    {
      question: "Which of the following are fruits?",
      type: "checkbox", // This will render checkboxes (multiple choice)
      options: ["Apple", "Carrot", "Banana", "Broccoli"],
    },
    {
      question: "What is the capital of France?",
      type: "radio", // This will render radio buttons (single choice)
      options: ["Berlin", "Madrid", "Paris", "Rome"],
    },
    {
      question: "Which programming languages do you know?",
      type: "checkbox", // Multiple choice
      options: ["Python", "JavaScript", "C++", "Ruby"],
    },
    {
      question: "What is the largest planet in our solar system?",
      type: "radio", // Single choice
      options: ["Earth", "Mars", "Jupiter", "Venus"],
    },{
      question: "What is the largasdasdadest planet in our solar system?",
      type: "radio", // Single choice
      options: ["Eardsath", "Mars", "Jupiter", "Venus"],
    },
  ];

  return (
    <div className="App">
      <Quiz initialTime={initialTime} questions={questions} />
    </div>
  );
};

export default App;
