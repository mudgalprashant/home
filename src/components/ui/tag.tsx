/** Small label for a technology or category. */
export function Tag({ children }: { children: string }) {
  return (
    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted">
      {children}
    </span>
  );
}

export function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
