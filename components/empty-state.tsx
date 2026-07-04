import Link from "next/link";

export default function EmptyState({
  icon,
  title,
  body,
  actionHref,
  actionLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 rounded-full border border-border bg-surface p-4 text-gold-500">
          {icon}
        </div>
      )}
      <h2 className="font-display text-xl font-semibold text-text">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
        {body}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
