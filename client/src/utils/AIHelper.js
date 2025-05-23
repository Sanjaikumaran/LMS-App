import axios from "axios";

const generateDescription = async (title, field, updateForm, setError) => {
  if (title.trim() === "") {
    setError((prev) => ({ ...prev, [field]: "Title is required" }));
    updateForm(field)("");
    return;
  }
  setError((prev) => ({ ...prev, [field]: "" }));
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Title: ${title}

Instruction: Write a short and precise *description* for the above title, not an answer or explanation. 
- Do not repeat the title.
- Do not start with "The title is..."
- Use exactly 30 to 40 words.
- The output must read like a supporting description that adds context to the title.`,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
      },
    }
  );

  if (response.status === 200) {
    const content = response.data.choices[0].message.content.trim();
    updateForm(field)(content);

    return content;
  } else {
    console.error(response.error);
    return "Failed to generate description.";
  }
};

const generateQuestions = async (title) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Title: ${title}  
Generate 10 short and precise questions related to the title.  
- Include a mix of:
  - Single-select multiple-choice questions  
  - Multi-select multiple-choice questions  
  - Fill-in-the-blank questions  
  - Paragraph-type questions  

- Rules:
  - Do not repeat or refer to the title in any question.  
  - Options must be unique and maximum of 3 words.
  - For single/multi-select multiple-choice questions:
    - Provide a "Question" string.
    - Provide an "Options" array with exactly 4 choices.
    - Use the "Answer" array with one (single-select) or multiple (multi-select) correct values from the Options.
  - For fill-in-the-blank questions:
    - Use "____" for blanks.
    - "Options" must be ["None"].
    - "Answer" must be an array with correct value(s) in the order of the blanks.
  - For paragraph-type questions:
    - Use an open-ended question.
    - Set "Options" to ["Paragraph"].
    - Set "Answer" to ["Paragraph"].

- Output format (strictly as an array of objects):

[
  {
    "Question": "What is the capital of France?",
    "Options": ["Berlin", "Madrid", "Paris", "Rome"],
    "Answer": ["Paris"]
  },
  {
    "Question": "Select the primary colors.",
    "Options": ["Red", "Green", "Blue", "Yellow"],
    "Answer": ["Red", "Blue", "Yellow"]
  },
  {
    "Question": "The boiling point of water is ____ degrees Celsius.",
    "Options": ["None"],
    "Answer": ["100"]
  },
  {
    "Question": "Explain how climate change affects sea levels.",
    "Options": ["Paragraph"],
    "Answer": ["Paragraph"]
  }
]`,
          },
        ],
      },

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
        },
      }
    );
    console.log(
      "AI QUESTIONS",
      JSON.parse(response.data.choices[0].message.content)
    );
    if (response.status === 200) {
      const content = response.data.choices[0].message.content.trim();
      return JSON.parse(content);
    }
    return "Failed to generate questions.";
  } catch (error) {
    console.log(error);
  }
};

export { generateDescription, generateQuestions };
