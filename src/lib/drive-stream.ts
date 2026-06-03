const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Resolve a direct download URL for a public Google Drive file.
 * Bypasses the Drive preview player (which shows "still being processed").
 */
export async function resolveDriveDownloadUrl(fileId: string): Promise<string> {
  const candidates = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
  ];

  for (const url of candidates) {
    const resolved = await tryResolveUrl(url, fileId);
    if (resolved) return resolved;
  }

  return candidates[0];
}

async function tryResolveUrl(
  url: string,
  fileId: string
): Promise<string | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "manual",
  });

  // Direct redirect to media
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (
      location &&
      (location.includes("usercontent.google.com") ||
        location.includes("googleusercontent.com") ||
        !location.includes("drive.google.com/file"))
    ) {
      return location;
    }
  }

  if (res.status === 200) {
    const contentType = res.headers.get("content-type") ?? "";
    if (
      contentType.includes("video") ||
      contentType.includes("octet-stream") ||
      contentType.includes("application/")
    ) {
      return url;
    }
  }

  const html = await res.text().catch(() => "");

  const formAction = html.match(/action="([^"]*uc[^"]*)"/i)?.[1];
  if (formAction) {
    const decoded = formAction.replace(/&amp;/g, "&");
    return decoded.startsWith("http")
      ? decoded
      : `https://drive.google.com${decoded.startsWith("/") ? "" : "/"}${decoded}`;
  }

  const confirmMatch = html.match(/confirm=([0-9A-Za-z_]+)/);
  const uuidMatch = html.match(/uuid=([0-9A-Za-z-]+)/);
  if (confirmMatch) {
    let confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmMatch[1]}`;
    if (uuidMatch) confirmUrl += `&uuid=${uuidMatch[1]}`;
    return confirmUrl;
  }

  return null;
}

export { USER_AGENT as DRIVE_USER_AGENT };
