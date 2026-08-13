"use client"
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister, $getNearestNodeOfType } from '@lexical/utils';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  $createParagraphNode,
  ElementNode,
  LexicalCommand,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import {
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import {
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Baseline,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List as ListIcon,
  ListOrdered,
  CheckSquare,
  Code,
  SquareCode,
  Minus,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Search,
  Sigma,
  Radical,
  Music,
  Table as TableIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { insertImageWithUpload } from './ImagesPlugin';
import { OPEN_LINK_EDITOR_COMMAND } from './FloatingLinkEditorPlugin';
import { OPEN_FIND_REPLACE_COMMAND } from './FindReplacePlugin';
import { INSERT_EQUATION_COMMAND } from './EquationsPlugin';
import { INSERT_MUSIC_COMMAND } from './MusicPlugin';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';

const COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'var(--ed-red)', label: 'Red' },
  { value: 'var(--ed-orange)', label: 'Orange' },
  { value: 'var(--ed-green)', label: 'Green' },
  { value: 'var(--ed-blue)', label: 'Blue' },
  { value: 'var(--ed-purple)', label: 'Purple' },
  { value: 'var(--ed-gray)', label: 'Gray' },
];

type ElementFormat = 'left' | 'center' | 'right' | 'justify';

const ALIGN_OPTIONS: { value: ElementFormat; label: string; Icon: typeof AlignLeft }[] = [
  { value: 'left', label: 'Align left', Icon: AlignLeft },
  { value: 'center', label: 'Align center', Icon: AlignCenter },
  { value: 'right', label: 'Align right', Icon: AlignRight },
  { value: 'justify', label: 'Justify', Icon: AlignJustify },
];

type HeadingOption = 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'code';

const HEADING_OPTIONS: { value: HeadingOption; label: string; Icon: typeof Type }[] = [
  { value: 'paragraph', label: 'Normal', Icon: Type },
  { value: 'h1', label: 'Heading 1', Icon: Heading1 },
  { value: 'h2', label: 'Heading 2', Icon: Heading2 },
  { value: 'h3', label: 'Heading 3', Icon: Heading3 },
  { value: 'quote', label: 'Quote', Icon: Quote },
  { value: 'code', label: 'Code Block', Icon: SquareCode },
];

const FONT_FAMILY_OPTIONS: Array<[string, string]> = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const TEXT_FORMATS = [
  { format: 'bold', label: 'Format Bold', tooltip: 'Bold', Icon: Bold },
  { format: 'italic', label: 'Format Italics', tooltip: 'Italic', Icon: Italic },
  { format: 'underline', label: 'Format Underline', tooltip: 'Underline', Icon: Underline },
  { format: 'strikethrough', label: 'Format Strikethrough', tooltip: 'Strikethrough', Icon: Strikethrough },
] as const;

const INLINE_CODE_FORMAT = { format: 'code', label: 'Format Code', tooltip: 'Inline code', Icon: Code } as const;

const LIST_OPTIONS = [
  { type: 'bullet', label: 'Bullet List', tooltip: 'Bulleted list', Icon: ListIcon, command: INSERT_UNORDERED_LIST_COMMAND },
  { type: 'number', label: 'Numbered List', tooltip: 'Numbered list', Icon: ListOrdered, command: INSERT_ORDERED_LIST_COMMAND },
  { type: 'check', label: 'Check List', tooltip: 'Check list', Icon: CheckSquare, command: INSERT_CHECK_LIST_COMMAND },
] as const;

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;

function Divider() {
  return <div className="divider" />;
}

