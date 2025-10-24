type Item = { label: string; value: string | number | null | undefined };

export default function Highlights({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
}) {
  return (
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="text-sm">
            <div className="text-muted-foreground">{it.label}</div>
            <div className="font-medium">
              {it.value === null || it.value === undefined || it.value === "" ? "—" : String(it.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
