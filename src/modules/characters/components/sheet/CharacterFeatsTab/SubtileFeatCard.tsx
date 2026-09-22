"use client";

type CollapsibleItemProps = {
  itemKey: string;
  title: string;
  subtitle?: string;
  description: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
  onDelete?: (key: string) => void;
};

export function SubtileFeatCard({
  itemKey,
  title,
  subtitle,
  description,
  isOpen,
  onToggle,
  onDelete,
}: CollapsibleItemProps) {
  // Détecte si la description contient du balisage HTML (ex: export Foundry)
  const isHtml = /<[a-z][\s\S]*>/i.test(description);

  return (
    <div
      className="rounded-lg border transition-all duration-200 mb-2 overflow-hidden bg-transparent"
      style={{ borderColor: "var(--dnd-accent-soft)", opacity: 0.95 }}
    >
      <div className="flex items-center justify-between px-3 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
        <button
          type="button"
          onClick={() => onToggle(itemKey)}
          aria-expanded={isOpen}
          className="flex items-center gap-2 truncate flex-1 text-left select-none outline-none focus-visible:underline"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300 shrink-0 opacity-70"
            style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              color: "var(--dnd-accent)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-xs sm:text-sm tracking-tight text-[var(--dnd-ink)] truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] opacity-60 font-medium truncate">({subtitle})</span>
          )}
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(itemKey);
            }}
            className="ml-2 p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
            title="Supprimer cet élément"
            aria-label={`Supprimer ${title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="px-3 pb-3 pt-1 border-t text-xs sm:text-sm transition-all duration-300"
          style={{ borderColor: "var(--dnd-accent-soft)" }}
        >
          {isHtml ? (
            <div
              className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85 prose prose-xs dark:prose-invert max-w-none"
              style={{ color: "var(--dnd-muted)" }}
              dangerouslySetInnerHTML={{ __html: description || "Aucune description disponible." }}
            />
          ) : (
            <p
              className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85"
              style={{ color: "var(--dnd-muted)" }}
            >
              {description || "Aucune description disponible."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}