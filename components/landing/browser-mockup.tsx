'use client';

import React from 'react';
import {
  Undo,
  Redo,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Baseline,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Plus,
  Share2,
  Check,
  Route,
  ArrowUp,
  Waypoints,
  Share as GraphIcon,
  Lock,
} from 'lucide-react';
import { KnowledgeGraph } from '@/components/editor/knowledge-graph';
import { Mark } from '@/components/layout/logo';
import type { Item, Trail } from '@/app/editor/types';

const GRAPH_ITEMS: Record<string, Item> = {
  'why-slow-down': {
    id: 'why-slow-down',
    title: 'Why slow down',
    titleAlign: 'left',
    unfiled: false,
    content: null,
    linkedItemIds: ['morning-rituals', 'digital-minimalism'],
    associations: [
      { id: 'a1', type: 'REQUIRES', targetType: 'ITEM', targetId: 'morning-rituals', targetTitle: 'Morning rituals' },
      { id: 'a2', type: 'RELATED', targetType: 'ITEM', targetId: 'digital-minimalism', targetTitle: 'Digital minimalism' },
    ],
  },
  'morning-rituals': {
    id: 'morning-rituals',
    title: 'Morning rituals',
    titleAlign: 'left',
    unfiled: true,
    content: null,
    linkedItemIds: [],
    associations: [],
  },
  'digital-minimalism': {
    id: 'digital-minimalism',
    title: 'Digital minimalism',
    titleAlign: 'left',
    unfiled: true,
    content: null,
    linkedItemIds: [],
    associations: [],
  },
};

const GRAPH_TRAILS: Trail[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: '',
    itemIds: ['why-slow-down'],
    steps: [{ itemId: 'why-slow-down', annotation: null, associationId: null }],
    version: 1,
    forkedFrom: null,
  },
];

const TRAILS = [
  {
    title: 'Getting started',
    items: [
      { title: 'Why slow down', active: true },
      { title: 'Morning rituals', active: false },
    ],
  },
  {
    title: 'Advanced practices',
    items: [{ title: 'Digital minimalism', active: false }],
  },
];

const LOOSE_ITEMS = [
  { title: 'Why slow down', linked: false },
  { title: 'Morning rituals', linked: true },
  { title: 'Digital minimalism', linked: false },
];

const CONNECTIONS = [
  { type: 'REQUIRES', Icon: ArrowUp, title: 'Morning rituals' },
  { type: 'RELATED', Icon: Waypoints, title: 'Digital minimalism' },
];

