/** Extract Google Drive file ID from common share URL formats. */
export function extractDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/uc\?[^#]*\bid=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function driveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function driveThumbnailUrl(fileId: string, width = 640): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

export function isValidDriveUrl(url: string): boolean {
  return extractDriveFileId(url) != null;
}
