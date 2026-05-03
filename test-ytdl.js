const ytdl = require("@distube/ytdl-core");

async function test() {
  try {
    const info = await ytdl.getInfo("dQw4w9WgXcQ");
    const format = ytdl.chooseFormat(info.formats, { quality: "highest", filter: "audioandvideo" });
    console.log("Format found:", !!format);
    if (!format) {
      console.log("Try without audioandvideo filter:", !!ytdl.chooseFormat(info.formats, { quality: "highest" }));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
