import Papa from "papaparse";
import * as XLSX from "xlsx";

import handleApiCall from "./handleAPI";
import Input from "./input";

const fileUpload = (
  fetchCallback,
  fileInput,
  apiEndpoint,
  collectionName,
  showModal,
  closeModal,
  submitCallback = null
) => {
  if (!fileInput.files[0]) {
    showModal("Error", "No file is selected.", [
      {
        label: "Select File",
        shortcut: "Enter",
        onclick: () => {
          fileInput.click();
          closeModal();
        },
      },
      { label: "Cancel", shortcut: "Escape", onclick: closeModal },
    ]);
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  const fileType = file.name.split(".").pop().toLowerCase();
  let groupName;

  const GIFTParser = (text) => {
    const questions = [];
    const regex = /::Question \d+:: (.*?)\n\{([\s\S]*?)\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const questionText = match[1].trim();
      const optionsBlock = match[2].trim().split("\n");

      const options = [];
      const correctAnswers = [];

      optionsBlock.forEach((option) => {
        const optionText = option.replace(/[=~]/g, "").trim();
        if (option.trim().startsWith("=")) correctAnswers.push(optionText);
        options.push(optionText);
      });

      questions.push({
        Question: questionText,
        Option: options,
        Answer: correctAnswers,
      });
    }
    return questions;
  };

  const normalizeQuestions = (data) =>
    data
      .map(([question, options, answers]) => {
        if (
          !question ||
          ["question", "questions"].includes(question.toLowerCase().trim())
        )
          return null;

        const optionList = options
          ? options.split(/::|,,/).map((o) => o.trim())
          : ["None"];
        const answerList = answers
          ? answers.split(/::|,,/).map((a) => a.trim())
          : [];

        return {
          Question: question.trim(),
          Option: optionList,
          Answer: answerList,
        };
      })
      .filter(Boolean);

  const handleUpload = async (data) => {
    try {
      const response = await handleApiCall({
        API: apiEndpoint,
        data: { data, collection: collectionName },
      });

      if (response.flag) {
        submitCallback && submitCallback(groupName);
        fetchCallback();
        showModal("Info", "Data Uploaded Successfully!", {
          label: "Ok",
          shortcut: "Enter",
          onclick: () => {
            fileInput.value = "";
            closeModal();
          },
        });
      } else {
        showModal("Error", response.error, [
          { label: "Retry", shortcut: "Enter", onclick: retryUpload },
          {
            label: "Cancel",
            shortcut: "Escape",
            onclick: () => {
              fileInput.value = "";
              closeModal();
            },
          },
        ]);
      }
    } catch (error) {
      showModal("Error", `Uncaught error: ${error.message || error}`, [
        { label: "Retry", shortcut: "Enter", onclick: retryUpload },
        {
          label: "Cancel",
          shortcut: "Escape",
          onclick: () => {
            fileInput.value = "";
            closeModal();
          },
        },
      ]);
    }
  };

  const retryUpload = () => {
    fileUpload(
      fetchCallback,
      fileInput,
      apiEndpoint,
      collectionName,
      showModal,
      closeModal,
      submitCallback
    );
  };

  reader.onload = async () => {
    let insertData;

    switch (fileType) {
      case "csv":
        const parsed = Papa.parse(reader.result).data;
        insertData =
          collectionName === "Users" ? parsed : normalizeQuestions(parsed);
        break;

      case "gift":
        insertData = GIFTParser(reader.result);
        break;

      case "xlsx":
        const workbook = XLSX.read(reader.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const rowArray = jsonData.map((obj) => [
          obj.Question,
          obj.Options,
          obj.Answers,
        ]);
        insertData = normalizeQuestions(rowArray);
        break;

      default:
        showModal("Error", "Unsupported file type.", [
          { label: "Ok", shortcut: "Enter", onclick: closeModal },
        ]);
        return;
    }

    if (apiEndpoint === "Upload-question") {
      showModal("Enter Question Group Name", <Input id="groupName" />, [
        {
          label: "Ok",
          shortcut: "Enter",
          onclick: () => {
            groupName = document.getElementById("groupName").value.trim();
            insertData = insertData.map((q) => ({
              ...q,
              Group: groupName,
            }));
            handleUpload(insertData);
          },
        },
        { label: "Cancel", shortcut: "Escape", onclick: closeModal },
      ]);
    } else {
      handleUpload(insertData);
    }
  };

  if (fileType === "xlsx") {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }

  return;
};

export default fileUpload;
