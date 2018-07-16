import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import socketIOClient from "socket.io-client";
import "font-awesome/css/font-awesome.css";
import "./App.css";
import Button from "./Button";
import Panel from "./Panel";

// Defaults
const verdict = "None";
const ready = false;
const likes = 0;
const dislikes = 0;
const socket = socketIOClient("http://18.191.86.253:4000");

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { verdict, verdict, song: null, ready, likes, dislikes };
  }

  render() {
    return (
      <div className="App">
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
        <h1 className="App-intro" />
        <br />
        <Panel
          likes={this.state.likes}
          dislikes={this.state.dislikes}
          ready={this.state.ready}
        />
        <div className="Player">
          {this.state.ready ? (
            <div>
              <iframe hidden="true" src={this.state.song.url} />
              <img alt="" src={this.state.song.art} />
              <br />
              <br />
              <h3>{this.state.song.artist}</h3>
              <h2>{this.state.song.song}</h2>
              <h4>{this.state.song.album}</h4>
            </div>
          ) : (
            <div>
              <h2>Listen to songs, voice your opinion</h2>
              <img
                width="400"
                height="400"
                alt=""
                src="http://33.media.tumblr.com/77f77b33f2b06cfe11a0865926ee4280/tumblr_ndd8yf5xW61s2ngx4o1_1280.gif"
              />
              <p id="source">
                Source: <a href="jnntt.tumblr.com">jnntt.tumblr.com</a>
              </p>
              <h3>Joining the party in {this.state.time}</h3>
            </div>
          )}
        </div>
        <Button
          ready={this.state.ready}
          type="Like"
          current={this.state.verdict}
          updateState={this.onButtonClicked("Like")}
        />
        <Button
          ready={this.state.ready}
          type="Dislike"
          current={this.state.verdict}
          updateState={this.onButtonClicked("Dislike")}
        />
      </div>
    );
  }

  componentDidMount() {
    console.log("mounted");
    socket.on("startTime", time => {
      this.setState(time);
      setInterval(() => {
        if (this.state.time > 0) {
          this.setState({ time: this.state.time - 1 });
        }
      }, 1000);
    });
    socket.on("test", song => {
      clearInterval();
      let currentSong = this.state.song;
      if (currentSong && currentSong.url == this.state.song.url) {
        currentSong.url = "";
        this.setState({
          song: currentSong
        });
      }
      this.setState({
        verdict: "None",
        song,
        ready: true,
        likes,
        dislikes
      });
    });

    socket.on("opinionReceived", data => {
      this.setState({
        likes: this.state.likes + data.likes,
        dislikes: this.state.dislikes + data.dislikes
      });
    });
  }
  onButtonClicked = verdict => () => {
    this.onVerdictChanged(this.state.verdict, verdict);
    if (this.state.verdict == verdict) {
      this.setState({ verdict: "None" });
    } else {
      this.setState({
        verdict
      });
    }
  };

  onVerdictChanged = (prev, curr) => {
    if (prev == curr) {
      if (prev == "Like") {
        this.setState({ likes: this.state.likes - 1 });
        socket.emit("opinion", { likes: -1, dislikes: 0 });
      } else {
        this.setState({ dislikes: this.state.dislikes - 1 });
        socket.emit("opinion", { likes: 0, dislikes: -1 });
      }
    } else {
      if (prev == "Like") {
        this.setState({
          likes: this.state.likes - 1,
          dislikes: this.state.dislikes + 1
        });
        socket.emit("opinion", { likes: -1, dislikes: 1 });
      } else if (prev == "Dislike") {
        this.setState({
          likes: this.state.likes + 1,
          dislikes: this.state.dislikes - 1
        });
        socket.emit("opinion", { likes: 1, dislikes: -1 });
      } else {
        if (curr == "Like") {
          this.setState({ likes: this.state.likes + 1 });
          socket.emit("opinion", { likes: 1, dislikes: 0 });
        } else {
          this.setState({ dislikes: this.state.dislikes + 1 });
          socket.emit("opinion", { likes: 0, dislikes: 1 });
        }
      }
    }
  };
}

export default Home;
