import React, { useState, useEffect } from "react";
import axios from "axios";
import questions from "../questions.json";
import doctor from "../doctors.json";
const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const [medicines, setMedicines] = useState({});
  const [med, setMed] = useState("");
  const [ques, setQues] = useState([]);
  const [symp, setSymp] = useState("");
  const [qno, setQno] = useState(0);
  const [query, setQuery] = useState("");
  const [msgHistory, setMsgHistory] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  let message;
  let similarity = require("string-cosine-similarity");

  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

  const MODEL_NAME = "gemini-1.0-pro";
  // const API_KEY = "AIzaSyDOUZKMwVhGj4vQaT_ckOmaNSjVV0BTiHs";

  function LLMDiagnosisEnds(message) {
    return message.startsWith("Disease :");
  }

  useEffect(() => {
    console.log("Updated Chatsession ...");
  }, [chatSession]);

  useEffect(() => {
    console.log("Updated Symptom ...");
  }, [symp]);

  useEffect(() => {
    console.log("Updated Query : ", query);
    if (chatSession !== null) {
      console.log("Sending the message to model");
      sendMessage(query, chatSession);
    }
  }, [query]);

  function runChat() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.95,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      //   {
      //     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      //   },
      //   {
      //     category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      //   },
      //   {
      //     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      //   },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [
            {
              text: 'Take a role of Disease Diagnoser , You have the ability to diagnose a disease based on the symptoms given as an input. For better diagnosis you may ask questions one by one in a conversational manner. Diseases that you can diagnose are : Dry Cough , Cough with mucus , Acute Sore throat , Common Cold, Fever , Pain relief , Depression , Insomnia , Indigestion , Acne , skin infections , Irritable bowel syndrome , Burns , Chronic Obstructive Pulmonary Disease , Neuropathic pain , Osteoporosis , Nutrition Defeciency , Fungal Infections , Asthma , Wound infections . Ensure that you don\'t ask more than 4 questions for diagnosis and ask one question at a time. Ask one question at a time without the question tag.Finally respond with result in the format "Disease : " {diagnosed disease}. Input : Severe cough',
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Do you produce mucus while you cough?" }],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Do you have sore throat, hoarseness, or difficulty swallowing?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [{ text: "Do you have fever, chills, or headache?" }],
        },
        {
          role: "user",
          parts: [{ text: "no" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Acute Sore throat" }],
        },
        {
          role: "user",
          parts: [{ text: "skin rashes and burns" }],
        },
        {
          role: "model",
          parts: [{ text: "Are the skin rashes itchy, red, and raised?" }],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [
            { text: "Do you have any open wounds or blisters on your skin?" },
          ],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Skin infections" }],
        },
        {
          role: "user",
          parts: [{ text: "hard stool" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Is your stool hard and dry, or is it difficult to pass?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Constipation" }],
        },
        {
          role: "user",
          parts: [{ text: "I feel weak and have bone pain" }],
        },
        {
          role: "model",
          parts: [
            { text: "Have you experienced any recent falls or injuries?" },
          ],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Osteoporosis" }],
        },
        {
          role: "user",
          parts: [{ text: "difficulty in breathing" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Do you have a persistent cough, wheezing, or shortness of breath?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "yes" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Asthma" }],
        },
        {
          role: "user",
          parts: [{ text: "Cough" }],
        },
        {
          role: "model",
          parts: [{ text: "Is your cough dry or do you produce mucus?" }],
        },
        {
          role: "user",
          parts: [{ text: "dry" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Do you have any other symptoms, such as a sore throat, runny nose, or headache?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "no" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Dry Cough" }],
        },
        {
          role: "user",
          parts: [{ text: "stomach pain" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Is the pain located in your upper abdomen, lower abdomen, or both?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "upper" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Do you experience the pain after eating certain foods or drinks?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "no" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Gastritis" }],
        },
        {
          role: "user",
          parts: [{ text: "Depression , nerve pain" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Do you feel sadness, hopelessness, and loss of interest in activities that you once enjoyed?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "no" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Neuropathic pain" }],
        },
        {
          role: "user",
          parts: [{ text: "fever" }],
        },
        {
          role: "model",
          parts: [
            { text: "Do you have a headache, sore throat, or runny nose?" },
          ],
        },
        {
          role: "user",
          parts: [{ text: "runny nose" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Common Cold" }],
        },
        {
          role: "user",
          parts: [{ text: "Pain" }],
        },
        {
          role: "model",
          parts: [{ text: "Is the pain sharp, dull, or burning?" }],
        },
        {
          role: "user",
          parts: [{ text: "sharp" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Pain relief" }],
        },
        {
          role: "user",
          parts: [{ text: "circular infection" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Is the infection on the skin, respiratory system, or urinary tract?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "urinary tract" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Urinary Tract Infection" }],
        },
        {
          role: "user",
          parts: [{ text: "pain in the nail" }],
        },
        {
          role: "model",
          parts: [{ text: "Is the pain throbbing, sharp, or aching?" }],
        },
        {
          role: "user",
          parts: [{ text: "aching" }],
        },
        {
          role: "model",
          parts: [{ text: "Disease : Paronychia" }],
        },
      ],
    });

    // we need to wait for the response from the user for this qn

    // let count = 1;
    // while (!LLMDiagnosisEnds(llmresponse) && count < 3) {
    //   console.log("Inside the LLM bot :: ", query);
    //   if (query.length > 0) {
    //     let result = await chat.sendMessage(query);
    //     var res = result.response;
    //     res = res.text();
    //     console.log("Inside the LLM Response : ", res);
    //     handleLLMResponse(res);
    //     //set the response
    //     setLLMResponse(res);
    //   }
    //   count = count + 1;
    // }
    // //split the response on colon and take the second part
    // if (query.length > 0) {
    //   let dis = res.split(":")[1].trim();
    //   let diagnosed_disease = `${symp} + ${dis}`;
    //   recommender(diagnosed_disease);
    // }
    return chat;
  }
  async function sympChat(symptom) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Compare the symptoms of the disease given as an input contextually against the diseases given below and return the most resembling disease symptom among them.1Bacterial infections,2Cough with mucus,3Sneezing and runny nose due to allergies, Allergic conditions,4Allergic conditions,5Gastroesophageal reflux disease (Acid reflux),Peptic ulcer disease,6Anxiety, Skin conditions with inflammation & itching,7Piles,8Nausea,Vomiting,Allergic conditions,Motion sickness,9Sneezing and runny nose due to allergies,10Anxiety,Panic disorder,11Resistance Tuberculosis (TB),Bacterial infections,12Cough,13Chronic obstructive pulmonary disease (COPD),14Dry cough,15Sneezing and runny nose due to allergies,Allergic conditions,16Short term anxiety,Anxiety disorder,17Pain relief,18Anxiety,Skin conditions with inflammation & itching,19Parasitic infections,20Bacterial skin infections,21Bacterial skin infections, Fungal skin infections,Skin conditions with inflammation & itching,22Pain relief,Fever,23Worm infections,24Mouth infection,Sore throat,Dry mouth,Wound infection,25Asthma,26Wound infection,27Pain due to smooth muscle spasm,Irritable bowel syndrome,28Worm infections, Filariasis,29Allergic skin conditions, Allergic conditions,30Treatment and prevention of Wound infection,31Acne,32Pain due to smooth muscle spasm, Irritable bowel syndrome,33Skin infections,34Pain relief, Swelling,35Abdominal pain,36Pain relief, Fever,37Common cold,38Fungal skin infections,39Bacterial eye / ear infections, Bacterial infections,40Appetite stimulant,41Gastroesophageal reflux disease (Acid reflux), Peptic ulcer disease,42Irritable bowel syndrome, Abdominal pain,43Constipation,44Bacterial & parasitic infections,45Fungal infections of mouth (Thrush), Fungal infections,46Bacterial eye / ear infections, Eye infection with inflammation,47Vitamin D deficiency, Osteoporosis,48Tuberculosis (TB),49Acute Sore throat, Cough with mucus,50Anxiety, Panic disorder,51Depression,Neuropathic pain, Migraine,52Depression,53Anal fissure,54Vitamin A deficiency,55Nausea and vomiting in pregnancy,56Inflammatory conditions, Autoimmune conditions,57Inflammatory conditions, Autoimmune conditions, Cancer,58Constipation, Hepatic encephalopathy,59Indigestion, Nausea, Vomiting,60Glaucoma,61Post menopausal osteoporosis,62Muscle relaxation,63Epilepsy/Seizures,64Pain due to muscle spasm,65Nutritional deficiencies,66Depression,Smoking addiction,67Burns,68Bacterial eye / ear infections,69Melasma,70Irritable bowel syndrome,71Meniere's disease,72Muscle cramps,73Worm infections, Intestinal amoebiasis,74Nausea, Vomiting,75Short term anxiety, Insomnia,76Nausea,Vomiting,77Treatment and prevention of Epilepsy/Seizures,78Diarrhea,79Indigestion,80Anxiety disorder,81Anxiety disorder, Epilepsy/Seizures,82Respiratory tract infection,83Fungal infections,84Bacterial infections, Parasitic infections,85Gout,86Allergic conditions,Pain relief, Fever,87Severe bacterial infections,88Bacterial skin infections,Bacterial eye infections,89Severe allergic reactions, Skin conditions with inflammation & itching,90Depression, Panic disorder, Obsessive-compulsive disorder,91Sneezing and runny nose due to allergies,Severe allergic reactions, Skin conditions with inflammation & itching,92Prevention of Migraine,93Moderate to severe pain,94Gastroesophageal reflux disease (Acid reflux), Peptic ulcer disease, Heartburn,95Herpes Simplex Virus Infections,Chickenpox,Herpes labialis,Shingles,Genital herpes infection,96Chronic obstructive pulmonary disease (COPD),Severe allergic reactions,Allergic conditions,Skin disorders,Eye disorders,97Herpes labialis,98Muscular pain,99Functional dyspepsia,100Resistant Tuberculosis (TB), Bacterial infections,101Neuropathic pain,102Neuropathic pain, Epilepsy/Seizures,103Heartburn, Nausea,104Migraine,105Treatment and prevention of Chronic obstructive pulmonary disease (COPD),106Psoriasis,107Alcohol addiction,108Gastroesophageal reflux disease (Acid reflux), Indigestion, Nausea, Vomiting,109Headache,110Depression, Anxiety disorder, Diabetic nerve pain, Fibromyalgia, Neuropathic pain, Stress urinary incontinence,111Rheumatoid arthritis, Systemic lupus erythematosus (SLE),112Peptic ulcer disease,113Peptic ulcer disease, Irritable bowel syndrome,Pain relief,114Liver disease,115Mouth infection,116Dry eyes,117Eye examination,Uveitis,118Moderate to severe pain, Opioid (Morphine) dependence,119Parkinson's disease, Drug induced abnormal movements,120Osteoporosis,121Respiratory tract disorders associated with viscid mucus,122Eczema,Psoriasis,123Ocular hypertension,Glaucoma,124Nausea, Vomiting, Diarrhea,125Head lice, Parasitic infections,126Glaucoma, Ocular hypertension,127Pain due to smooth muscle spasm,128Gastroesophageal reflux disease (Acid reflux), Functional dyspepsia,129Facial hirsutism (Excessive hair growth on face),130Skin conditions with inflammation & itching, Skin disorders,131Hypothyroidism,132Osteoarthritis,133Fungal infections of vagina, Fungal infections,134Softening of earwax,135Syndromic vaginal discharge,136Carnitine deficiency,137Ear infection, Skin infections,138Respiratory tract disorders associated with viscid mucus, Allergic conditions,Pain relief, Fever,139Mouth ulcers,140Rheumatoid arthritis, Osteoarthritis,141Potassium deficiency,142Bacterial infections of urinary tract,143Severe anxiety,Epilepsy/Seizures,144Severe anxiety,Alcohol withdrawal,145Neuropathic pain, Epilepsy/Seizures, Fibromyalgia,146Sneezing and runny nose due to allergies, Hay fever, Allergic skin conditions,147Local anesthesia (Numb tissues in a specific area),148Gastroesophageal reflux disease (Acid reflux),Irritable bowel syndrome,Heartburn,149Opioid (Morphine) dependence,150Alzheimer's disease,151Menstrual pain, Abdominal cramp,152Vitamin & mineral deficiency,153Acidity, Heartburn, Stomach ulcers,154Hair loss,155Respiratory disease with excessive mucus,156Diarrhea, Dysentery,157Depression, Anxiety disorder, Panic disorder,158Vitamin & mineral deficiency, Diabetic nerve pain,159Insomnia, | Input : Cellulitis",
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Bacterial skin infections" }],
        },
        {
          role: "user",
          parts: [{ text: "Dermatitis" }],
        },
        {
          role: "model",
          parts: [{ text: "Skin conditions with inflammation & itching" }],
        },
        {
          role: "user",
          parts: [{ text: "Gastritis" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Gastroesophageal reflux disease (Acid reflux), Peptic ulcer disease",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "Pneumonia" }],
        },
        {
          role: "model",
          parts: [
            { text: "Bacterial infections, Respiratory tract infection" },
          ],
        },
        {
          role: "user",
          parts: [{ text: "Eczema" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Skin conditions with inflammation & itching, Allergic skin conditions",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "Chronic obstructive pulmonary disorder" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Respiratory tract disorders associated with viscid mucus",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "Acne" }],
        },
        {
          role: "model",
          parts: [{ text: "Skin conditions with inflammation & itching" }],
        },
        {
          role: "user",
          parts: [{ text: "leg pain" }],
        },
        {
          role: "model",
          parts: [{ text: "Pain due to smooth muscle spasm" }],
        },
        {
          role: "user",
          parts: [{ text: "Asthma" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Respiratory tract disorders associated with viscid mucus",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "Depression" }],
        },
        {
          role: "model",
          parts: [{ text: "Depression, Anxiety disorder" }],
        },
        {
          role: "user",
          parts: [{ text: "Pain" }],
        },
        {
          role: "model",
          parts: [{ text: "Pain relief, Swelling" }],
        },
      ],
    });

    const result = await chat.sendMessage(symptom);
    const response = result.response;
    console.log(
      "Symptoms from LLM : ",
      response.candidates["0"].content.parts["0"].text
    );
    return response.candidates["0"].content.parts["0"].text;
  }
  const sendMessage = async (query, chat) => {
    console.log("Inside the send Message function :", query);
    try {
      if (query.length > 0) {
        const result = await chat.sendMessage(query);
        const res = result.response;
        console.log(
          "Question :: ",
          res.candidates["0"].content.parts["0"].text
        );
        handleLLMResponse(res.candidates["0"].content.parts["0"].text);
        setMsgHistory((prevMessages) => [
          ...prevMessages,
          { role: "user", parts: [{ text: query }] },
          {
            role: "model",
            parts: [{ text: res.candidates["0"].content.parts["0"].text }],
          },
        ]);
      } else {
        console.log("Query set empty...");
      }
    } catch (error) {
      console.log("Error in Executing the Send Message component.");
      message = createChatBotMessage(
        "Could you please try specifying the symptoms again with more specificity.",
        {
          withAvatar: true,
          delay: 250,
        }
      );
      updateState(message, "symptom");
    }
  };
  const handleLLMResponse = async (response) => {
    //print the response on the Chat window
    console.log("Inside the Handle LLM response...");
    message = createChatBotMessage(`${response}`, {
      withAvatar: true,
      delay: 250,
    });
    if (LLMDiagnosisEnds(response)) {
      let dis = response.split(":")[1].trim();
      let sympres = await sympChat(dis);
      let diagnosed_disease = `${dis} ${sympres}`;
      console.log(diagnosed_disease);
      recommender(diagnosed_disease);
      updateState(message, "medid");
    } else {
      updateState(message, "askllm");
    }
  };

  const userToLLM = (message) => {
    console.log("Inside the UserToLLM part : ", message);
    if (message.trim() !== "") {
      setMsgHistory((prevMessages) => [
        ...prevMessages,
        { role: "user", parts: [{ text: message }] },
      ]);
      setQuery(message);
    }
  };

  // Symptom generator

  function askquestions(quests, symptom) {
    setQues(quests);
    setSymp(symptom);
    console.log("Insider ask :: ", quests[qno]);
    message = createChatBotMessage(`${quests[qno].Qn}`, {
      withAvatar: true,
      delay: 250,
    });
    updateState(message, "question");
  }
  let positive_list = ["yes", "yep", "yeah"];
  function containsAnyWord(string, positive_list) {
    for (let word of positive_list) {
      if (string.includes(word)) {
        return true;
      }
    }
    return false;
  }
  const handleQuestionResponse = (response) => {
    // if the sentiment positive then pass the disease to the server and query else ask next question.
    if (containsAnyWord(response, positive_list)) {
      let diagnosed_disease = `${symp} + ${ques[qno].disease}`;
      console.log(diagnosed_disease);
      recommender(diagnosed_disease);
    } else if (qno + 1 < ques.length) {
      setQno(qno + 1);
      message = createChatBotMessage(`${ques[qno + 1].Qn}`, {
        withAvatar: true,
        delay: 250,
      });
      updateState(message, "question");
    } else {
      recommender(symp);
    }
  };
  const recommender = async (symptom) => {
    console.log("Sending the Symptom to the server", symptom);

    try {
      const result = await axios.post("http://127.0.0.1:5000/data/", {
        payload: symptom,
      });
      setMedicines(result.data);
      console.log("Recieved Response :: ", result.data);

      message = createChatBotMessage(
        `You have been diagnosed for ${result.data["Disease"]} !`,
        { withAvatar: true, delay: 500 }
      );
      updateState(message, "default");

      message = createChatBotMessage(
        `It would be the best if you consult  : ${result.data["Department"]} !`,
        { withAvatar: true, delay: 500 }
      );
      updateState(message, "default");

      message = createChatBotMessage(
        `You must be treated with medicines of Therapeutic Class : ${result.data["Therapeutic_Class"]} !`,
        { withAvatar: true, delay: 500 }
      );
      updateState(message, "default");
      message = createChatBotMessage(
        `Some of the Recommended Doctors are as follows: `,
        { withAvatar: true, delay: 500 }
      );
      console.log("Printing doctors....");
      updateState(message, "default");
      doctor
        .filter((doc, i) => {
          return doc.department === result.data["Department"];
        })
        .forEach((doc, i) => {
          doc.doctors.forEach((d, ind) => {
            message = createChatBotMessage(`${ind}. ${d.name} - ${d.hospital}`);
            updateState(message, "default");
          });
        });
      message = createChatBotMessage(
        `Some of the Commonly Recommended Medicines are..`,
        { withAvatar: true, delay: 500 }
      );
      updateState(message, "default");

      result.data["Medicine_Recommendation"].forEach((med, i) => {
        message = createChatBotMessage(`${i}. ${med}`, { delay: 500 });
        updateState(message, "default");
      });

      // Only ask the id if the number of medicines is > 1
      if (result.data["Medicine_Recommendation"].length > 1) {
        message = createChatBotMessage(
          "Enter the id of the Medicine That you would like to query about ?",
          { withAvatar: true, delay: 500 }
        );
        updateState(message, "medid");
      } else {
        setMed(result.data["Medicine_Recommendation"][0]);

        message = createChatBotMessage(
          `Please Type in your query for the Medicine(${result.data["Medicine_Recommendation"][0]}) !`,
          { withAvatar: true, delay: 500 }
        );
        updateState(message, "medquery");
      }
    } catch (e) {
      console.log("Error in Retrieving from Flask server....");
      console.log(e);
    }
  };
  const severenessCheck = (symptom) => {
    setSymp(symptom);
    message = createChatBotMessage(
      `Have you been suffering the Disease for a long time ( >1 weeks) ?`,
      { withAvatar: true, delay: 500 }
    );
    updateState(message, "severe");
  };
  const handleSevereResponse = (severe) => {
    if (containsAnyWord(severe, positive_list)) {
      setQuery(symp);
      const chatSessionCurrent = runChat();

      console.log("ChatSession Current : ", chatSessionCurrent);

      setChatSession(chatSessionCurrent);
      sendMessage(query, chatSessionCurrent);
    } else {
      querysymptom(symp);
    }
  };
  const querysymptom = async (symptom) => {
    // here we migh have to the diagnosis process ... wherein we will be asking all types of questions.
    let qclasses = [];
    questions.forEach((ques) => {
      qclasses.push(ques.CLASS);
    });
    let qcosine = [];
    qclasses.forEach((txt) => {
      qcosine.push(similarity(txt, symptom));
    });
    setSymp(symptom);
    setQuery(symptom);
    console.log("Cosine :: ", qcosine.indexOf(1));

    //ask questions
    if (qcosine.indexOf(1) !== -1) {
      // set the symptom here only
      askquestions(questions[qcosine.indexOf(1)].questions, symptom);
    } else {
      //passing to llm
      recommender(symptom);
    }
  };

  const querymedication = (medid) => {
    console.log("You have chosen the option :: ", medid);
    console.log(
      "Medicine Chosen :: ",
      medicines.Medicine_Recommendation.at(medid)
    );
    setMed(medicines.Medicine_Recommendation.at(medid));

    message = createChatBotMessage(
      `Please Type in your query for the Chosen Medicine(${medicines.Medicine_Recommendation.at(
        medid
      )}) !`,
      { withAvatar: true, delay: 500 }
    );
    updateState(message, "medquery");
  };
  const processquery = async (inpquery) => {
    // we will be passing the medicine name and the query to the server ... which will use langchain to create a cypher query and then would return us the result
    try {
      const result = await axios.post("http://127.0.0.1:5000/medquery/", {
        query: inpquery,
        medicine: med,
      });
      console.log("Result From API :: ", result.data);
      message = createChatBotMessage(`${result.data.Result}`, {
        withAvatar: true,
      });
      updateState(message, "medquery");
    } catch (e) {
      console.log("Problem in querying the medicine ", e);
    }

    message = createChatBotMessage(
      `Any more queries for the Chosen Medicine(${med}) !`,
      { withAvatar: false, delay: 500 }
    );
    updateState(message, "medquery");
  };

  const updateState = (message, checker) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      checker,
    }));
  };
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            querysymptom,
            querymedication,
            processquery,
            handleQuestionResponse,
            recommender,
            userToLLM,
            severenessCheck,
            handleSevereResponse,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
