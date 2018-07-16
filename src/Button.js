import React, { Component } from "react";
import FontAwesome from "react-fontawesome";

const Button = props => {
  if (props.ready) {
    return (
      <button
        className={props.current == props.type ? "selected" : "unselected"}
        onClick={props.updateState}
      >
        <FontAwesome
          name={props.type == "Like" ? "thumbs-up" : "thumbs-down"}
        />
        {` ${props.type}`}
      </button>
    );
  }
  return "";
};

export default Button;
