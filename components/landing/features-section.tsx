import React from 'react';
import {
  Share2,
  Check,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Link,
  List,
  Quote,
  Plus,
  ArrowUp,
  Waypoints,
  Star,
  Eye,
  ChevronUp,
  MessageCircle,
  Feather,
  Lock,
} from 'lucide-react';
import { FadeUp } from '@/components/landing/landing-motion';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="product" className="pt-16 pb-[84px]">
      <div className="mb-4 text-sm font-medium text-primary">What Tramo does</div>
      <h2 className="mb-3.5 max-w-[20ch] font-display text-[40px] font-medium leading-[1.1] tracking-[-.02em] text-balance">
        Everything you write stays connected.
      </h2>
      <p className="mb-10 max-w-[60ch] text-[17px] leading-[1.6] text-muted-foreground text-pretty">
        From the first note to the day you publish — every screen keeps your ideas linked, walkable,
        and worth sharing.
      </p>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <FadeUp className="md:col-span-2">
          <div className="grid grid-cols-1 overflow-hidden rounded-[28px] bg-card md:grid-cols-[minmax(280px,360px)_1fr]">
            <div className="flex flex-col justify-center px-10 py-12">
              <div className="mb-3.5 text-xs font-semibold uppercase tracking-[.08em] text-[var(--ed-blue)]">
                The editor
              </div>
              <h3 className="mb-3 font-display text-[28px] font-medium leading-[1.15] tracking-[-.01em]">
                Ideas, linked as you write
              </h3>
              <p className="max-w-[46ch] text-[15.5px] leading-[1.65] text-muted-foreground text-pretty">
                Type{' '}
                <span className="rounded-[5px] bg-secondary px-1.5 py-px font-mono text-[13px] text-secondary-foreground">
                  @
                </span>{' '}
                to connect any idea to another. Links stay live wherever you read them, and the
                connections panel updates as you go — no manual outlining.
              </p>
            </div>
            <div className="flex items-center py-9 px-9 min-w-0" style={{ background: 'var(--ed-blue)' }}>
              <div className="w-full overflow-hidden rounded-[20px] border border-border bg-background shadow-elevation-2">
                <div className="flex h-[46px] items-center gap-2.5 overflow-hidden border-b border-border bg-card px-[18px]">
                  <span className="whitespace-nowrap text-[13px] font-medium">Why slow down</span>
                  <span className="flex-1" />
                  <span className="flex items-center gap-[5px] whitespace-nowrap text-[11px] font-medium">
                    <Share2 className="h-[13px] w-[13px]" />
                    Trail
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary px-[11px] py-1 text-xs font-medium text-secondary-foreground">
                    <Share2 className="h-3 w-3" />
                    Share
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                    <Check className="h-3 w-3" strokeWidth={2.4} />
                    Saved
                  </span>
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                    A
                  </span>
                </div>
                <div className="flex gap-3 p-3">
                  <div className="min-w-0 flex-1 overflow-hidden rounded-[14px] bg-popover">
                    <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-muted-foreground">
                      <Undo2 className="h-3.5 w-3.5" />
                      <Redo2 className="h-3.5 w-3.5" />
                      <span className="h-3.5 w-px bg-border" />
                      <Bold className="h-3.5 w-3.5" />
                      <Italic className="h-3.5 w-3.5" />
                      <Strikethrough className="h-3.5 w-3.5" />
                      <Underline className="h-3.5 w-3.5" />
                      <span className="h-3.5 w-px bg-border" />
                      <Link className="h-3.5 w-3.5" />
                      <List className="h-3.5 w-3.5" />
                      <Quote className="h-3.5 w-3.5" />
                    </div>
                    <div className="px-6 py-[22px]">
                      <div className="mb-2.5 font-display text-[20px] font-medium">Why slow down</div>
                      <p className="mb-3 text-[13px] leading-[1.6] text-muted-foreground">
                        Slow living isn&apos;t about doing less — it&apos;s about giving each thing the
                        attention it deserves. This idea links to{' '}
                        <span className="font-medium text-primary">Morning rituals</span> and{' '}
                        <span className="font-medium text-primary">Digital minimalism</span>.
                      </p>
                      <ul className="flex list-none flex-col gap-1.5 p-0 text-[13px] text-muted-foreground">
                        <li>— Notice when you&apos;re rushing out of habit, not necessity</li>
                        <li>— Pick one ritual to protect every morning</li>
                        <li>— Let unfinished things stay unfinished sometimes</li>
                      </ul>
                    </div>
                  </div>
                  <div className="w-[176px] flex-shrink-0 rounded-[14px] bg-card p-3.5">
                    <div className="mb-2.5 flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground">Connections</span>
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg border border-border bg-popover px-2.5 py-2">
                        <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.08em] text-[var(--ed-blue)]">
                          <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.4} />
                          Requires
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="flex-1 text-xs font-medium">Morning rituals</span>
                          <span className="rounded-xs bg-secondary px-[5px] py-px text-[9px] font-medium text-secondary-foreground">
                            item
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-popover px-2.5 py-2">
                        <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.08em] text-[var(--ed-orange)]">
                          <Waypoints className="h-2.5 w-2.5" />
                          Related
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="flex-1 text-xs font-medium">Digital minimalism</span>
                          <span className="rounded-xs bg-secondary px-[5px] py-px text-[9px] font-medium text-secondary-foreground">
                            item
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-card">
            <div className="px-9 pt-9 pb-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[.08em] text-[var(--ed-red)]">
                Trails
              </div>
              <h3 className="mb-2.5 font-display text-2xl font-medium leading-[1.2] tracking-[-.01em]">
                Read your ideas as a path
              </h3>
              <p className="text-[15px] leading-[1.6] text-muted-foreground text-pretty">
                Order any set of ideas into a trail. Each step is bridged by the link that connects it
                to the last — so it reads as a narrated sequence, not a pile of notes.
              </p>
            </div>
            <div className="px-9 pb-9 pt-[26px]" style={{ background: 'var(--ed-red)' }}>
              <div className="rounded-[18px] border border-border bg-popover p-[22px]">
                <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
                  A trail through the Memex
                </div>
                <div className="mb-[3px] mt-[5px] font-display text-2xl font-medium leading-[1.1]">
                  Getting started
                </div>
                <div className="mb-4 text-xs text-muted-foreground">version 1 · 3 items</div>
                <div className="rounded-xl border border-border px-3.5 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">
                    Step 1
                  </div>
                  <div className="mt-0.5 font-display text-[18px] font-medium leading-[1.2]">
                    Why slow down
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">
                    Slow living isn&apos;t about doing less — it&apos;s about attention.
                  </div>
                </div>
                <div className="flex gap-3 py-2.5 pl-1.5">
                  <div className="flex flex-col items-center text-[var(--ed-red)]">
                    <span className="h-3 w-px bg-current" />
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-current">
                      <ArrowUp className="h-[13px] w-[13px]" />
                    </span>
                    <span className="mt-0.5 h-3 w-px bg-current" />
                  </div>
                  <div className="pt-[3px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--ed-red)]">
                      Requires · Morning rituals
                    </div>
                    <div className="mt-1 text-[13px] italic text-foreground">
                      You can&apos;t protect mornings without knowing why.
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border px-3.5 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">
                    Step 2
                  </div>
                  <div className="mt-0.5 font-display text-[18px] font-medium leading-[1.2]">
                    Morning rituals
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">
                    One protected hour before the day asks anything of you.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-card">
            <div className="px-9 pt-9 pb-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[.08em] text-[var(--ed-orange)]">
                Badges
              </div>
              <h3 className="mb-2.5 font-display text-2xl font-medium leading-[1.2] tracking-[-.01em]">
                Earn recognition as you go
              </h3>
              <p className="text-[15px] leading-[1.6] text-muted-foreground text-pretty">
                Publish, get forked, draw a crowd — each milestone unlocks a badge on your profile. The
                ones you haven&apos;t earned yet show how close you are.
              </p>
            </div>
            <div className="px-9 pb-9 pt-[26px]" style={{ background: 'var(--ed-orange)' }}>
              <div className="rounded-[18px] border border-border bg-popover p-5">
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="font-display text-[15px] font-medium">Badges</span>
                  <span className="text-xs text-muted-foreground">3 / 9 earned</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: Feather, title: 'First publish', desc: 'Ship your first path.' },
                    { icon: Star, title: 'Rising star', desc: '100 upvotes in a week.' },
                    { icon: Eye, title: 'On the map', desc: '1,000 total views.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="rounded-[14px] bg-tertiary px-[15px] py-[13px]">
                      <div className="mb-[9px] flex items-center justify-between">
                        <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-tertiary-foreground text-tertiary">
                          <Icon className="h-[17px] w-[17px]" />
                        </span>
                        <span className="text-[11px] font-medium text-tertiary-foreground">Earned</span>
                      </div>
                      <div className="text-[13.5px] font-medium">{title}</div>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{desc}</div>
                    </div>
                  ))}
                  <div className="rounded-[14px] bg-card px-[15px] py-[13px] opacity-75">
                    <div className="mb-[9px] flex items-center justify-between">
                      <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-surface-container-high text-muted-foreground">
                        <Lock className="h-[15px] w-[15px]" />
                      </span>
                    </div>
                    <div className="text-[13.5px] font-medium">Trendsetter</div>
                    <div className="mb-[9px] mt-0.5 text-[11.5px] text-muted-foreground">
                      Top of Explore for a day.
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full w-[40%] rounded-full bg-primary" />
                    </div>
                    <div className="mt-[5px] text-[10.5px] font-medium text-muted-foreground">40 / 100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.3} className="md:order-2">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-card">
            <div className="px-9 pt-9 pb-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[.08em] text-[var(--ed-purple)]">
                Knowledge graph
              </div>
              <h3 className="mb-2.5 font-display text-2xl font-medium leading-[1.2] tracking-[-.01em]">
                See the whole shape of a project
              </h3>
              <p className="text-[15px] leading-[1.6] text-muted-foreground text-pretty">
                Every link becomes an edge. The trail spine runs straight through; typed associations
                arc off to related ideas — colour-coded so structure is obvious at a glance.
              </p>
            </div>
            <div className="px-9 pb-9 pt-[26px]" style={{ background: 'var(--ed-purple)' }}>
              <div className="overflow-hidden rounded-[18px] border border-border bg-popover px-2.5 py-2">
                <svg viewBox="0 0 440 250" className="block h-auto w-full">
                  <defs>
                    <marker id="tramo-ah" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="7" markerHeight="7" orient="auto">
                      <path d="M1 1 L11 6 L1 11 z" fill="context-stroke" />
                    </marker>
                  </defs>
                  <path d="M136 63 L156 63" style={{ stroke: 'var(--ed-gray)', strokeWidth: 3, fill: 'none' }} markerEnd="url(#tramo-ah)" />
                  <path d="M280 63 L300 63" style={{ stroke: 'var(--ed-gray)', strokeWidth: 3, fill: 'none' }} markerEnd="url(#tramo-ah)" />
                  <path d="M76 82 C 76 118, 118 112, 118 146" style={{ stroke: 'var(--ed-blue)', strokeWidth: 2, fill: 'none' }} markerEnd="url(#tramo-ah)" />
                  <path d="M220 82 C 220 118, 304 112, 304 146" style={{ stroke: 'var(--ed-orange)', strokeWidth: 2, fill: 'none' }} markerEnd="url(#tramo-ah)" />
                  <rect x="16" y="44" width="120" height="38" rx="8" style={{ fill: 'var(--primary)' }} />
                  <text x="76" y="63" textAnchor="middle" dominantBaseline="central" fontSize="12.5" style={{ fill: 'var(--primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Why slow down</text>
                  <rect x="160" y="44" width="120" height="38" rx="8" style={{ fill: 'var(--primary)' }} />
                  <text x="220" y="63" textAnchor="middle" dominantBaseline="central" fontSize="12.5" style={{ fill: 'var(--primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Morning rituals</text>
                  <rect x="304" y="44" width="120" height="38" rx="8" style={{ fill: 'var(--primary)' }} />
                  <text x="364" y="63" textAnchor="middle" dominantBaseline="central" fontSize="12.5" style={{ fill: 'var(--primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Deep work</text>
                  <rect x="64" y="150" width="108" height="36" rx="8" style={{ fill: 'var(--card)', stroke: 'var(--border)' }} />
                  <text x="118" y="168" textAnchor="middle" dominantBaseline="central" fontSize="12" style={{ fill: 'var(--foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Attention</text>
                  <rect x="250" y="150" width="108" height="36" rx="8" style={{ fill: 'var(--card)', stroke: 'var(--border)' }} />
                  <text x="304" y="168" textAnchor="middle" dominantBaseline="central" fontSize="12" style={{ fill: 'var(--foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Minimalism</text>
                  <line x1="79" y1="224" x2="101" y2="224" style={{ stroke: 'var(--ed-gray)', strokeWidth: 4 }} />
                  <text x="107" y="224" dominantBaseline="central" fontSize="11" style={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>trail order</text>
                  <line x1="203" y1="224" x2="225" y2="224" style={{ stroke: 'var(--ed-blue)', strokeWidth: 2 }} />
                  <text x="231" y="224" dominantBaseline="central" fontSize="11" style={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>requires</text>
                  <line x1="293" y1="224" x2="315" y2="224" style={{ stroke: 'var(--ed-orange)', strokeWidth: 2 }} />
                  <text x="321" y="224" dominantBaseline="central" fontSize="11" style={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>related</text>
                </svg>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.4} className="md:order-1">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-card">
            <div className="px-9 pt-9 pb-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[.08em] text-[var(--ed-green)]">
                Publish &amp; explore
              </div>
              <h3 className="mb-2.5 font-display text-2xl font-medium leading-[1.2] tracking-[-.01em]">
                Publish once — get found
              </h3>
              <p className="text-[15px] leading-[1.6] text-muted-foreground text-pretty">
                One click gives a path its own link and a spot on Explore. Upvotes, views and comments
                roll in — and the week&apos;s most-viewed becomes Featured.
              </p>
            </div>
            <div className="px-9 pb-9 pt-[26px]" style={{ background: 'var(--ed-green)' }}>
              <div className="relative flex gap-[18px] rounded-[14px] border border-border bg-popover p-5 shadow-elevation-2">
                <div className="absolute -top-[11px] right-4 flex items-center gap-[5px] rounded-full bg-tertiary px-[11px] py-1 text-[11px] font-semibold text-tertiary-foreground shadow-elevation-2">
                  <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                  Featured this week
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2.5 flex items-center gap-[9px]">
                    <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-surface-container-high text-[11px] font-medium text-primary">
                      m
                    </span>
                    <span className="text-[13px] font-medium">maya</span>
                    <span className="text-[13px] text-muted-foreground">· published just now</span>
                  </div>
                  <div className="mb-1.5 font-display text-[20px] font-medium leading-[1.25]">
                    Slow living, end to end
                  </div>
                  <p className="mb-3 max-w-[44ch] text-[14px] leading-[1.55] text-muted-foreground">
                    A trail from noticing the rush to protecting one ritual a day — with the ideas that
                    hold it together.
                  </p>
                  <div className="mb-3.5 flex flex-wrap gap-2">
                    {['slow-living', 'habits', 'focus'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[5px] border border-border px-[9px] py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-[5px] text-[13px] font-medium text-foreground">
                      <ChevronUp className="h-4 w-4" />
                      128
                    </span>
                    <span className="inline-flex items-center gap-[5px] text-[13px]">
                      <Eye className="h-4 w-4" />
                      3,420
                    </span>
                    <span className="inline-flex items-center gap-[5px] text-[13px]">
                      <MessageCircle className="h-[15px] w-[15px]" />
                      22
                    </span>
                  </div>
                </div>
                <div className="grid h-[104px] w-[120px] flex-shrink-0 place-items-center rounded-[10px] bg-surface-container-high">
                  <span className="font-display text-[26px] font-medium text-primary">S</span>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
