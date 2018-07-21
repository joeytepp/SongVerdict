import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import "font-awesome/css/font-awesome.css";
import "./App.css";
import Button from "./Button";
import Panel from "./Panel";
import Header from "./Header";

// Defaults
const verdict = "None";
const ready = false;
const likes = 0;
const dislikes = 0;
const socket = socketIOClient(`${process.env.REACT_APP_IP}:4000`);
let intervalId;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verdict,
      song: null,
      ready,
      likes,
      dislikes,
      hasStarted: false
    };
    this.playerRef = React.createRef();
  }

  render() {
    return (
      <div className="App">
        <audio
          ref={this.playerRef}
          controls
          autoPlay
          loop
          playsInline
          name="media"
          className="spotify-player"
        >
          <source
            type="audio/mpeg"
            src={this.state.song ? this.state.song.url : ""}
          />
        </audio>
        <Header />
        <br />
        <Panel
          likes={this.state.likes}
          dislikes={this.state.dislikes}
          ready={this.state.ready}
          numOnline={this.state.numOnline}
        />
        <div className="Player">
          {this.state.ready ? (
            <div>
              <div>
                <a href={this.state.song.externalUrl} target="_blank">
                  <img
                    onClick={this.onFrameClicked}
                    alt=""
                    src={this.state.song.art}
                  />
                </a>
              </div>
              <br />
              <div>
                <h3>{this.state.song.artist}</h3>
                <h2>{this.state.song.song}</h2>
                <h4>{this.state.song.album}</h4>
              </div>
            </div>
          ) : (
            <div>
              <h2>&#x1F3B6; Listen to songs, &#x1F64B; Voice your opinion</h2>
              <a href="https://jnntt.tumblr.com" target="_blank">
                <img
                  width="30%"
                  height="30%"
                  alt=""
                  src="http://33.media.tumblr.com/77f77b33f2b06cfe11a0865926ee4280/tumblr_ndd8yf5xW61s2ngx4o1_1280.gif"
                />
              </a>
              {this.state.hasStarted ? (
                <h3>
                  &#x1F389; Joining the party in{" "}
                  {this.state.time ? this.state.time : "a moment"}
                </h3>
              ) : (
                <div>
                  <button width="auto" onClick={this.onStart}>
                    Click to start
                  </button>
                </div>
              )}
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

  onStart = () => {
    socket.emit("getTime", {});
    try {
      this.playerRef.current.load();
      this.playerRef.current.play();
    } catch (err) {}
    this.setState({ hasStarted: true });
  };

  onFrameClicked = () => {
    if (this.state.iframeClass === "Safari") {
      this.setState({ iframeClass: "notSafari" });
    } else {
      this.setState({ iframeClass: "Safari" });
    }
  };

  onMount = () => {
    socket.emit("updateNumOnline", { num: this.state.numOnline - 1 });
  };

  componentDidMount() {
    window.addEventListener("beforeunload", this.onMount);
    socket.on("startTime", time => {
      this.setState(time);
      intervalId = setInterval(() => {
        if (this.state.time > 0) {
          this.setState({ time: this.state.time - 1 });
        }
      }, 1000);
    });
    socket.on("newSong", song => {
      if (this.state.hasStarted) {
        clearInterval(intervalId);
        let currentSong = this.state.song;
        if (currentSong) {
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
        try {
          this.playerRef.current.load();
        } catch (err) {}
      }
    });

    socket.on("opinionReceived", data => {
      this.setState({
        likes: this.state.likes + data.likes,
        dislikes: this.state.dislikes + data.dislikes
      });
    });
    socket.on("numOnline", data => {
      this.setState(data);
    });
  }

  componentWillUnmount() {
    this.onMount();
    window.removeEventListener("beforeunload", this.onMount);
  }
  onButtonClicked = verdict => () => {
    this.onVerdictChanged(this.state.verdict, verdict);
    if (this.state.verdict === verdict) {
      this.setState({ verdict: "None" });
    } else {
      this.setState({
        verdict
      });
    }
  };

  onVerdictChanged = (prev, curr) => {
    if (prev === curr) {
      if (prev === "Like") {
        this.setState({ likes: this.state.likes - 1 });
        socket.emit("opinion", { likes: -1, dislikes: 0 });
      } else {
        this.setState({ dislikes: this.state.dislikes - 1 });
        socket.emit("opinion", { likes: 0, dislikes: -1 });
      }
    } else {
      if (prev === "Like") {
        this.setState({
          likes: this.state.likes - 1,
          dislikes: this.state.dislikes + 1
        });
        socket.emit("opinion", { likes: -1, dislikes: 1 });
      } else if (prev === "Dislike") {
        this.setState({
          likes: this.state.likes + 1,
          dislikes: this.state.dislikes - 1
        });
        socket.emit("opinion", { likes: 1, dislikes: -1 });
      } else {
        if (curr === "Like") {
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
