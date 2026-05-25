const play = require("play-dl");

async function test() {
  try {
    const info = await play.video_info("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  } catch (err) {
    console.error(err);
  }
}
test();
