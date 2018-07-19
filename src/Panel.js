import React from "react";
import FontAwesome from "react-fontawesome";

const verdicts = props => {
  let status = props.likes - props.dislikes;
  if (status > 0) {
    return "good";
  } else if (status < 0) {
    return "bad";
  } else {
    return "neutral";
  }
};

const Panel = props => {
  if (props.ready) {
    return (
      <div id={verdicts(props)} className="Player">
        <span id="buttons">
          <FontAwesome name="thumbs-up" /> {props.likes}
          {"    "}
          <FontAwesome name="thumbs-down" /> {props.dislikes}
          {numOnline(props.numOnline)}
        </span>
      </div>
    );
  } else {
    return "";
  }
};

const numOnline = num => {
  if (num) {
    return ` (${num}) `;
  }
};
export default Panel;
