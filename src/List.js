import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import FontAwesome from "react-fontawesome";
import Header from "./Header";

const socket = socketIOClient(`${process.env.REACT_APP_IP}:4000`);

class List extends Component {
  constructor(args) {
    super(args);
    this.state = { list: [] };
  }
  render() {
    socket.emit("List", { type: this.type });
    return (
      <div>
        <Header />
        <h1 id="listTitle" align="center">
          {this.type} songs
          {this.type === "All" ? "" : ", as voted by you :)"}
        </h1>
        {this.state.list.map((i, key) => {
          return (
            <a
              id="list"
              href={i.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              key={key}
            >
              <div className="Player song-list">
                <img src={i.art} alt="" width="20" height="20" /> Song: {i.song}{" "}
                <p>
                  <FontAwesome name="thumbs-up" /> {i.likes}{" "}
                  <FontAwesome name="thumbs-down" /> {i.dislikes}
                </p>
                <p>Artist: {i.artist}</p>
                <p>Album: {i.album}</p>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  componentDidMount() {
    socket.on(`${this.type}ListReceived`, list => this.setState({ list }));
  }
}

export class GoodList extends List {
  constructor(args) {
    super(args);
    this.type = "Good";
  }
}

export class BadList extends List {
  constructor(args) {
    super(args);
    this.type = "Bad";
  }
}

export class AllList extends List {
  constructor(args) {
    super(args);
    this.type = "All";
  }
}

export default AllList;
