"use client"

import { useState } from "react"
import { ArrowDown, Plus } from "lucide-react"

import { Association } from "@/app/editor/types"
import { ASSOCIATION_META, ASSOCIATION_COLOR_VAR } from "@/app/editor/associations"

interface TrailConnectorProps {
  conn: Association | null;
  annotation: string | null;
  onSaveAnnotation?: (annotation: string) => void;
}

function AnnotationEditor({ annotation, onSave }: { annotation: string | null; onSave: (annotation: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation ?? "");
  const current = annotation ?? "";
  const save = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== current) onSave(next);
  };
  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setDraft(current); setEditing(false); }
        }}
        rows={2}
        placeholder="Why does this step follow?"
        className="mt-1 w-full resize-none rounded-sm border border-input bg-background px-2 py-1.5 text-[15px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }
  if (!current.trim()) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mx-auto flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add annotation
      </button>
    );
  }
  return (
    <p
      onClick={() => setEditing(true)}
      className="cursor-text whitespace-pre-wrap text-[15px] italic leading-relaxed text-foreground/90"
    >
      {current}
    </p>
  );
}

export function TrailConnector({ conn, annotation, onSaveAnnotation }: TrailConnectorProps) {
  const meta = conn ? ASSOCIATION_META[conn.type] : null;
  const BridgeIcon = meta?.Icon ?? ArrowDown;
  const color = conn ? `var(${ASSOCIATION_COLOR_VAR[conn.type]})` : undefined;

  return (
    <div className="py-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span
          className={`flex shrink-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] ${
            conn ? "text-foreground" : "text-muted-foreground"
          }`}
          style={{ color }}
        >
          <BridgeIcon className="h-3.5 w-3.5" />
          {meta ? `${meta.label} ${conn?.targetTitle ?? ""}`.trim() : "deliberate jump"}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mx-auto mt-2 max-w-[560px] px-4 text-center">
        {onSaveAnnotation ? (
          <AnnotationEditor annotation={annotation} onSave={onSaveAnnotation} />
        ) : (
          annotation?.trim() && (
            <p className="text-[15px] italic leading-relaxed text-foreground/90">{annotation}</p>
          )
        )}
      </div>
    </div>
  );
}
