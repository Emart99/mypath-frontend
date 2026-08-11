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
import { AnnotationBanner } from '@/components/editor/annotation-banner';
import { Trail, Item, TitleAlign, AssociationType, AssociationTargetType } from '../../types';
import type { IncomingStep } from '../hooks/useProjectEditorState';

interface WriteViewProps {
  projectId: string;
  item: Item;
  items: Record<string, Item>;
  trails: Trail[];
  activeTrailId: string | undefined;
  incomingStep: IncomingStep | null;
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
  incomingStep,
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

  useEffect(() => {
    const el = editorInnerRef.current;
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.scrollTop = 0;
    }));
  }, [item.id]);

  return (
    <>
      <div data-tour="write-panel" className="flex min-w-0 flex-1 flex-col overflow-hidden ">
        <LexicalComposer key={item.id} initialConfig={editorConfig}>
          <div className="editor-container flex flex-1 min-h-0 flex-col">
            <ToolbarPlugin
              projectId={projectId}
              titleFocused={activeAlignTarget === 'title'}
              titleAlign={item.titleAlign}
              onSetTitleAlign={(align) => onSetTitleAlign(item.id, align)}
            />
            <hr/>
            <div className="editor-inner" ref={editorInnerRef}>
              <div className="editor-content-column" ref={setBlockAnchor}>
                {incomingStep && (
                  <div className="px-7 pt-6">
                    <AnnotationBanner
                      key={`${incomingStep.trailId}-${incomingStep.itemId}`}
                      annotation={incomingStep.annotation}
                      associationType={incomingStep.associationType}
                      connectionTitle={incomingStep.connectionTitle}
                      trailTitle={incomingStep.trailTitle}
                      onSave={(text) => onUpdateAnnotation(incomingStep.trailId, incomingStep.itemId, text)}
                    />
                  </div>
                )}
                <div className="pt-9 pl-7">
                  <input
                    key={`${item.id}-${item.title}`}
                    defaultValue={item.title}
                    onFocus={() => setActiveAlignTarget('title')}
                    onBlur={(e) => onCommitTitle(item.id, item.title, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="Untitled"
                    style={{ textAlign: item.titleAlign }}
                    className="w-full border-0 bg-transparent font-display text-[28px] font-medium text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
                <div className="relative grid flex-1 min-h-0">
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
                <HistoryPlugin />
                <AutoFocusPlugin />
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
