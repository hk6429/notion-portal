import Link from "next/link";
import { extractEntryTitle, extractEntrySnippet } from "@/lib/notion";

function normalizeId(id: string) {
  return id.replace(/-/g, "");
}

export default function DatabaseView({ entries }: { entries: any[] }) {
  if (entries.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-gray-200 rounded-lg">
        <p className="text-gray-400 text-sm">這個資料庫目前沒有資料。</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
      {entries.map((entry) => {
        const title = extractEntryTitle(entry);
        const snippet = extractEntrySnippet(entry);
        const icon = entry.icon?.emoji || entry.icon?.icon?.name;
        return (
          <li key={entry.id}>
            <Link
              href={`/p/${normalizeId(entry.id)}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <span className="text-base mt-0.5">
                {icon && icon.length <= 2 ? icon : "📄"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                  {title}
                </div>
                {snippet && (
                  <div className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                    {snippet}
                  </div>
                )}
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 text-sm shrink-0 mt-1">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
