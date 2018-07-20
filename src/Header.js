import React from "react";
import { Link } from "react-router-dom";
import FontAwesome from "react-fontawesome";
import logo from "./logo.png";

const Header = props => {
  return (
    <div className="App-header">
      <Link id="link" to="/">
        <div>
          <img
            id="logo"
            className="logopic"
            align="left"
            height="75px"
            width="75px"
            src={logo}
            alt=""
          />{" "}
          <h1 className="hideIfSmall logotext" align="left" id="logo">
            SongVerdict
          </h1>
        </div>
      </Link>

      <h1 id="goodBad" align="right">
        <Link id="link" to="/lists/good">
          <FontAwesome name="thumbs-o-up" size="2x" />
        </Link>
        {"                              "}
        <Link id="link" to="/lists/bad">
          <FontAwesome name="thumbs-o-down" size="2x" />
        </Link>
        {"                              "}
        <FontAwesome name="list-ul" size="2x" />
      </h1>
    </div>
  );
};

export default Header;
