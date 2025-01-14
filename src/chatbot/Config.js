import { createChatBotMessage } from "react-chatbot-kit";
import { Avatar } from "@mui/material";
import logo from "../assets/doctor.png";
const botName = "MedAI Bot";
const Config = {
  initialMessages: [
    createChatBotMessage(
      `Hey , This is MedAI at your Service , Can help you in recommending medicine on analysing the symptoms you share with me ! Looking forward to help you !`
    ),
    createChatBotMessage(
      `Please Type the Symptoms you are facing clearly for better recommendations.`,
      {
        delay: 500,
      }
    ),
  ],
  botName: botName,
  customComponents: {
    botAvatar: (props) => (
      <Avatar sx={{ background: "black" }}>
        <img src={logo} alt="avatar" width={30} />
      </Avatar>
    ),
    userAvatar: (props) => (
      <Avatar sx={{ background: "red", fontSize: "x-smalL" }}>USER</Avatar>
    ),
  },
  state: {
    checker: "symptom",
  },
};

export default Config;
