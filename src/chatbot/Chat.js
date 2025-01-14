import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import Config from "./Config";
import ActionProvider from "./ActionProvider";
import MessageParser from "./MessageParser";
const Chat = () => {
  return (
    <div>
      <Chatbot
        config={Config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
};

export default Chat;
