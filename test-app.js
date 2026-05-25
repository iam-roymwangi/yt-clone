async function test() {
  const baseUrl = "http://localhost:3001";
  let errors = 0;

  try {
    console.log("Testing Search...");
    const res = await fetch(`${baseUrl}/search?q=cats`);
    if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
    const text = await res.text();
    if (!text.includes("Results for &quot;cats&quot;")) throw new Error("Search page did not render correctly");
    console.log("✅ Search works!");
  } catch (err) {
    console.error("❌ Search error:", err.message);
    errors++;
  }

  try {
    console.log("Testing Info API...");
    const res = await fetch(`${baseUrl}/api/info?v=dQw4w9WgXcQ`);
    if (!res.ok) throw new Error(`Info failed with status ${res.status}`);
    const json = await res.json();
    if (!json.title) throw new Error("Info JSON missing title");
    console.log("✅ Info API works! Title:", json.title);
  } catch (err) {
    console.error("❌ Info API error:", err.message);
    errors++;
  }

  try {
    console.log("Testing Thumbnail API...");
    const res = await fetch(`${baseUrl}/api/thumbnail?v=dQw4w9WgXcQ`);
    if (!res.ok) throw new Error(`Thumbnail failed with status ${res.status}`);
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("image/jpeg")) throw new Error(`Thumbnail returned wrong content type: ${contentType}`);
    console.log("✅ Thumbnail API works!");
  } catch (err) {
    console.error("❌ Thumbnail API error:", err.message);
    errors++;
  }

  try {
    console.log("Testing Stream API...");
    const res = await fetch(`${baseUrl}/api/stream?v=dQw4w9WgXcQ`);
    if (!res.ok) throw new Error(`Stream failed with status ${res.status}`);
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("video/mp4") && !contentType?.includes("video/webm")) throw new Error(`Stream returned wrong content type: ${contentType}`);
    console.log("✅ Stream API works! Content-Type:", contentType);
  } catch (err) {
    console.error("❌ Stream API error:", err.message);
    errors++;
  }

  if (errors === 0) {
    console.log("🎉 All tests passed successfully!");
  } else {
    console.error(`💥 ${errors} test(s) failed.`);
    process.exit(1);
  }
}

test();
