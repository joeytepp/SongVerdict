const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    song: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    album: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    art: {
      type: String,
      required: true
    },
    likes: {
      type: Number,
      required: true
    },
    dislikes: {
      type: Number,
      required: true
    },
    verdict: {
      type: Number,
      required: true
    }
  },
  { capped: 1000 }
);

module.exports = mongoose.model("Song", schema);