export const BrowserMockup: React.FC = () => {
  return (
    <div className="w-full flex flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-elevation-2">
      <div className="h-9 flex items-center gap-2 px-4 shrink-0 bg-card border-b border-border">
        <span className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </span>
        <div className="mx-auto flex items-center gap-1.5 rounded-full bg-popover px-3 py-1 text-[11px] text-muted-foreground max-w-[60%] truncate">
          <Lock className="w-2.5 h-2.5 shrink-0" />
          tramo.app/why-slow-down
        </div>
      </div>
      <div className="relative aspect-[16/9] overflow-hidden [container-type:inline-size]">
      {/* Below md the middle column (both side panels are `hidden lg:flex` — shown together
          or not at all, since below lg there isn't enough height in this fixed-aspect card
          for a full sidebar) still doesn't fit a phone-width card, so instead of reflowing
          every row we render this at a fixed desktop-ish "design" width and scale the whole
          thing down to fit — `100cqw` is the outer card's own live width (container query
          unit), so the scale stays fluid across any phone width, no breakpoint steps. */}
      <div
        className="absolute top-1/2 left-1/2 flex h-[383px] w-[680px] overflow-hidden [transform:translate(-50%,-50%)_scale(calc(100cqw/680px))] md:static md:h-full md:w-full md:[transform:none]"
      >
        <div className="w-[184px] hidden lg:flex flex-col shrink-0 p-2.5 gap-2.5 overflow-hidden bg-card border-r border-border">
          <div className="flex items-center gap-2 pt-0.5">
            <Mark size={22} className="shrink-0" />
            <div className="flex flex-1 items-center gap-1.5 rounded-full bg-popover px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <Search className="w-3 h-3 shrink-0" />
              Buscar
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-medium text-muted-foreground">
              Trails
            </h3>
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-2">
            {TRAILS.map((trail) => (
              <div key={trail.title}>
                <div className="flex items-center gap-1.5 px-2 text-[13px] font-medium">
                  <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
                  {trail.title}
                </div>
                <ul className="mt-1 flex flex-col gap-0.5 pl-2.5">
                  {trail.items.map((item, i) => (
                    <li
                      key={item.title}
                      className={`flex items-center gap-2 rounded-full text-[13px] font-medium truncate px-2.5 py-[5px] ${
                        item.active
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span className="w-3 shrink-0 text-[10px] tabular-nums">{i + 1}</span>
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-1 flex items-center justify-between px-2 border-t border-border pt-2.5">
            <h3 className="text-[11px] font-medium text-muted-foreground">
              Items
            </h3>
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <ul className="flex flex-col gap-0.5">
            {LOOSE_ITEMS.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-2 rounded-full text-[13px] font-medium truncate px-2.5 py-[5px] text-muted-foreground"
              >
                <span className="w-[7px] h-[7px] shrink-0 rounded-full box-border border-[1.5px] border-input" />
                <span className="truncate flex-1">{item.title}</span>
                {item.linked && <LinkIcon className="w-2.5 h-2.5 shrink-0 text-primary" />}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-1 flex-col min-w-0">
      <div className="h-12 flex items-center gap-3 px-5 shrink-0 bg-card border-b border-border">
        <span className="lg:hidden font-display font-semibold text-[14px]">
          Tramo<span className="text-primary"> ●</span>
        </span>
        <span className="text-[13px] font-medium">Why slow down</span>
        <div className="flex-1" />
        <span className="text-[11px] hidden md:inline text-muted-foreground">
          142 words · 812 characters
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium shrink-0">
          <Route className="w-3 h-3" />
          Trail
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[12px] font-medium text-secondary-foreground">
          <Share2 className="w-3 h-3" />
          Share
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
          <Check className="w-3 h-3" />
          Saved
        </span>
        <span className="w-[26px] h-[26px] shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium bg-primary text-primary-foreground">
          A
        </span>
      </div>

      <div className="flex flex-1 min-h-0 gap-3 p-3">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-2xl bg-popover">
          <div className="flex flex-wrap items-center gap-2.5 px-4 py-1.5 shrink-0 overflow-hidden border-b border-border text-muted-foreground">
            <Undo className="w-3.5 h-3.5" />
            <Redo className="w-3.5 h-3.5" />
            <Search className="w-3.5 h-3.5" />
            <span className="h-3.5 w-px shrink-0 bg-border" />
            <span className="flex items-center gap-1 text-[11px] font-medium shrink-0">
              Arial
              <ChevronDown className="w-3 h-3" />
            </span>
            <span className="flex items-center gap-0.5 text-[11px] font-medium shrink-0">
              <ChevronDown className="w-3 h-3" />
              15
              <ChevronUp className="w-3 h-3" />
            </span>
            <span className="h-3.5 w-px shrink-0 bg-border" />
            <Bold className="w-3.5 h-3.5" />
            <Italic className="w-3.5 h-3.5" />
            <Underline className="w-3.5 h-3.5" />
            <Strikethrough className="w-3.5 h-3.5" />
            <Code className="w-3.5 h-3.5" />
            <span className="h-3.5 w-px shrink-0 bg-border" />
            <Baseline className="w-3.5 h-3.5" />
            <LinkIcon className="w-3.5 h-3.5" />
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="h-3.5 w-px shrink-0 bg-border hidden md:block" />
            <List className="w-3.5 h-3.5" />
            <ListOrdered className="w-3.5 h-3.5" />
            <CheckSquare className="w-3.5 h-3.5" />
            <Quote className="w-3.5 h-3.5" />
            <Minus className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 overflow-hidden p-6">
            <h1 className="font-display font-medium text-xl mb-2.5">
              Why slow down
            </h1>
            <p className="text-[13px] leading-6 mb-3 text-muted-foreground">
              Slow living isn&apos;t about doing less — it&apos;s about giving each thing the attention
              it deserves. This idea links to{' '}
              <span className="text-primary font-medium">
                Morning rituals
              </span>{' '}
              and{' '}
              <span className="text-primary font-medium">
                Digital minimalism
              </span>
              .
            </p>
            <ul className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
              <li>— Notice when you&apos;re rushing out of habit, not necessity</li>
              <li>— Pick one ritual to protect every morning</li>
              <li>— Let unfinished things stay unfinished sometimes</li>
            </ul>
          </div>
        </div>

        <div className="w-[204px] hidden lg:flex flex-col shrink-0 p-4 gap-2 overflow-hidden rounded-2xl bg-card">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-[11px] font-medium text-muted-foreground truncate">
              Connections from &quot;Why slow down&quot;
            </h3>
            <Plus className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            {CONNECTIONS.map(({ type, Icon, title }) => (
              <div
                key={title}
                className="flex flex-col gap-1 min-w-0 rounded-sm border border-border bg-popover py-[7px] px-2.5"
              >
                <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.08em] text-primary">
                  <Icon className="w-2.5 h-2.5" />
                  {type}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-medium flex-1">{title}</span>
                  <span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-secondary-foreground">
                    item
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex items-center justify-between border-t border-border pt-2.5">
            <h3 className="text-[11px] font-medium text-muted-foreground">
              Graph preview
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
              <GraphIcon className="w-3 h-3" />
              Open
            </span>
          </div>
          {/* The real @xyflow/react graph component, fed fake data — not a hand-drawn
              approximation, so node/edge styling always matches the actual editor. */}
          <div className="relative h-[210px] shrink-0 rounded-xl bg-popover">
            <KnowledgeGraph
              trails={GRAPH_TRAILS}
              items={GRAPH_ITEMS}
              activeTrailId="getting-started"
              onSelectItem={() => {}}
              variant="preview"
            />
          </div>
        </div>
      </div>
        </div>
      </div>
      </div>
    </div>
  );
};
