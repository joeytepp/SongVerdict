const dotenv = require("dotenv");
dotenv.config();

const client = require("socket.io").listen(4000).sockets;
const mongoose = require("mongoose");
const request = require("request");

const { base64encode, getRandom, randomLetter } = require("./util");
const Song = require("./Song");
const refreshToken = base64encode(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
);

let numOnline = 0;
let accessToken = "abc123";
let likes = 0;
let dislikes = 0;
let currentSong, lastSong;
let started = false;
let startTime = new Date().getTime() + 500;
let intervalId;

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
  socket.on("getTime", () => {
    numOnline++;
    client.emit("numOnline", { numOnline });
    let time = 30 - Math.floor((new Date().getTime() - startTime) / 1000);
    socket.emit("startTime", { time });
  });

  socket.on("opinion", data => {
    likes += data.likes;
    dislikes += data.dislikes;
    if (dislikes == numOnline && numOnline >= 3) {
      saveLastSong();
      client.emit("newSong", currentSong);
      clearInterval(intervalId);
      started = false;
      likes = 0;
      dislikes = 0;
      startTime = new Date().getTime();
      getSong();
    } else {
      socket.broadcast.emit("opinionReceived", data);
    }
  });

  socket.on("List", data => {
    let { type } = data;
    let verd = { $gte: -100000000000 };
    let sort = { _id: -1 };
    if (type === "Good") {
      verd = { $gt: 0 };
      sort = { verdict: -1 };
    } else if (type === "Bad") {
      verd = { $lt: 0 };
      sort = { verdict: +1 };
    }
    Song.find({ verdict: verd })
      .sort(sort)
      .then(data => {
        socket.emit(`${type}ListReceived`, data);
      });
  });

  socket.on("updateNumOnline", data => {
    numOnline = data.num;
    client.emit("numOnline", { numOnline });
  });
});

function getSong() {
  request(
    {
      url: "http://api.spotify.com/v1/search",
      options: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        q: randomLetter(),
        type: "track",
        offset: getRandom(10000)
      }
    },
    (err, res, body) => {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return getSong();
      }
      if (!body.tracks) {
        if (body.error.status == 404) {
          return getSong();
        }
        return getAccessToken();
      }

      let songs = body.tracks.items.filter(
        song => song.album.images[1] && song.preview_url
      );

      if (!songs.length) {
        getSong();
      }

      songs = songs.map(i => {
        return {
          song: i.name,
          artist: i.artists[0].name,
          album: i.album.name,
          url: i.preview_url.replace("https", "http"),
          externalUrl: i.external_urls.spotify,
          art: i.album.images[1].url
        };
      });

      let index = getRandom(songs.length);
      lastSong = currentSong;
      currentSong = songs[index];
      if (!started) {
        intervalId = intervalSet();
        started = true;
      }
    }
  );
}

function getAccessToken() {
  request(options, (err, res, body) => {
    accessToken = JSON.parse(body).access_token;
    return getSong();
  });
}

function intervalSet() {
  return setInterval(() => {
    startTime = new Date().getTime();
    client.emit("newSong", currentSong);
    saveLastSong();
    likes = 0;
    dislikes = 0;
    getSong();
  }, 30 * 1000);
}

function saveLastSong() {
  if (lastSong && numOnline > 0) {
    let saveSong = new Song({
      _id: new mongoose.Types.ObjectId(),
      ...lastSong,
      likes,
      dislikes,
      verdict: likes - dislikes
    });
    saveSong.save().catch(err => console.log(err)); // Some quality error handling
  }
}
