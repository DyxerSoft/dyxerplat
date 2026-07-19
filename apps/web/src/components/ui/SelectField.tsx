"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const EMPTY_VALUE = "__empty__";

type SelectOption = {
  value: string;
  label: string;
};

export function SelectField({
  value,
  onValueChange,
  options,
  ariaLabel,
  className
}: Readonly<{
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  className?: string;
}>) {
  return (
    <SelectPrimitive.Root
      value={value || EMPTY_VALUE}
      onValueChange={(nextValue) => onValueChange(nextValue === EMPTY_VALUE ? "" : nextValue)}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition hover:border-secondary/50 focus:border-secondary focus:ring-4 focus:ring-secondary/10 data-[placeholder]:text-muted-foreground",
          className
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 text-secondary" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="z-[9999] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-secondary/30 bg-card p-1.5 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
        >
          <SelectPrimitive.Viewport className="max-h-64 space-y-1 overflow-y-auto">
            {options.map((option) => {
              const optionValue = option.value || EMPTY_VALUE;
              return (
                <SelectPrimitive.Item
                  key={optionValue}
                  value={optionValue}
                  className="relative flex cursor-pointer select-none items-center rounded-lg bg-card py-2.5 pl-3 pr-9 text-sm font-semibold text-card-foreground outline-none transition data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-secondary/15 data-[state=checked]:text-secondary"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex items-center">
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
