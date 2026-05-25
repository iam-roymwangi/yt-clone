const { videoInfo, getFormats } = require("youtube-ext");

async function test() {
  const info = await videoInfo("dQw4w9WgXcQ");
  const formats = await getFormats(info.stream);
  const combined = formats.find(f => f.hasVideo && f.hasAudio);
  console.log("Combined URL exists:", !!(combined && combined.url));
  if (combined) console.log(combined.url.slice(0, 100));
}
test();
