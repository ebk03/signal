const ALGOLIA_BASE = "https://hn.algolia.com/api/v1";

export interface HnItem {
  id: number;
  author: string | null;
  created_at: string;
  text: string | null;
  children: HnItem[];
}

interface AlgoliaSearchHit {
  objectID: string;
  title: string;
  created_at: string;
}

interface AlgoliaSearchResponse {
  hits: AlgoliaSearchHit[];
}

export async function findLatestWhoIsHiringThread(): Promise<{
  id: number;
  createdAt: string;
  title: string;
}> {
  const res = await fetch(
    `${ALGOLIA_BASE}/search_by_date?tags=story,author_whoishiring&hitsPerPage=5`,
  );
  if (!res.ok) {
    throw new Error(`Algolia search failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as AlgoliaSearchResponse;
  const hit = data.hits.find((h) => /who is hiring/i.test(h.title));
  if (!hit) {
    throw new Error('Could not find a "Who is hiring" thread in recent HN stories');
  }
  return { id: Number(hit.objectID), createdAt: hit.created_at, title: hit.title };
}

export async function fetchThreadTree(threadId: number): Promise<HnItem> {
  const res = await fetch(`${ALGOLIA_BASE}/items/${threadId}`);
  if (!res.ok) {
    throw new Error(`Algolia item fetch failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as HnItem;
}
