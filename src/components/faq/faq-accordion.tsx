"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { FAQ_GROUPS } from "@/constants/faqs";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";
import { cn } from "@/lib/utils";

interface FaqRowProps {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqRow({ id, question, answer, isOpen, onToggle }: FaqRowProps) {
  const panelId = `${id}-panel`;

  return (
    <div className={REVEAL_ITEM}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left transition-colors sm:px-8",
          isOpen ? "bg-primary/30" : "bg-muted hover:bg-primary/15",
        )}
      >
        <span className="text-base font-bold text-secondary sm:text-lg">
          {question}
        </span>

        <span aria-hidden className="shrink-0 text-secondary">
          {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
        </span>
      </button>

      {/* `grid-rows-[0fr]` -> `[1fr]` animates to the content's real height.
          A max-height guess either clips a long answer or eases against a
          height that was never reached. */}
      <div
        id={panelId}
        role="region"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 py-4 leading-relaxed text-secondary/80 sm:px-8">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.06 });

  // One id rather than a per-group index, so opening an answer in the second
  // group closes the one open in the first.
  const [openId, setOpenId] = React.useState<string | null>("0-0");

  return (
    <div ref={containerRef} className="space-y-12">
      {FAQ_GROUPS.map((group, groupIndex) => (
        <section key={group.title}>
          <h2
            className={`${REVEAL_ITEM} text-2xl font-black text-secondary sm:text-3xl`}
          >
            {group.title}
          </h2>

          <div className="mt-6 space-y-3">
            {group.items.map((item, itemIndex) => {
              const id = `${groupIndex}-${itemIndex}`;
              return (
                <FaqRow
                  key={item.question}
                  id={id}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openId === id}
                  // Clicking the open row closes it, so the list can be fully
                  // collapsed rather than always holding one answer open.
                  onToggle={() => setOpenId(openId === id ? null : id)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
