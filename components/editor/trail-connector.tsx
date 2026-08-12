"use client"

import { useState } from "react"
import { ArrowDown, Plus } from "lucide-react"

import { ASSOCIATION_META, ASSOCIATION_COLOR_VAR, type BridgeTie } from "@/app/editor/associations"

interface TrailConnectorProps {
  ties: BridgeTie[];
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

export function TrailConnector({ ties, annotation, onSaveAnnotation }: TrailConnectorProps) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.1em]">
          {ties.length === 0 ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ArrowDown className="h-3.5 w-3.5" />
              deliberate jump
            </span>
          ) : (
            ties.map(({ association, forward }, index) => {
              const meta = ASSOCIATION_META[association.type];
              const BridgeIcon = meta.Icon;
              const color = `var(${ASSOCIATION_COLOR_VAR[association.type]})`;
              return (
                <span key={association.id} className="flex items-center gap-2">
                  {index > 0 && <span className="text-muted-foreground">·</span>}
                  <span className="flex items-center gap-1.5" style={{ color }}>
                    <BridgeIcon className={`h-3.5 w-3.5 ${forward ? "" : "rotate-180"}`} />
                    {forward ? `${meta.label} ${association.targetTitle}`.trim() : `${meta.label} back`}
                  </span>
                </span>
              );
            })
          )}
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
