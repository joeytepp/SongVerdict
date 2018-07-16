const dotenv = require("dotenv");
dotenv.config();

const client = require("socket.io").listen(4000).sockets;
const mongoose = require("mongoose");

const refreshToken = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");
const Song = require("./Song");

var accessToken =
  "BQD8JKnO0JsyTisxCBTurmXtpYmJTreKRGJCYZJUOYNu91wMD98KqI3TxIai8Lhh6fKeFQ13tzN_PR9hRgY";
var num = 0;
var likes = 0;
var dislikes = 0;
var currentSong, lastSong;
var started = false;
var startTime;
const request = require("request");

const getRandom = num => Math.floor(Math.random() * num);

const options = {
  method: "POST",
  url: "https://accounts.spotify.com/api/token",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${refreshToken}`
  },
  form: { grant_type: "client_credentials" }
};

mongoose.connect(process.env.MONGO_URL);
getSong();

client.on("connection", socket => {
  let time = 30 - Math.floor((new Date().getTime() - startTime) / 1000);
  socket.emit("startTime", { time });

  socket.on("opinion", data => {
    likes += data.likes;
    dislikes += data.dislikes;
    socket.broadcast.emit("opinionReceived", data);
  });

  socket.on("GoodList", res => {
    Song.find({ verdict: { $gt: 0 } })
      .sort({ verdict: -1 })
      .then(data => {
        socket.emit("GoodListReceived", data);
      });
  });

  socket.on("BadList", res => {
    Song.find({ verdict: { $lt: 0 } })
      .sort({ verdict: +1 })
      .then(data => {
        socket.emit("BadListReceived", data);
      });
  });
});

client.on("disconnect", socket => {
  num--;
  console.log(num);
});

function getSong() {
  let q = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  request(
    {
      url: "http://api.spotify.com/v1/search",
      options: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        q,
        type: "track",
        offset: getRandom(10000)
      }
    },
    (err, res, body) => {
      body = JSON.parse(body);
      if (!body.tracks) {
        if (body.error.status == 404) {
          return getSong();
        }
        return getAccessToken();
      }
      let songs = body.tracks.items.map(i => {
        return {
          song: i.name,
          artist: i.artists[0].name,
          album: i.album.name,
          url: i.preview_url,
          art: i.album.images[1].url
        };
      });
      songs = songs.filter(song => song.art && song.url);
      let index = getRandom(songs.length);
      lastSong = currentSong;
      currentSong = songs[index];
      if (!started) {
        setInterval(() => {
          startTime = new Date().getTime();
          client.emit("test", currentSong);
          if (lastSong && likes - dislikes !== 0) {
            let saveSong = new Song({
              _id: new mongoose.Types.ObjectId(),
              ...lastSong,
              likes,
              dislikes,
              verdict: likes - dislikes
            });
            saveSong
              .save()
              .then(res => console.log(res))
              .catch(err => console.log(err));
          }
          likes = 0;
          dislikes = 0;
          getSong();
        }, 30 * 1000);
        started = true;
      }
    }
  );
}

function getAccessToken() {
  request(options, (err, res, body) => {
    console.log(body);
    accessToken = JSON.parse(body).access_token;
    console.log("access token is now", accessToken);
    return getSong();
  });
}
