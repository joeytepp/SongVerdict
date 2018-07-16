import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Link } from "react-router-dom";
const socket = socketIOClient("http://18.191.86.253:4000");
class GoodList extends Component {
  constructor(args) {
    super(args);
    this.state = { list: [] };
  }
  render() {
    socket.emit("GoodList", {});
    return (
      <div>
        <div className="App-header">
          <Link to="/">
            <h1 align="left" className="App-title">
              SongVerdict
            </h1>
          </Link>
          <div className="links">
            <h1 id="list" className="App-title" align="right">
              <a id="good">
                <Link to="/lists/good">Good Songs</Link>
              </a>{" "}
              /{" "}
              <a id="bad">
                <Link to="/lists/bad">Bad Songs</Link>
              </a>
            </h1>
          </div>
        </div>
        <h1 align="center">Good songs, as voted by you :)</h1>
        {this.state.list.map(i => {
          return (
            <div className="Player">
              <img src={i.art} alt="" width="20" height="20" /> Song: {i.song}
              <p>Artist: {i.artist}</p>
              <p>Album: {i.album}</p>
            </div>
          );
        })}
      </div>
    );
  }

  componentDidMount() {
    socket.on("GoodListReceived", list => this.setState({ list }));
  }
}

export default GoodList;
