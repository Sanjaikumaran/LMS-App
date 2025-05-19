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

export { generateDescription };
