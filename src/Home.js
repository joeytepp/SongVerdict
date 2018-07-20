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
      noAutoplay: this.checkAuto(),
      iframeClass: "Safari"
    };
    socket.emit("getTime", {});
  }

  render() {
    return (
      <div className="App">
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
              <img
                onClick={this.onFrameClicked}
                alt=""
                src={this.state.song.art}
              />
              {this.iframe()}
              <br />
              <div>
                <h3>{this.state.song.artist}</h3>
                <a href={this.state.song.externalUrl} target="_blank">
                  <h2>{this.state.song.song}</h2>
                </a>
                <h4>{this.state.song.album}</h4>
              </div>
            </div>
          ) : (
            <div>
              <h2>Listen to songs, voice your opinion</h2>
              <img
                width="60%"
                height="60%"
                alt=""
                src="http://33.media.tumblr.com/77f77b33f2b06cfe11a0865926ee4280/tumblr_ndd8yf5xW61s2ngx4o1_1280.gif"
              />
              <p id="source">
                Source: <a href="jnntt.tumblr.com">jnntt.tumblr.com</a>
              </p>
              <h3>
                Joining the party in{" "}
                {this.state.time ? this.state.time : "a moment"}
              </h3>
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

  iframe() {
    if (this.state.noAutoplay) {
      return (
        <iframe
          title="spotify-player"
          height="50px"
          id={this.state.iframeClass}
          src={this.state.song.url}
        />
      );
    }
    return (
      <iframe title="spotify-player" hidden="true" src={this.state.song.url} />
    );
  }

  onFrameClicked = () => {
    if (this.state.iframeClass === "Safari") {
      this.setState({ iframeClass: "notSafari" });
    } else {
      this.setState({ iframeClass: "Safari" });
    }
  };

  onMount = () =>
    socket.emit("updateNumOnline", { num: this.state.numOnline - 1 });

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
    socket.on("test", song => {
      clearInterval(intervalId);
      let currentSong = this.state.song;
      if (currentSong && currentSong.url === this.state.song.url) {
        currentSong.url = "";
        this.setState({
          song: currentSong
        });
      }
      if (this.state.noAutoplay && !this.state.ready) {
        alert("Press on album artwork to show / hide the player");
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
    socket.on("numOnline", data => {
      this.setState(data);
    });
  }

  componentWillUnmount() {
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

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  checkAuto() {
    if (this.isMobile()) return true;
    let ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") !== -1) {
      if (ua.indexOf("chrome") > -1) {
        return false; // Chrome
      } else {
        return true; // Safari
      }
    }
  }

  leaveSocket = num => () => {
    num--;
    alert(num);
    socket.emit("updateNumOnline", { num });
  };
}

export default Home;
