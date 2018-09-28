module.exports = {
  base64encode: str => Buffer.from(str).toString("base64"),
  getRandom: num => Math.floor(Math.random() * num),
  randomLetter: () => String.fromCharCode(97 + Math.floor(Math.random() * 26))
};