function ToolbarButton({
  label,
  tooltip,
  Icon,
  onClick,
  active,
  disabled,
  spaced = true,
  size = 18,
}: {
  label: string;
  tooltip: string;
  Icon: typeof Bold;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  spaced?: boolean;
  size?: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
          disabled={disabled}
          className={`toolbar-item${spaced ? ' spaced' : ''}${active ? ' active' : ''}`}
          aria-pressed={active}
          aria-label={label}>
          <Icon size={size} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ToolbarMenuButton({
  label,
  tooltip,
  className,
  children,
}: {
  label: string;
  tooltip: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <button className={className} aria-label={label}>
            {children}
          </button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

const TABLE_PICKER_ROWS = 8;
const TABLE_PICKER_COLUMNS = 8;

function TableSizePicker({ onPick }: { onPick: (rows: number, columns: number) => void }) {
  const [hovered, setHovered] = useState({ rows: 0, columns: 0 });
  const cells = Array.from({ length: TABLE_PICKER_ROWS * TABLE_PICKER_COLUMNS }, (_, index) => ({
    rows: Math.floor(index / TABLE_PICKER_COLUMNS) + 1,
    columns: (index % TABLE_PICKER_COLUMNS) + 1,
  }));

  return (
    <div className="toolbar-table-picker">
      <div
        className="toolbar-table-grid"
        onMouseLeave={() => setHovered({ rows: 0, columns: 0 })}
        style={{ gridTemplateColumns: `repeat(${TABLE_PICKER_COLUMNS}, 1fr)` }}
      >
        {cells.map(({ rows, columns }) => (
          <button
            key={`${rows}x${columns}`}
            type="button"
            aria-label={`Insertar tabla de ${rows} por ${columns}`}
            className={
              rows <= hovered.rows && columns <= hovered.columns
                ? 'toolbar-table-cell filled'
                : 'toolbar-table-cell'
            }
            onMouseEnter={() => setHovered({ rows, columns })}
            onFocus={() => setHovered({ rows, columns })}
            onClick={() => onPick(rows, columns)}
          />
        ))}
      </div>
      <span className="toolbar-table-size" aria-live="polite">
        {hovered.rows > 0 ? `${hovered.rows} × ${hovered.columns}` : 'Elegí el tamaño'}
      </span>
    </div>
  );
}

export default function ToolbarPlugin({
  projectId,
  titleFocused,
  titleAlign,
  onSetTitleAlign,
}: {
  projectId?: string;
  titleFocused?: boolean;
  titleAlign?: 'left' | 'center' | 'right';
  onSetTitleAlign?: (align: 'left' | 'center' | 'right') => void;
} = {}) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isLink, setIsLink] = useState(false);

  const [formats, setFormats] = useState<Set<string>>(new Set());
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('15');
  const [textColor, setTextColor] = useState('');
  const [elementFormat, setElementFormat] = useState<ElementFormat>('left');
  const [tableMenuOpen, setTableMenuOpen] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
        if ($isElementNode(element)) {
          const format = element.getFormatType();
          setElementFormat(format === 'center' || format === 'right' || format === 'justify' ? format : 'left');
        }
      }

      setFormats(
        new Set(
          [...TEXT_FORMATS, INLINE_CODE_FORMAT]
            .filter(({ format }) => selection.hasFormat(format))
            .map(({ format }) => format),
        ),
      );

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      setTextColor($getSelectionStyleValueForProperty(selection, 'color', ''));
      setFontFamily($getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'));
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', `${MIN_FONT_SIZE + 7}px`).replace('px', ''),
      );
    }
  }, [editor]);

  const applyStyleText = useCallback(
    (styles: Record<string, string | null>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor],
  );

  const onFontFamilySelect = useCallback(
    (value: string) => {
      setFontFamily(value);
      applyStyleText({ 'font-family': value });
    },
    [applyStyleText],
  );

  const onFontSizeCommit = useCallback(
    (value: string) => {
      const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Number(value) || MIN_FONT_SIZE));
      setFontSize(String(clamped));
      applyStyleText({ 'font-size': `${clamped}px` });
    },
    [applyStyleText],
  );

  const updateFontSizeByStep = useCallback(
    (step: number) => {
      const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, (Number(fontSize) || MIN_FONT_SIZE) + step));
      setFontSize(String(next));
      applyStyleText({ 'font-size': `${next}px` });
    },
    [applyStyleText, fontSize],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(OPEN_LINK_EDITOR_COMMAND, undefined);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            insertLink();
            return true;
          }
          if ((event.key === 'e' || event.key === 'E') && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            editor.dispatchCommand(INSERT_EQUATION_COMMAND, {
              equation: '',
              inline: !event.shiftKey,
            });
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateToolbar, insertLink]);

  const setBlock = (create: () => ElementNode) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, create);
      }
    });
  };

  const formatParagraph = () => {
    if (blockType !== 'paragraph') setBlock($createParagraphNode);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    setBlock(blockType === headingSize ? $createParagraphNode : () => $createHeadingNode(headingSize));
  };

  const toggleList = (type: string, command: LexicalCommand<void>) => {
    if (blockType !== type) {
      editor.dispatchCommand(command, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') setBlock($createQuoteNode);
  };

  const formatCode = () => {
    setBlock(blockType === 'code' ? $createParagraphNode : () => $createCodeNode('plain'));
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    insertImageWithUpload(editor, file, projectId);
  };


  const activeAlign = titleFocused ? titleAlign ?? 'left' : elementFormat;
  const ActiveHeadingIcon = HEADING_OPTIONS.find((option) => option.value === blockType)?.Icon ?? Type;
  const ActiveAlignIcon = ALIGN_OPTIONS.find((option) => option.value === activeAlign)?.Icon ?? AlignLeft;

  return (
    <div className="toolbar" ref={toolbarRef}>
      <ToolbarButton
        label="Undo"
        tooltip="Undo"
        Icon={Undo}
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      />
      <ToolbarButton
        label="Redo"
        tooltip="Redo"
        Icon={Redo}
        spaced={false}
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      />
      <ToolbarButton
        label="Find and replace"
        tooltip="Find and replace"
        Icon={Search}
        onClick={() => editor.dispatchCommand(OPEN_FIND_REPLACE_COMMAND, undefined)}
      />
      <Divider />
      <select
        className="toolbar-item font-family-select"
        value={fontFamily}
        onChange={(e) => onFontFamilySelect(e.target.value)}
        aria-label="Font Family"
        style={{ fontFamily }}
      >
        {FONT_FAMILY_OPTIONS.map(([value, label]) => (
          <option key={value} value={value} style={{ fontFamily: value }}>
            {label}
          </option>
        ))}
      </select>
      <Divider />
      <div className="font-size-control">
        <ToolbarButton
          label="Decrease font size"
          tooltip="Decrease font size"
          Icon={ChevronDown}
          size={14}
          spaced={false}
          onClick={() => updateFontSizeByStep(-1)}
        />
        <input
          type="number"
          className="font-size-input"
          value={fontSize}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          onChange={(e) => setFontSize(e.target.value)}
          onBlur={(e) => onFontSizeCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onFontSizeCommit((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label="Font Size"
        />
        <ToolbarButton
          label="Increase font size"
          tooltip="Increase font size"
          Icon={ChevronUp}
          size={14}
          spaced={false}
          onClick={() => updateFontSizeByStep(1)}
        />
      </div>
      <DropdownMenu>
        <ToolbarMenuButton label="Text color" tooltip="Text color" className="toolbar-item spaced">
          <Baseline size={18} style={textColor ? { color: textColor } : undefined} />
        </ToolbarMenuButton>
        <DropdownMenuContent align="start">
          {COLOR_OPTIONS.map(({ value, label }) => (
            <DropdownMenuItem key={label} onSelect={() => applyStyleText({ color: value || null })}>
              <span
                className="toolbar-color-swatch"
                style={{ background: value || 'var(--foreground)' }}
              />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />
      <DropdownMenu>
        <ToolbarMenuButton label="Text style" tooltip="Text style" className="toolbar-item align-dropdown-trigger spaced">
          <ActiveHeadingIcon size={18} />
          <ChevronDown size={12} />
        </ToolbarMenuButton>
        <DropdownMenuContent align="start">
          {HEADING_OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuItem
              key={value}
              onSelect={() =>
                value === 'paragraph'
                  ? formatParagraph()
                  : value === 'quote'
                    ? formatQuote()
                    : value === 'code'
                      ? formatCode()
                      : formatHeading(value)
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <ToolbarMenuButton label="Align text" tooltip="Align text" className="toolbar-item align-dropdown-trigger spaced">
          <ActiveAlignIcon size={18} />
          <ChevronDown size={12} />
        </ToolbarMenuButton>
        <DropdownMenuContent align="start">
          {(titleFocused ? ALIGN_OPTIONS.filter((option) => option.value !== 'justify') : ALIGN_OPTIONS).map(({ value, label, Icon }) => (
            <DropdownMenuItem
              key={value}
              onSelect={() =>
                titleFocused
                  ? onSetTitleAlign?.(value as 'left' | 'center' | 'right')
                  : editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value)
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />
      {TEXT_FORMATS.map(({ format, label, tooltip, Icon }) => (
        <ToolbarButton
          key={format}
          label={label}
          tooltip={tooltip}
          Icon={Icon}
          active={formats.has(format)}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
        />
      ))}
      <Divider />
      <ToolbarButton
        label="Insert Link"
        tooltip="Link"
        Icon={LinkIcon}
        active={isLink}
        disabled={blockType === 'code'}
        onClick={insertLink}
      />
      <ToolbarButton
        label="Insert Image"
        tooltip="Insert image"
        Icon={ImageIcon}
        disabled={blockType === 'code'}
        onClick={() => fileInputRef.current?.click()}
      />
      <Divider />
      <ToolbarButton
        label="Insert Inline Equation"
        tooltip="Inline equation (⌘E)"
        Icon={Radical}
        disabled={blockType === 'code'}
        onClick={() => editor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation: '', inline: true })}
      />
      <ToolbarButton
        label="Insert Equation"
        tooltip="Insert equation (⌘⇧E)"
        Icon={Sigma}
        disabled={blockType === 'code'}
        onClick={() => editor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation: '', inline: false })}
      />
      <ToolbarButton
        label="Insert Music"
        tooltip="Insert music score"
        Icon={Music}
        disabled={blockType === 'code'}
        onClick={() => editor.dispatchCommand(INSERT_MUSIC_COMMAND, undefined)}
      />
      <DropdownMenu open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
        <ToolbarMenuButton label="Insert Table" tooltip="Insert table" className="toolbar-item spaced">
          <TableIcon size={18} />
        </ToolbarMenuButton>
        <DropdownMenuContent align="start">
          <TableSizePicker
            onPick={(rows, columns) => {
              setTableMenuOpen(false);
              editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                rows: String(rows),
                columns: String(columns),
                includeHeaders: { rows: true, columns: false },
              });
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <Divider />
      <ToolbarButton
        label={INLINE_CODE_FORMAT.label}
        tooltip={INLINE_CODE_FORMAT.tooltip}
        Icon={INLINE_CODE_FORMAT.Icon}
        active={formats.has(INLINE_CODE_FORMAT.format)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, INLINE_CODE_FORMAT.format)}
      />
      <ToolbarButton
        label="Code Block"
        tooltip="Code block"
        Icon={SquareCode}
        active={blockType === 'code'}
        onClick={formatCode}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      <Divider />
      {LIST_OPTIONS.map(({ type, label, tooltip, Icon, command }) => (
        <ToolbarButton
          key={type}
          label={label}
          tooltip={tooltip}
          Icon={Icon}
          active={blockType === type}
          onClick={() => toggleList(type, command)}
        />
      ))}
      <ToolbarButton
        label="Quote"
        tooltip="Quote"
        Icon={Quote}
        active={blockType === 'quote'}
        onClick={formatQuote}
      />
      <ToolbarButton
        label="Insert Divider"
        tooltip="Divider"
        Icon={Minus}
        disabled={blockType === 'code'}
        onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
      />
    </div>
  );
}
