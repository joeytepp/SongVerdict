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
          <Link to="/lists/good">
            Good Songs
            <a id="good" />
          </Link>{" "}
          /{" "}
          <Link to="/lists/bad">
            <a id="bad">Bad Songs</a>
          </Link>
        </h1>
      </div>
    </div>
  );
};

export default Header;
