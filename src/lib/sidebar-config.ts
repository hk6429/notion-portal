export type SidebarItem =
  | {
      kind: "grouped";
      key: string;
      label: string;
      icon?: string;
      dataSourceId: string;
      groupBy:
        | { type: "select"; property: string }
        | { type: "select-map"; property: string; map: Record<string, string>; fallback: string }
        | { type: "relation"; property: string }
        | { type: "relation-via-teacher"; teacherRelation: string; groupProperty: string };
    }
  | {
      kind: "external";
      key: string;
      label: string;
      icon?: string;
      url: string;
    };

export const SIDEBAR_CONFIG: SidebarItem[] = [
  {
    kind: "grouped",
    key: "lesson-study",
    label: "114教案研習資料庫",
    icon: "📚",
    dataSourceId: "2be2d00e283a81a4b393000b7cd710b6",
    groupBy: {
      type: "select-map",
      property: "選取",
      map: { 研習: "研習", 觀議課: "教案" },
      fallback: "教案",
    },
  },
  {
    kind: "grouped",
    key: "ai-tools",
    label: "114年AI工具",
    icon: "🤖",
    dataSourceId: "2be2d00e283a81d3ba3e000b5a40615e",
    groupBy: { type: "relation", property: "分類" },
  },
  {
    kind: "grouped",
    key: "teachers",
    label: "教學老師",
    icon: "👩‍🏫",
    dataSourceId: "2be2d00e283a81fb8967000beb90a8e2",
    groupBy: { type: "select", property: "任教科目" },
  },
  {
    kind: "external",
    key: "submit-lesson",
    label: "AI題目投稿",
    icon: "✍️",
    url: "https://chennaicheng.notion.site/2be2d00e283a81fe8ad5f91fd653db71?pvs=105",
  },
  {
    kind: "external",
    key: "submit-tool",
    label: "數位工具投稿",
    icon: "🛠️",
    url: "https://chennaicheng.notion.site/2be2d00e283a8173b9e2f88781c9caf1",
  },
];
