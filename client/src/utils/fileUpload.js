import Papa from "papaparse";
import * as XLSX from "xlsx";
import shortcut from "./shortcut";
import handleApiCall from "./handleAPI";

const fileUpload = async (
  fetchCallback,
  fileName,
  apiEndpoint,
  collectionName,
  showModal,
  setIsModalOpen,
  submitCallback = null
) => {
  var groupName;
  var enterShortcutFunction = null;

  shortcut(
    "esc",
    () => {
      setIsModalOpen(false);
    },
    null,
    true
  );

  shortcut(
    "enter",
    () => {
      enterShortcutFunction && enterShortcutFunction();
      enterShortcutFunction = null;
    },
    null,
    true
  );

  if (!fileName.files[0]) {
    enterShortcutFunction = () => {
      fileName.click();
      setIsModalOpen(false);
    };

    showModal(
      "Error",
      "No file is selected.",
      [
        ["Select File", "Cancel"],
        ["Enter", "Esc"],
      ],
      (button) => {
        if (button === "Select File") fileName.click();
        setIsModalOpen(false);
      }
    );
    return;
  }

  const reader = new FileReader();
  const fileType = fileName.files[0].name.split(".").pop().toLowerCase();

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

  const handleUpload = async (data) => {
    try {
      const response = await handleApiCall({
        API: apiEndpoint,
        data: { data, collection: collectionName },
      });

      if (response.flag) {
        submitCallback && submitCallback(groupName);
        fetchCallback();
        enterShortcutFunction = () => {
          fileName.value = "";
          setIsModalOpen(false);
        };

        showModal(
          "Info",
          "Data Uploaded Successfully!",
          [["Ok"], ["Enter"]],
          () => {
            enterShortcutFunction();
          }
        );
      } else {
        enterShortcutFunction = () => {
          fileName.value = "";
          retryUpload();
          setIsModalOpen(false);
        };
        showModal(
          "Error",
          response.error,
          [
            ["Retry", "Cancel"],
            ["Enter", "Esc"],
          ],
          (button) => {
            if (button === "Retry") retryUpload();
            fileName.value = "";
            setIsModalOpen(false);
          }
        );
      }
    } catch (error) {
      enterShortcutFunction = () => {
        fileName.value = "";
        retryUpload();
        setIsModalOpen(false);
      };
      showModal(
        "Error",
        `Uncaught error: ${error.message || error}`,
        [
          ["Retry", "Cancel"],
          ["Enter", "Esc"],
        ],
        (button) => {
          if (button === "Retry") retryUpload();
          fileName.value = "";
          setIsModalOpen(false);
        }
      );
    }
  };

  const retryUpload = () => {
    fileUpload(
      fetchCallback,
      fileName,
      apiEndpoint,
      collectionName,
      showModal,
      setIsModalOpen
    );
  };

  reader.onload = async () => {
    let insertData;

    switch (fileType) {
      case "csv":
        if (collectionName === "Users") {
          insertData = Papa.parse(reader.result).data;
        } else {
          insertData = Papa.parse(reader.result).data;
          console.log(insertData);

          insertData = insertData
            .map((question) => {
              if (
                question[0].toLowerCase().trim() !== "question" &&
                question[0].toLowerCase().trim() !== "questions"
              ) {
                if (question[0].includes("____")) {
                  return {
                    Question: question[0].trim(),
                    Option: question[1]
                      ? question[1]
                          .split(/::|,,/)
                          .map((option) => option.trim())
                      : ["None"],
                    Answer: question[2]
                      .split(/::|,,/)
                      .map((option) => option.trim()),
                  };
                }
                const options = question[1]
                  ? question[1].split(/::|,,/).map((option) => option.trim())
                  : [];
                const answers = question[2]
                  ? question[2].split(/::|,,/).map((answer) => answer.trim())
                  : [];

                return {
                  Question: question[0].trim(),
                  Option: options,
                  Answer: answers,
                };
              }
              return null;
            })
            .filter((item) => item !== null);
        }
        break;
      case "gift":
        insertData = GIFTParser(reader.result);

        break;
      case "xlsx":
        const workbook = XLSX.read(reader.result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        insertData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const arrayData = insertData.map((obj) => {
          return [obj.Question, obj.Options, Object.Answers];
        });
        insertData = [Object.keys(insertData[0]), ...arrayData];
        console.log(insertData);

        insertData = insertData
          .map((question) => {
            if (
              question[0].toLowerCase().trim() !== "question" &&
              question[0].toLowerCase().trim() !== "questions"
            ) {
              if (question[0].includes("____")) {
                return {
                  Question: question[0].trim(),
                  Option: question[1]
                    ? question[1].split(/::|,,/).map((option) => option.trim())
                    : ["None"],
                  Answer: question[2]
                    .split(/::|,,/)
                    .map((option) => option.trim()),
                };
              }
              const options = question[1]
                ? question[1].split(/::|,,/).map((option) => option.trim())
                : [];
              const answers = question[2]
                ? question[2].split(/::|,,/).map((answer) => answer.trim())
                : [];

              return {
                Question: question[0].trim(),
                Option: options,
                Answer: answers,
              };
            }
            return null;
          })
          .filter((item) => item !== null);
        break;
      default:
        enterShortcutFunction = () => {
          setIsModalOpen(false);
        };
        showModal("Error", "Unsupported file type.", [["Ok"], ["Enter"]], () =>
          setIsModalOpen(false)
        );
        return;
    }

    if (apiEndpoint === "Upload-question") {
      enterShortcutFunction = () => {
        groupName = document.getElementById("groupName").value;
        insertData = insertData.map((data) => ({
          ...data,
          Group: groupName,
        }));
        handleUpload(insertData);
      };
      showModal(
        "Enter Question Group Name",
        <input type="text" id="groupName" />,
        [
          ["Ok", "Cancel"],
          ["Enter", "Esc"],
        ],
        (button) => {
          if (button === "Ok") {
            groupName = document.getElementById("groupName").value;
            insertData = insertData.map((data) => ({
              ...data,
              Group: groupName,
            }));
            handleUpload(insertData);
          } else setIsModalOpen(false);
        }
      );
    } else {
      handleUpload(insertData);
    }
  };

  // Read the up based on its type
  if (fileType === "xlsx") {
    reader.readAsArrayBuffer(fileName.files[0]);
  } else {
    reader.readAsText(fileName.files[0]);
  }
  return <></>;
};

export default fileUpload;
