import React from 'react';
import { Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeUp } from '@/components/landing/landing-motion';

const FREE_FEATURES = [
  'Unlimited public paths',
  'Full social layer — follow, fork, comment, upvote',
  'Unlimited publishing',
  '500MB storage',
];

const SUPPORTER_FEATURES = [
  'Everything in Free',
  '10GB storage',
  'Animated GIF avatar',
  'Profile banner',
  'Supporter badge on your profile',
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="pt-16 pb-[84px]">
      <span className="block text-sm font-medium mb-5 text-primary">Plans</span>
      <div className="grid gap-4 md:grid-cols-2">
        <FadeUp>
          <div className="flex h-full flex-col rounded-[28px] bg-card p-9">
            <h2 className="font-display text-2xl font-medium">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everything you need to think in paths.</p>
            <div className="mt-4 font-display text-[40px] font-medium">$0</div>
            <ul className="mt-5 flex flex-col gap-2.5 text-[15px]">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
              <Button asChild size="xl" variant="secondary" className="w-full">
                <a href="/signup">Start for free</a>
              </Button>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex h-full flex-col rounded-[28px] bg-accent p-9 text-accent-foreground">
            <h2 className="font-display text-2xl font-medium inline-flex items-center gap-2">
              Supporter <Heart className="h-5 w-5 text-primary" />
            </h2>
            <p className="mt-1 text-sm opacity-85">More room, a thank-you badge.</p>
            <div className="mt-4 font-display text-[40px] font-medium">$5</div>
            <ul className="mt-5 flex flex-col gap-2.5 text-[15px]">
              {SUPPORTER_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
              <Button asChild size="xl" className="w-full">
                <a href="/signup">Sign up to connect</a>
              </Button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
