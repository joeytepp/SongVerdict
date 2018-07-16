import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import FontAwesome from "react-fontawesome";
import Header from "./Header";

const socket = socketIOClient(`${process.env.REACT_APP_IP}:4000`);
class GoodList extends Component {
  constructor(args) {
    super(args);
    this.state = { list: [] };
  }
  render() {
    socket.emit("GoodList", {});
    return (
      <div>
        <Header />
        <h1 align="center">Good songs, as voted by you :)</h1>
        {this.state.list.map(i => {
          return (
            <div className="Player">
              <img src={i.art} alt="" width="20" height="20" /> Song: {i.song}{" "}
              <p>
                <FontAwesome name="thumbs-up" /> {i.likes}{" "}
                <FontAwesome name="thumbs-down" /> {i.dislikes}
              </p>
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
