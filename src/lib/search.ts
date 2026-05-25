import * as ytSearch from "youtube-search-api";

export type SearchItem = {
  id: string;
  type: string;
  title: string;
  thumbnail?: unknown;
  channelTitle?: string;
  length?: { simpleText?: string };
};

export type SearchResult = {
  items: SearchItem[];
  nextCursor: string | null;
};

type NextPagePayload = {
  nextPageToken: string | null;
  nextPageContext: Record<string, unknown>;
};

function encodeCursor(nextPage: NextPagePayload): string | null {
  if (!nextPage.nextPageToken) return null;
  return Buffer.from(JSON.stringify(nextPage)).toString("base64url");
}

function decodeCursor(cursor: string): NextPagePayload {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
}

export async function searchVideos(
  query: string,
  cursor?: string | null
): Promise<SearchResult> {
  const limit = 20;

  if (cursor) {
    const nextPage = decodeCursor(cursor);
    const res = await ytSearch.NextPage(nextPage, false, limit);
    return {
      items: res.items ?? [],
      nextCursor: res.nextPage?.nextPageToken
        ? encodeCursor(res.nextPage)
        : null,
    };
  }

  const res = await ytSearch.GetListByKeyword(query, false, limit);
  return {
    items: res.items ?? [],
    nextCursor: res.nextPage?.nextPageToken
      ? encodeCursor(res.nextPage)
      : null,
  };
}

export async function searchChannels(
  query: string,
  cursor?: string | null
): Promise<SearchResult> {
  const limit = 12;

  if (cursor) {
    const nextPage = decodeCursor(cursor);
    const res = await ytSearch.NextPage(nextPage, false, limit);
    const items = (res.items ?? []).filter(
      (item: SearchItem) => item.type === "channel"
    );
    return {
      items,
      nextCursor: res.nextPage?.nextPageToken
        ? encodeCursor(res.nextPage)
        : null,
    };
  }

  const res = await ytSearch.GetListByKeyword(
    query,
    false,
    limit,
    [{ type: "channel" }]
  );
  const items = (res.items ?? []).filter(
    (item: SearchItem) => item.type === "channel"
  );
  return {
    items,
    nextCursor: res.nextPage?.nextPageToken
      ? encodeCursor(res.nextPage)
      : null,
  };
}
