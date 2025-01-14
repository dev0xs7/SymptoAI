import React from "react";
import logo from "./assets/doctor.png";
const Header = () => {
  return (
    <div className="navbar">
      <div className="title">
        <img src={logo} height={"40vh"} width={40} alt="logo" />
        <p className="AppName">MedAI</p>
      </div>
      <p className="desc">
        Medicine Recommendation System leveraging Knowledge Graphs & Large
        Language Models
      </p>
    </div>
  );
};

export default Header;
