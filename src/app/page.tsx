import Link from "next/link";
import { SIDEBAR_CONFIG } from "@/lib/sidebar-config";

export const revalidate = 300;

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
        新竹市數位語文教學資料庫
      </h1>
      <p className="text-gray-500 mb-10 leading-relaxed">
        新竹市國中數位語文教學資源入口 — 教案、研習、AI 工具、教師檔案一站整合。
        從左側目錄選擇主題，或使用搜尋。
      </p>

      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          主要資料庫
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SIDEBAR_CONFIG.map((item) => {
            const href =
              item.kind === "external" ? item.url : `/ds/${item.dataSourceId}`;
            return (
              <Link
                key={item.key}
                href={href}
                target={item.kind === "external" ? "_blank" : undefined}
                rel={item.kind === "external" ? "noreferrer" : undefined}
                className="group block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50/70 transition-all"
              >
                <div className="text-[15px] font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                  {item.icon ? `${item.icon} ` : ""}
                  {item.label}
                  {item.kind === "external" && (
                    <span className="text-gray-400 text-xs ml-1">↗</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1.5">
                  {item.kind === "external" ? "外部連結" : "點擊瀏覽資料庫"}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
