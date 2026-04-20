import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

export const ROOT_PAGE_ID = process.env.NOTION_ROOT_PAGE_ID!;

export type TreeNode = {
  id: string;
  title: string;
  type: "page" | "database";
  children: TreeNode[];
};

function normalizeId(id: string) {
  return id.replace(/-/g, "");
}

function getBlockTitle(block: any): string {
  if (block.type === "child_page") return block.child_page.title || "未命名";
  if (block.type === "child_database") return block.child_database.title || "未命名資料庫";
  return "未命名";
}

export async function fetchChildren(blockId: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

export async function buildTree(rootId: string, depth = 0, maxDepth = 3): Promise<TreeNode[]> {
  if (depth > maxDepth) return [];
  const children = await fetchChildren(rootId);
  const nodes: TreeNode[] = [];
  for (const block of children) {
    if (block.type === "child_page" || block.type === "child_database") {
      const node: TreeNode = {
        id: normalizeId(block.id),
        title: getBlockTitle(block),
        type: block.type === "child_page" ? "page" : "database",
        children: [],
      };
      if (block.type === "child_page" && depth < maxDepth) {
        node.children = await buildTree(block.id, depth + 1, maxDepth);
      }
      nodes.push(node);
    }
  }
  return nodes;
}

export async function fetchPageBlocks(pageId: string) {
  return fetchChildren(pageId);
}

export async function fetchPageTitle(pageId: string): Promise<string> {
  try {
    const page: any = await notion.pages.retrieve({ page_id: pageId });
    const props = page.properties || {};
    for (const key of Object.keys(props)) {
      const p = props[key];
      if (p.type === "title" && p.title?.[0]?.plain_text) return p.title[0].plain_text;
    }
  } catch {}
  return "未命名";
}

export type ObjectKind = "page" | "database" | "unknown";

export async function detectObjectKind(id: string): Promise<ObjectKind> {
  try {
    await notion.pages.retrieve({ page_id: id });
    return "page";
  } catch {}
  try {
    await notion.databases.retrieve({ database_id: id });
    return "database";
  } catch {}
  return "unknown";
}

export async function fetchDatabase(databaseId: string): Promise<any> {
  return notion.databases.retrieve({ database_id: databaseId });
}

export async function fetchDatabaseTitle(databaseId: string): Promise<string> {
  try {
    const db: any = await notion.databases.retrieve({ database_id: databaseId });
    const title = db.title?.[0]?.plain_text;
    if (title) return title;
    if (db.data_sources?.[0]?.name) return db.data_sources[0].name;
  } catch {}
  return "資料庫";
}

export async function queryDataSource(dataSourceId: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res: any = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

export async function queryDatabaseEntries(databaseId: string): Promise<any[]> {
  const db: any = await notion.databases.retrieve({ database_id: databaseId });
  const dataSources = db.data_sources || [];
  if (dataSources.length === 0) return [];
  return queryDataSource(dataSources[0].id);
}

export async function fetchDataSourceMeta(
  dataSourceId: string
): Promise<{ title: string; icon?: string }> {
  try {
    const ds: any = await (notion as any).dataSources.retrieve({
      data_source_id: dataSourceId,
    });
    return {
      title: ds.title?.[0]?.plain_text || "未命名資料來源",
      icon: ds.icon?.emoji || ds.icon?.icon?.name,
    };
  } catch {
    return { title: "未命名資料來源" };
  }
}

export function extractEntryTitle(entry: any): string {
  const props = entry.properties || {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p.type === "title" && p.title?.length) {
      return p.title.map((t: any) => t.plain_text).join("") || "未命名";
    }
  }
  return "未命名";
}

export function extractEntrySnippet(entry: any, limit = 120): string {
  const props = entry.properties || {};
  const parts: string[] = [];
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p.type === "rich_text" && p.rich_text?.length) {
      parts.push(`${key}：${p.rich_text.map((t: any) => t.plain_text).join("")}`);
    } else if (p.type === "select" && p.select?.name) {
      parts.push(`${key}：${p.select.name}`);
    } else if (p.type === "multi_select" && p.multi_select?.length) {
      parts.push(`${key}：${p.multi_select.map((s: any) => s.name).join(", ")}`);
    }
    if (parts.join(" · ").length > limit) break;
  }
  const snippet = parts.join(" · ");
  return snippet.length > limit ? snippet.slice(0, limit) + "…" : snippet;
}

const UNNAMED_PATTERNS = [
  "未命名",
  "untitled",
  "無標題",
];

function isUnnamed(title: string): boolean {
  const t = title.trim().toLowerCase();
  if (!t) return true;
  return UNNAMED_PATTERNS.some((p) => t === p.toLowerCase() || t.startsWith(p.toLowerCase()));
}

async function dataSourceHasEntries(dsId: string): Promise<boolean> {
  try {
    const res: any = await (notion as any).dataSources.query({
      data_source_id: dsId,
      page_size: 1,
    });
    return (res.results?.length || 0) > 0;
  } catch {
    return false;
  }
}

export async function listAllDataSources(): Promise<
  { id: string; title: string; icon?: string; lastEdited: string; hasEntries: boolean }[]
> {
  const results: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res: any = await notion.search({
      filter: { value: "data_source", property: "object" } as any,
      page_size: 100,
      start_cursor: cursor,
    } as any);
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  const raw = results.map((ds: any) => ({
    id: normalizeId(ds.id),
    title: ds.title?.[0]?.plain_text || "未命名資料來源",
    icon: ds.icon?.emoji || ds.icon?.icon?.name,
    lastEdited: ds.last_edited_time || "",
  }));

  const withEntries = await Promise.all(
    raw.map(async (ds) => ({
      ...ds,
      hasEntries: await dataSourceHasEntries(ds.id),
    }))
  );

  return withEntries
    .filter((ds) => ds.hasEntries && !isUnnamed(ds.title))
    .sort((a, b) => b.lastEdited.localeCompare(a.lastEdited));
}

export function flattenTree(nodes: TreeNode[]): { id: string; title: string; path: string[] }[] {
  const out: { id: string; title: string; path: string[] }[] = [];
  const walk = (list: TreeNode[], path: string[]) => {
    for (const n of list) {
      out.push({ id: n.id, title: n.title, path: [...path, n.title] });
      if (n.children.length) walk(n.children, [...path, n.title]);
    }
  };
  walk(nodes, []);
  return out;
}
