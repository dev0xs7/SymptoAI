import React from "react";

const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    if (children.props.state.checker === "symptom") {
      actions.severenessCheck(message);
    } else if (children.props.state.checker === "medid") {
      actions.querymedication(message);
    } else if (children.props.state.checker === "medquery") {
      actions.processquery(message);
    } else if (children.props.state.checker === "question") {
      actions.handleQuestionResponse(message);
    } else if (children.props.state.checker === "askllm") {
      actions.userToLLM(message);
    } else if (children.props.state.checker === "severe") {
      actions.handleSevereResponse(message);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions: { actions },
        });
      })}
    </div>
  );
};

export default MessageParser;
