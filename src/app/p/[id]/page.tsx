import {
  fetchPageBlocks,
  fetchPageTitle,
  detectObjectKind,
  fetchDatabaseTitle,
  queryDatabaseEntries,
} from "@/lib/notion";
import NotionBlock from "@/components/NotionBlock";
import DatabaseView from "@/components/DatabaseView";

export const revalidate = 300;

export default async function PagePage(props: PageProps<"/p/[id]">) {
  const { id } = await props.params;
  const kind = await detectObjectKind(id);

  if (kind === "database") {
    const [title, entries] = await Promise.all([
      fetchDatabaseTitle(id),
      queryDatabaseEntries(id),
    ]);
    return (
      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
          🗄️ {title}
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-8 tabular-nums">
          {entries.length} 筆資料
        </p>
        <DatabaseView entries={entries} />
      </article>
    );
  }

  if (kind === "page") {
    const [title, blocks] = await Promise.all([
      fetchPageTitle(id),
      fetchPageBlocks(id),
    ]);
    return (
      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
          {title}
        </h1>
        <div className="text-[15px] leading-7 text-gray-800">
          {blocks.map((block: any) => (
            <NotionBlock key={block.id} block={block} />
          ))}
        </div>
      </article>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">找不到內容</h1>
      <p className="text-gray-500">這個頁面可能尚未分享給 integration。</p>
    </div>
  );
}
