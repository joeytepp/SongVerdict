import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import "font-awesome/css/font-awesome.css";
import "./App.css";
import Button from "./Button";
import Panel from "./Panel";
import Header from "./Header";
import FontAwesome from "react-fontawesome";
import Feed from "./Feed";

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
      hasStarted: false,
      likeFlashes: [],
      dislikeFlashes: [],
      messages: [],
      showFeed: true
    };
    this.playerRef = React.createRef();
    this.inputRef = React.createRef();
  }

  render() {
    return (
      <div>
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
            toggleFeed={this.toggleFeed}
          />
          <div className="Player actual">
            {this.state.ready ? (
              <div className="mainDiv">
                <Feed
                  list={this.state.messages}
                  submit={this.handleSubmitMessage}
                  show={this.state.showFeed}
                />
                <div>
                  <a
                    href={this.state.song.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img id="coverArt" alt="" src={this.state.song.art} />
                  </a>
                </div>
                <br />
                <div id="songInfo">
                  <h2 id="songName">{this.state.song.song}</h2>
                  <p className="songInfo">
                    {this.state.song.artist} - {this.state.song.album}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2>
                  <span role="img" aria-label="music">
                    &#x1F3B6;
                  </span>{" "}
                  Listen to songs,{" "}
                  <span role="img" aria-label="vote">
                    &#x1F64B;
                  </span>{" "}
                  Voice your opinion
                </h2>
                <a
                  href="https://jnntt.tumblr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    width="30%"
                    height="30%"
                    alt=""
                    src="http://33.media.tumblr.com/77f77b33f2b06cfe11a0865926ee4280/tumblr_ndd8yf5xW61s2ngx4o1_1280.gif"
                  />
                </a>
                {this.state.hasStarted ? (
                  <h3>
                    <span role="img" aria-label="tada" />
                    &#x1F389; Joining the party in{" "}
                    {this.state.time ? this.state.time : "a moment"}
                  </h3>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Screen name"
                      ref={this.inputRef}
                    />
                    <button
                      id="startButton"
                      onClick={() => {
                        this.startSong();
                        socket.emit("createUser", {
                          userName: this.inputRef.current.value
                        });
                      }}
                    >
                      Go
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
        {this.state.likeFlashes.map((i, key) => {
          return (
            <div className="new Like" key={key}>
              <FontAwesome name="thumbs-up" />
            </div>
          );
        })}
        {this.state.dislikeFlashes.map((i, key) => {
          return (
            <div className="new Dislike" key={key}>
              <FontAwesome name="thumbs-down" />
            </div>
          );
        })}
      </div>
    );
  }

  toggleFeed = () => {
    this.setState({ showFeed: !this.state.showFeed });
  };

  startSong = () => {
    try {
      this.playerRef.current.load();
      this.playerRef.current.play();
    } catch (err) {}
  };
  componentDidMount() {
    socket.on("userFailed", data => {
      const { message } = data;
      alert(message);
    });
    socket.on("newMessage", message => {
      if (this.state.ready) {
        this.setState({ messages: [...this.state.messages, message] });
      }
    });
    socket.on("startTime", data => {
      const { time } = data;
      const userName = data;

      this.userName = userName;
      this.setState({ time, hasStarted: true });

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
        const newMessage = {
          userName: "Now Playing",
          message: `${song.song} - ${song.artist}`,
          icon: "play"
        };
        this.setState({ messages: [...this.state.messages, newMessage] });
        try {
          this.playerRef.current.load();
        } catch (err) {}
      }
    });

    socket.on("opinionReceived", data => {
      if (data.likes > 0) {
        this.emitLike();
      }
      if (data.dislikes > 0) {
        this.emitDislike();
      }
      this.setState({
        likes: this.state.likes + data.likes,
        dislikes: this.state.dislikes + data.dislikes
      });
    });
    socket.on("numOnline", data => {
      this.setState(data);
    });
    this.inputRef.current.addEventListener("keyup", event => {
      if (event.keyCode === 13) {
        socket.emit("createUser", { userName: this.inputRef.current.value });
      }
      this.startSong();
    });
  }

  handleSubmitMessage(e) {
    if (e.key === "Enter" && e.target.value.replace(/\s/g, "").length) {
      socket.emit("sendMessage", { message: e.target.value });
      e.target.value = "";
    }
  }

  componentWillUnmount() {
    socket.emit("leaving", {});
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
        this.emitDislike();
      } else if (prev === "Dislike") {
        this.setState({
          likes: this.state.likes + 1,
          dislikes: this.state.dislikes - 1
        });
        socket.emit("opinion", { likes: 1, dislikes: -1 });
        this.emitLike();
      } else {
        if (curr === "Like") {
          this.setState({ likes: this.state.likes + 1 });
          socket.emit("opinion", { likes: 1, dislikes: 0 });
          this.emitLike();
        } else {
          this.setState({ dislikes: this.state.dislikes + 1 });
          socket.emit("opinion", { likes: 0, dislikes: 1 });
          this.emitDislike();
        }
      }
    }
  };

  emitLike() {
    if (this.state.likeFlashes.length >= 20) {
      this.setState({ likeFlashes: [""] });
    } else {
      this.setState({ likeFlashes: [...this.state.likeFlashes, ""] });
    }
  }
  emitDislike() {
    if (this.state.dislikeFlashes.length >= 20) {
      this.setState({ dislikeFlashes: [""] });
    } else {
      this.setState({ dislikeFlashes: [...this.state.dislikeFlashes, ""] });
    }
  }
}

export default Home;
