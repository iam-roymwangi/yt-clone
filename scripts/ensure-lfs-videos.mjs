#!/usr/bin/env node
/**
 * Ensures public/videos contains real media files, not Git LFS pointer stubs.
 * Runs before `next build` on Vercel and locally.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");
const LFS_MARKER = "version https://git-lfs.github.com/spec/v1";
const VIDEO_EXT = /\.(mp4|webm|ogg)$/i;

function listVideos() {
  if (!fs.existsSync(VIDEOS_DIR)) return [];
  return fs
    .readdirSync(VIDEOS_DIR)
    .filter((name) => VIDEO_EXT.test(name) && !name.startsWith("."));
}

function isPointer(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 4096) return false;
    const head = fs.readFileSync(filePath, "utf8").slice(0, 40);
    return head.startsWith(LFS_MARKER);
  } catch {
    return true;
  }
}

function isMedia(filePath) {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(12);
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);
  const box = buf.slice(4, 8).toString("ascii");
  return box === "ftyp" || buf.slice(0, 4).toString("ascii") === "OggS";
}

function tryLfsPull() {
  try {
    execSync("git lfs version", { stdio: "pipe" });
    execSync("git lfs install", { stdio: "inherit" });
    execSync("git lfs pull --include=public/videos/**", { stdio: "inherit" });
    return true;
  } catch (err) {
    console.warn("git lfs pull failed:", err.message ?? err);
    return false;
  }
}

const videos = listVideos();

if (videos.length === 0) {
  console.warn("No videos found in public/videos — library will be empty.");
  process.exit(0);
}

const pointers = videos.filter((name) =>
  isPointer(path.join(VIDEOS_DIR, name))
);

if (pointers.length > 0) {
  console.warn(
    `Found ${pointers.length} Git LFS pointer file(s). Pulling real objects…`
  );
  tryLfsPull();
}

const invalid = [];

for (const name of listVideos()) {
  const full = path.join(VIDEOS_DIR, name);
  if (isPointer(full)) {
    invalid.push({
      name,
      reason:
        "still an LFS pointer — enable Git LFS in Vercel project settings and run `git lfs push --all origin`",
    });
  } else if (!isMedia(full)) {
    invalid.push({ name, reason: "file is not a valid video" });
  }
}

if (invalid.length > 0) {
  console.error("\nVideo deployment check failed:\n");
  for (const { name, reason } of invalid) {
    console.error(`  • ${name}\n    ${reason}`);
  }
  console.error(`
To fix on Vercel:
  1. Dashboard → Project → Settings → Git → enable "Git Large File Storage (LFS)"
  2. Locally commit all videos and push LFS objects:
       git add public/videos
       git lfs push --all origin
       git push origin main
  3. Redeploy (Deployments → … → Redeploy)
`);
  process.exit(1);
}

console.log(`Verified ${listVideos().length} video file(s) in public/videos`);
