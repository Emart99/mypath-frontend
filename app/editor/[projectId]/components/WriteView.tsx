import { useEffect, useRef, useState } from 'react';
import type { EditorState } from 'lexical';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EDITOR_TRANSFORMERS } from '../../plugins/markdownTransformers';

import ToolbarPlugin from '../../plugins/ToolbarPlugin';
import UpdateContentPlugin from '../../plugins/UpdateContentPlugin';
import ImagesPlugin from '../../plugins/ImagesPlugin';
import EquationsPlugin from '../../plugins/EquationsPlugin';
import { CodeBlockGuardPlugin } from '../../plugins/CodeBlockGuardPlugin';
import ListTabPlugin from '../../plugins/ListTabPlugin';
import PastePlugin from '../../plugins/PastePlugin';
import CodeHighlightPlugin from '../../plugins/CodeHighlightPlugin';
import TrailingParagraphPlugin from '../../plugins/TrailingParagraphPlugin';
import SlashMenuPlugin from '../../plugins/SlashMenuPlugin';
import FloatingLinkEditorPlugin from '../../plugins/FloatingLinkEditorPlugin';
import FindReplacePlugin from '../../plugins/FindReplacePlugin';
import DraggableBlockPlugin from '../../plugins/DraggableBlockPlugin';
import ItemMentionPlugin from '../../plugins/ItemMentionPlugin';
import WikiLinkPlugin from '../../plugins/WikiLinkPlugin';
import ItemLinkClickPlugin from '../../plugins/ItemLinkClickPlugin';
import { editorConfig, placeholder } from '../../lexical-config';
import { ConnectionsPanel } from '@/components/editor/connections-panel';
import { TrailConnector } from '@/components/editor/trail-connector';
import { LexicalReadOnly } from '@/components/project/lexical-read-only';
import { bridgeTie } from '../../associations';
import { Trail, Item, TitleAlign, Association, AssociationType, AssociationTargetType } from '../../types';

interface WriteViewProps {
  projectId: string;
  item: Item;
  items: Record<string, Item>;
  trails: Trail[];
  activeTrailId: string | undefined;
  trail: Trail | undefined;
  associationById: Map<string, Association>;
  contentReady: boolean;
  onUpdateAnnotation: (trailId: string, itemId: string, annotation: string) => void;
  onCommitTitle: (itemId: string, currentTitle: string, nextValue: string) => void;
  onSetTitleAlign: (itemId: string, titleAlign: TitleAlign) => void;
  onSelectItem: (item: Item) => void;
  onLinkItems: (itemId: string, otherItemId: string) => void;
  onTie: (itemId: string, targetId: string, targetType: AssociationTargetType, type: AssociationType) => void;
  onUntie: (itemId: string, targetId: string, targetType: AssociationTargetType) => void;
  onOpenGraph: () => void;
  onChange: (editorState: EditorState) => void;
  onContentApplied: (itemId: string) => void;
  connectionsPanelOpen: boolean;
  onToggleConnectionsPanelOpen: () => void;
}

