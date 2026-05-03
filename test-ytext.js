const { videoInfo } = require("youtube-ext");

async function test() {
  try {
    const info = await videoInfo("PH6PPfHEoKs");
    console.log(info.stream);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
