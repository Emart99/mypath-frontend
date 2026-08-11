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
        className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add annotation
      </button>
    );
  }
  return (
    <p
      onClick={() => setEditing(true)}
      className="mt-1 cursor-text whitespace-pre-wrap text-[15px] italic leading-relaxed text-foreground/90"
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
    <div className="flex gap-3 py-4 pl-1">
      <div className="flex flex-col items-center">
        <span className="h-3 w-px bg-border" style={{ backgroundColor: color }} />
        <span
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border text-foreground"
          style={{ borderColor: color, color }}
        >
          <BridgeIcon className="h-3.5 w-3.5" />
        </span>
        <span className="mt-1 h-3 w-px bg-border" style={{ backgroundColor: color }} />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <p
          className={`text-[11px] font-medium uppercase tracking-[0.1em] ${conn ? "text-foreground" : "text-muted-foreground"}`}
          style={{ color }}
        >
          {meta ? `${meta.label} ${conn?.targetTitle ?? ""}`.trim() : "deliberate jump"}
        </p>
        {onSaveAnnotation ? (
          <AnnotationEditor annotation={annotation} onSave={onSaveAnnotation} />
        ) : (
          annotation?.trim() && (
            <p className="mt-1 text-[15px] italic leading-relaxed text-foreground/90">{annotation}</p>
          )
        )}
      </div>
    </div>
  );
}
