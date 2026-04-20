"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import type { SidebarItem } from "@/lib/sidebar-config";

type Group = { name: string; items: { id: string; title: string }[] };

function NumberBadge({ code }: { code: string }) {
  return (
    <span className="text-[11px] text-gray-400 mr-1.5 shrink-0 tabular-nums">
      {code}
    </span>
  );
}

function Chevron({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 text-[10px] transition-colors shrink-0"
      aria-label={open ? "收合" : "展開"}
    >
      {open ? "▼" : "▶"}
    </button>
  );
}

function LeafRow({
  href,
  active,
  code,
  label,
  external,
}: {
  href: string;
  active: boolean;
  code: string;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={[
        "flex items-center gap-1 py-1 px-1.5 rounded-md transition-colors text-sm min-w-0",
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80",
      ].join(" ")}
    >
      <span className="w-4" />
      <NumberBadge code={code} />
      <span className="truncate">{label}</span>
      {external && <span className="text-gray-400 text-xs ml-1">↗</span>}
    </Link>
  );
}

function GroupNode({
  group,
  parentCode,
  groupIndex,
  pathname,
}: {
  group: Group;
  parentCode: string;
  groupIndex: number;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const code = `${parentCode}.${groupIndex + 1}`;
  return (
    <li>
      <div className="flex items-center gap-1 py-1 px-1.5 rounded-md hover:bg-gray-100/80 transition-colors">
        <Chevron open={open} onClick={() => setOpen(!open)} />
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center text-sm text-gray-700 hover:text-gray-900 truncate min-w-0 text-left"
        >
          <NumberBadge code={code} />
          <span className="truncate">
            📁 {group.name}（{group.items.length}）
          </span>
        </button>
      </div>
      {open && group.items.length > 0 && (
        <ul className="ml-3 border-l border-gray-200/70 pl-2 mt-0.5 space-y-0.5">
          {group.items.map((item, i) => {
            const href = `/p/${item.id}`;
            return (
              <LeafRow
                key={item.id}
                href={href}
                active={pathname === href}
                code={`${code}.${i + 1}`}
                label={`📄 ${item.title}`}
              />
            );
          })}
        </ul>
      )}
      {open && group.items.length === 0 && (
        <p className="ml-6 text-xs text-gray-400 italic py-1 px-1">（無項目）</p>
      )}
    </li>
  );
}

function GroupedItemNode({
  item,
  code,
  pathname,
}: {
  item: Extract<SidebarItem, { kind: "grouped" }>;
  code: string;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const toggle = async () => {
    if (!loaded) {
      setLoading(true);
      try {
        const res = await fetch(`/api/sidebar/${item.key}`);
        const data = await res.json();
        setGroups(data.groups || []);
      } catch {}
      setLoading(false);
      setLoaded(true);
    }
    setOpen(!open);
  };

  const href = `/ds/${item.dataSourceId}`;
  const active = pathname === href;

  return (
    <li>
      <div
        className={[
          "flex items-center gap-1 py-1 px-1.5 rounded-md transition-colors",
          active ? "bg-blue-50" : "hover:bg-gray-100/80",
        ].join(" ")}
      >
        <Chevron open={open} onClick={toggle} />
        <Link
          href={href}
          className={[
            "flex-1 text-sm truncate flex items-center min-w-0",
            active
              ? "text-blue-700 font-medium"
              : "text-gray-800 hover:text-gray-900",
          ].join(" ")}
        >
          <NumberBadge code={code} />
          <span className="truncate">
            {item.icon ? `${item.icon} ` : "🗄️ "}
            {item.label}
          </span>
        </Link>
      </div>
      {open && (
        <ul className="ml-3 border-l border-gray-200/70 pl-2 mt-0.5 space-y-0.5">
          {loading && (
            <li className="text-xs text-gray-400 py-1 px-2">載入中...</li>
          )}
          {loaded && groups.length === 0 && !loading && (
            <li className="text-xs text-gray-400 py-1 px-2 italic">
              （無資料）
            </li>
          )}
          {groups.map((g, i) => (
            <GroupNode
              key={g.name}
              group={g}
              parentCode={code}
              groupIndex={i}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function ExternalItemNode({
  item,
  code,
}: {
  item: Extract<SidebarItem, { kind: "external" }>;
  code: string;
}) {
  return (
    <li>
      <LeafRow
        href={item.url}
        active={false}
        code={code}
        label={`${item.icon ? `${item.icon} ` : "🔗 "}${item.label}`}
        external
      />
    </li>
  );
}

export default function Sidebar({
  config,
}: {
  config: SidebarItem[];
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const flatSearchIndex = useMemo(
    () =>
      config.map((item) => ({
        key: item.key,
        title: item.label,
        href: item.kind === "external" ? item.url : `/ds/${item.dataSourceId}`,
        external: item.kind === "external",
      })),
    [config]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return flatSearchIndex.filter((i) => i.title.toLowerCase().includes(q));
  }, [query, flatSearchIndex]);

  return (
    <aside className="w-80 h-screen sticky top-0 overflow-y-auto border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <Link href="/" className="block mb-5 group">
          <h1 className="text-base font-semibold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
            新竹市數位語文教學資料庫
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Hsinchu Digital Chinese Language Teaching Portal
          </p>
        </Link>

        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋"
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>

        {query && (
          <div className="mb-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            {results.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">無結果</p>
            ) : (
              <ul>
                {results.map((r) => (
                  <li key={r.key}>
                    <Link
                      href={r.href}
                      target={r.external ? "_blank" : undefined}
                      className="block px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-800"
                    >
                      {r.title}
                      {r.external && <span className="text-gray-400 ml-1">↗</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!query && (
          <section>
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              目錄
            </h2>
            <ul className="space-y-0.5">
              {config.map((item, i) => {
                const code = `${i + 1}`;
                if (item.kind === "grouped") {
                  return (
                    <GroupedItemNode
                      key={item.key}
                      item={item}
                      code={code}
                      pathname={pathname}
                    />
                  );
                }
                return (
                  <ExternalItemNode key={item.key} item={item} code={code} />
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}
