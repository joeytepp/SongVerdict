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
      <div id={verdicts(props)} className="Player top">
        <div id="buttons" align="left">
          <FontAwesome name="users" />
          {numOnline(props.numOnline)}
        </div>
        <div id="buttons">
          <FontAwesome name="thumbs-up" /> {props.likes}
          {"    "}
          <FontAwesome name="thumbs-down" /> {props.dislikes}
        </div>
        <div id="buttons" align="right">
          <p>
            <input type="checkbox" onClick={props.toggleFeed} /> Hide Feed
          </p>
        </div>
      </div>
    );
  } else {
    return "";
  }
};

const numOnline = num => {
  if (num) {
    return ` ${num} `;
  }
};
export default Panel;
