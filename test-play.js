const play = require("play-dl");

async function test() {
  try {
    const stream = await play.stream("https://www.youtube.com/watch?v=PH6PPfHEoKs");
    console.log("Stream found!", stream.url);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
