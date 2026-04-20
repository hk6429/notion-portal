import { notion, queryDataSource, extractEntryTitle } from "./notion";
import { SIDEBAR_CONFIG, SidebarItem } from "./sidebar-config";

export type Group = {
  name: string;
  items: { id: string; title: string }[];
};

function normalizeId(id: string) {
  return id.replace(/-/g, "");
}

const titleCache = new Map<string, string>();
async function getPageTitle(id: string): Promise<string> {
  if (titleCache.has(id)) return titleCache.get(id)!;
  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties || {};
    for (const v of Object.values(props) as any[]) {
      if (v.type === "title" && v.title?.[0]?.plain_text) {
        const t = v.title.map((x: any) => x.plain_text).join("");
        titleCache.set(id, t);
        return t;
      }
    }
  } catch {}
  titleCache.set(id, "未命名");
  return "未命名";
}

export async function computeGroups(item: SidebarItem): Promise<Group[]> {
  if (item.kind === "external") return [];

  const entries = await queryDataSource(item.dataSourceId);
  const groups = new Map<string, { id: string; title: string }[]>();

  const cfg = item.groupBy;

  if (cfg.type === "select" || cfg.type === "select-map") {
    for (const entry of entries) {
      const prop = entry.properties?.[cfg.property];
      const rawName = prop?.select?.name || "";
      let groupName: string;
      if (cfg.type === "select-map") {
        groupName = cfg.map[rawName] || cfg.fallback;
      } else {
        groupName = rawName || "未分類";
      }
      const list = groups.get(groupName) || [];
      list.push({ id: normalizeId(entry.id), title: extractEntryTitle(entry) });
      groups.set(groupName, list);
    }
  } else if (cfg.type === "relation") {
    const relationIds = new Set<string>();
    for (const entry of entries) {
      const rels: any[] = entry.properties?.[cfg.property]?.relation || [];
      for (const r of rels) relationIds.add(r.id);
    }
    await Promise.all([...relationIds].map((id) => getPageTitle(id)));

    for (const entry of entries) {
      const rels: any[] = entry.properties?.[cfg.property]?.relation || [];
      const title = extractEntryTitle(entry);
      const id = normalizeId(entry.id);
      if (rels.length === 0) {
        const list = groups.get("未分類") || [];
        list.push({ id, title });
        groups.set("未分類", list);
      } else {
        for (const r of rels) {
          const groupName = titleCache.get(r.id) || "未命名";
          const list = groups.get(groupName) || [];
          list.push({ id, title });
          groups.set(groupName, list);
        }
      }
    }
  } else if (cfg.type === "relation-via-teacher") {
    const allLessonIds = new Set<string>();
    for (const teacher of entries) {
      const rels: any[] = teacher.properties?.[cfg.teacherRelation]?.relation || [];
      for (const r of rels) allLessonIds.add(r.id);
    }
    await Promise.all([...allLessonIds].map((id) => getPageTitle(id)));

    for (const teacher of entries) {
      const subject = teacher.properties?.[cfg.groupProperty]?.select?.name || "未分類";
      const rels: any[] = teacher.properties?.[cfg.teacherRelation]?.relation || [];
      const list = groups.get(subject) || [];
      for (const r of rels) {
        const title = titleCache.get(r.id) || "未命名";
        if (!list.find((x) => x.id === normalizeId(r.id))) {
          list.push({ id: normalizeId(r.id), title });
        }
      }
      groups.set(subject, list);
    }
  }

  return [...groups.entries()]
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
}

export function getSidebarItem(key: string): SidebarItem | undefined {
  return SIDEBAR_CONFIG.find((i) => i.key === key);
}
