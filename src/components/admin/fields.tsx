const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type BaseProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  error?: string;
  hint?: string;
  required?: boolean;
};

/**
 * `aria-invalid` and `aria-describedby` are wired up so the error is announced
 * rather than only shown — a red border communicates nothing to a screen reader.
 */
function FieldShell({
  name,
  label,
  error,
  hint,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-foreground">
        {label}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="mt-0.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, hint?: string, error?: string) {
  return [hint && `${name}-hint`, error && `${name}-error`]
    .filter(Boolean)
    .join(" ") || undefined;
}

export function TextField({
  type = "text",
  ...props
}: BaseProps & { type?: string }) {
  const { name, defaultValue, error, hint, required } = props;
  return (
    <FieldShell {...props}>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextAreaField({ rows = 5, ...props }: BaseProps & { rows?: number }) {
  const { name, defaultValue, error, hint, required } = props;
  return (
    <FieldShell {...props}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={`${inputClass} resize-y`}
      />
    </FieldShell>
  );
}
