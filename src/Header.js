import React from "react";
import { Link } from "react-router-dom";

const Header = props => {
  return (
    <div className="App-header">
      <Link to="/">
        <h1 align="left" className="App-title">
          SongVerdict
        </h1>
      </Link>
      <div className="links">
        <h1 id="list" className="App-title" align="right">
          <Link to="/lists/good" id="good">
            Good Songs
          </Link>{" "}
          /{" "}
          <Link to="/lists/bad" id="bad">
            Bad Songs
          </Link>
        </h1>
      </div>
    </div>
  );
};

export default Header;
