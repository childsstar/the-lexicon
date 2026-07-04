import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function PageHeader({
  title,
  description,
  backHref = "/dashboard",
  backLabel = "Dashboard",
  action,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-text-subtle transition-colors hover:text-gold-300"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        {backLabel}
      </Link>
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-text">
          {title}
        </h1>
        {action}
      </div>
      {description && (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      <div className="gilded-rule mt-4" />
    </div>
  );
}
