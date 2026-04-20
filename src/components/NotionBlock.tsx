import Link from "next/link";

type RichText = {
  plain_text: string;
  href?: string | null;
  annotations: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
};

function RichTextSpan({ rt }: { rt: RichText }) {
  const { annotations, plain_text, href } = rt;
  let el: React.ReactNode = plain_text;
  if (annotations.code) el = <code className="bg-gray-100 rounded px-1 font-mono text-sm">{el}</code>;
  if (annotations.bold) el = <strong>{el}</strong>;
  if (annotations.italic) el = <em>{el}</em>;
  if (annotations.strikethrough) el = <s>{el}</s>;
  if (annotations.underline) el = <u>{el}</u>;
  if (href)
    el = (
      <a href={href} className="text-blue-600 underline" target="_blank" rel="noreferrer">
        {el}
      </a>
    );
  return <>{el}</>;
}

function RichText({ items }: { items: RichText[] }) {
  return (
    <>
      {items.map((rt, i) => (
        <RichTextSpan key={i} rt={rt} />
      ))}
    </>
  );
}

function normalizeId(id: string) {
  return id.replace(/-/g, "");
}

export default function NotionBlock({ block }: { block: any }) {
  const type = block.type;
  const data = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p className="my-3 leading-7">
          <RichText items={data.rich_text} />
        </p>
      );
    case "heading_1":
      return (
        <h1 className="text-3xl font-bold mt-8 mb-3">
          <RichText items={data.rich_text} />
        </h1>
      );
    case "heading_2":
      return (
        <h2 className="text-2xl font-bold mt-6 mb-2">
          <RichText items={data.rich_text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="text-xl font-semibold mt-5 mb-2">
          <RichText items={data.rich_text} />
        </h3>
      );
    case "bulleted_list_item":
      return (
        <li className="my-1 ml-6 list-disc">
          <RichText items={data.rich_text} />
        </li>
      );
    case "numbered_list_item":
      return (
        <li className="my-1 ml-6 list-decimal">
          <RichText items={data.rich_text} />
        </li>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-700">
          <RichText items={data.rich_text} />
        </blockquote>
      );
    case "callout":
      return (
        <div className="flex gap-2 bg-gray-100 rounded p-3 my-3">
          <span>{data.icon?.emoji || "💡"}</span>
          <div className="flex-1">
            <RichText items={data.rich_text} />
          </div>
        </div>
      );
    case "code":
      return (
        <pre className="bg-gray-900 text-gray-100 rounded p-4 my-3 overflow-x-auto text-sm">
          <code>{data.rich_text.map((r: RichText) => r.plain_text).join("")}</code>
        </pre>
      );
    case "divider":
      return <hr className="my-6 border-gray-200" />;
    case "image": {
      const url = data.type === "external" ? data.external.url : data.file?.url;
      return (
        <figure className="my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-w-full rounded" />
          {data.caption?.length > 0 && (
            <figcaption className="text-sm text-gray-500 mt-1">
              <RichText items={data.caption} />
            </figcaption>
          )}
        </figure>
      );
    }
    case "to_do":
      return (
        <div className="my-1 flex items-center gap-2">
          <input type="checkbox" checked={data.checked} readOnly />
          <span className={data.checked ? "line-through text-gray-500" : ""}>
            <RichText items={data.rich_text} />
          </span>
        </div>
      );
    case "toggle":
      return (
        <details className="my-2">
          <summary className="cursor-pointer font-medium">
            <RichText items={data.rich_text} />
          </summary>
        </details>
      );
    case "child_page":
      return (
        <Link
          href={`/p/${normalizeId(block.id)}`}
          className="block my-2 p-3 border border-gray-200 rounded hover:bg-gray-50"
        >
          📄 {data.title}
        </Link>
      );
    case "child_database":
      return (
        <Link
          href={`/p/${normalizeId(block.id)}`}
          className="block my-2 p-3 border border-gray-200 rounded hover:bg-gray-50"
        >
          🗄️ {data.title}
        </Link>
      );
    case "bookmark":
    case "link_preview":
      return (
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          className="block my-3 p-3 border border-gray-200 rounded text-blue-600 hover:bg-gray-50 text-sm break-all"
        >
          🔗 {data.url}
        </a>
      );
    default:
      return (
        <div className="my-2 text-gray-400 text-sm italic">
          [未支援的區塊類型: {type}]
        </div>
      );
  }
}