export function WriteView({
  projectId,
  item,
  items,
  trails,
  activeTrailId,
  trail,
  associationById,
  contentReady,
  onUpdateAnnotation,
  onCommitTitle,
  onSetTitleAlign,
  onSelectItem,
  onLinkItems,
  onTie,
  onUntie,
  onOpenGraph,
  onChange,
  onContentApplied,
  connectionsPanelOpen,
  onToggleConnectionsPanelOpen,
}: WriteViewProps) {
  const [activeAlignTarget, setActiveAlignTarget] = useState<'title' | 'body'>('body');
  const [blockAnchor, setBlockAnchor] = useState<HTMLDivElement | null>(null);
  const editorInnerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef(new Map<string, HTMLDivElement>());
  const preserveScrollRef = useRef<number | null>(null);

  const steps = trail?.itemIds.includes(item.id)
    ? trail.steps
    : [{ itemId: item.id, annotation: null, associationId: null }];
  const stacked = steps.length > 1;

  useEffect(() => {
    const el = editorInnerRef.current;
    if (!el) return;
    const preserved = preserveScrollRef.current;
    preserveScrollRef.current = null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (preserved != null) {
        el.scrollTop = preserved;
        return;
      }
      const slot = slotRefs.current.get(item.id);
      if (slot && stacked) slot.scrollIntoView({ block: 'start' });
      else el.scrollTop = 0;
    }));
  }, [item.id, stacked, contentReady]);

  const activateItem = (target: Item) => {
    if (target.id === item.id) return;
    const el = editorInnerRef.current;
    if (el) preserveScrollRef.current = el.scrollTop;
    onSelectItem(target);
  };

  return (
    <>
      <div data-tour="write-panel" className="flex min-w-0 flex-1 flex-col overflow-hidden ">
        <LexicalComposer initialConfig={editorConfig}>
          <div className="editor-container flex flex-1 min-h-0 flex-col">
            <ToolbarPlugin
              projectId={projectId}
              titleFocused={activeAlignTarget === 'title'}
              titleAlign={item.titleAlign}
              onSetTitleAlign={(align) => onSetTitleAlign(item.id, align)}
            />
            <hr/>
            <div className="editor-inner" ref={editorInnerRef}>
              <div className={`editor-content-column${stacked ? ' pb-16' : ''}`} ref={setBlockAnchor}>
                {steps.map((step, i) => {
                  const stepItem = items[step.itemId];
                  if (!stepItem) return null;
                  const isActive = step.itemId === item.id;
                  const conn = step.associationId
                    ? associationById.get(step.associationId) ?? null
                    : i > 0 && trail ? bridgeTie(items, trail.steps[i - 1].itemId, step.itemId) : null;

                  return (
                    <div
                      key={step.itemId}
                      ref={(el) => {
                        if (el) slotRefs.current.set(step.itemId, el);
                        else slotRefs.current.delete(step.itemId);
                      }}
                    >
                      {i > 0 && trail && (
                        <div className="trail-divider mt-4 border-y border-border pl-7">
                          <TrailConnector
                            conn={conn}
                            annotation={step.annotation}
                            onSaveAnnotation={(text) => onUpdateAnnotation(trail.id, step.itemId, text)}
                          />
                        </div>
                      )}
                      <div
                        onClick={(e) => {
                          if (isActive) return;
                          if ((e.target as HTMLElement).closest('a')) return;
                          activateItem(stepItem);
                        }}
                        className={stacked && !isActive ? 'group cursor-pointer' : undefined}
                      >
                        {stacked && (
                          <div
                            className={`flex items-center gap-2 pl-7 pt-6 text-[11px] font-medium uppercase tracking-[0.1em] ${
                              isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                            }`}
                          >
                            <span
                              className={
                                isActive
                                  ? 'h-[7px] w-[7px] shrink-0 rounded-full bg-primary'
                                  : 'h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-muted-foreground box-border group-hover:border-primary'
                              }
                            />
                            Step {i + 1}
                            {!isActive && (
                              <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                                — click to edit
                              </span>
                            )}
                          </div>
                        )}
                      <div className={stacked ? 'pl-7 pt-1' : 'pt-9 pl-7'}>
                        <input
                          key={`${stepItem.id}-${stepItem.title}`}
                          defaultValue={stepItem.title}
                          readOnly={!isActive}
                          onFocus={() => setActiveAlignTarget('title')}
                          onBlur={(e) => { if (isActive) onCommitTitle(stepItem.id, stepItem.title, e.target.value); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          placeholder="Untitled"
                          style={{ textAlign: stepItem.titleAlign }}
                          className="w-full border-0 bg-transparent font-display text-[28px] font-medium text-foreground outline-none placeholder:text-muted-foreground/40"
                        />
                      </div>
                      {isActive ? (
                        <div className={stacked ? 'relative' : 'relative grid flex-1 min-h-0'}>
                          <RichTextPlugin
                            contentEditable={
                              <ContentEditable
                                className="editor-input"
                                aria-placeholder={placeholder}
                                onFocus={() => setActiveAlignTarget('body')}
                                placeholder={
                                  <div className="editor-placeholder">{placeholder}</div>
                                }
                              />
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                          />
                        </div>
                      ) : (
                        <LexicalReadOnly content={stepItem.content ?? ''} />
                      )}
                      </div>
                    </div>
                  );
                })}
                <HistoryPlugin />
                <AutoFocusPlugin key={item.id} />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin />
                <ItemLinkClickPlugin onNavigate={(itemId) => {
                  const target = items[itemId];
                  if (target) onSelectItem(target);
                }} />
                <ClickableLinkPlugin newTab />
                <ImagesPlugin projectId={projectId} />
                <EquationsPlugin />
                <CodeBlockGuardPlugin />
                <PastePlugin />
                <CodeHighlightPlugin />
                <TrailingParagraphPlugin />
                <ListTabPlugin />
                <TabIndentationPlugin />
                <HorizontalRulePlugin />
                <SlashMenuPlugin projectId={projectId} />
                <FloatingLinkEditorPlugin />
                <FindReplacePlugin />
                {blockAnchor && <DraggableBlockPlugin anchorElem={blockAnchor} />}
                <ItemMentionPlugin
                  items={items}
                  currentItemId={item.id}
                  onLinkItem={onLinkItems}
                />
                <WikiLinkPlugin
                  items={items}
                  currentItemId={item.id}
                  onLinkItem={onLinkItems}
                />
                <MarkdownShortcutPlugin transformers={EDITOR_TRANSFORMERS} />

                <UpdateContentPlugin content={item.content} itemId={item.id} onContentApplied={onContentApplied} />
                <OnChangePlugin onChange={onChange} ignoreSelectionChange />
              </div>
            </div>
          </div>
        </LexicalComposer>
      </div>
      <ConnectionsPanel
        item={item}
        items={items}
        trails={trails}
        activeTrailId={activeTrailId}
        onSelectItem={onSelectItem}
        onTie={onTie}
        onUntie={onUntie}
        onOpenGraph={onOpenGraph}
        open={connectionsPanelOpen}
        onToggleOpen={onToggleConnectionsPanelOpen}
      />
    </>
  );
}
