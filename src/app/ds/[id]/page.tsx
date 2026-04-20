import { queryDataSource, fetchDataSourceMeta } from "@/lib/notion";
import DatabaseView from "@/components/DatabaseView";

export const revalidate = 300;

export default async function DataSourcePage(props: PageProps<"/ds/[id]">) {
  const { id } = await props.params;
  const [meta, entries] = await Promise.all([
    fetchDataSourceMeta(id),
    queryDataSource(id),
  ]);

  return (
    <article>
      <div className="flex items-baseline gap-3 mb-1">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          {meta.icon && meta.icon.length <= 2 ? meta.icon : "🗄️"} {meta.title}
        </h1>
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-8 tabular-nums">
        {entries.length} 筆資料
      </p>
      <DatabaseView entries={entries} />
    </article>
  );
}
