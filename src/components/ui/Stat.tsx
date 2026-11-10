import type { ComponentChildren } from 'preact';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  sub?: ComponentChildren;
  tone?: 'brand' | 'default' | 'accent';
  size?: 'lg' | 'md';
  class?: string;
}

/** Keeps every number on the same line as its unit ("70.3 kg"), so a big value only ever breaks
 *  between its parts. */
const glue = (v: string | number) =>
  typeof v === 'string' ? v.replace(/(\d) (?=\p{L})/gu, '$1\u00a0') : v;

export function Stat({
  label,
  value,
  unit,
  sub,
  tone = 'default',
  size = 'md',
  class: cls,
}: Props) {
  const color =
    tone === 'brand'
      ? 'text-brand-600 dark:text-brand-300'
      : tone === 'accent'
        ? 'text-accent-600 dark:text-accent-400'
        : 'text-fg';
  return (
    <div class={`flex flex-col ${cls ?? ''}`}>
      <span class="text-subtle text-xs font-semibold">{label}</span>
      <span
        class={`font-display tabular mt-1 leading-none tracking-tight [text-wrap:balance] ${size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-3xl'} ${color}`}
      >
        {glue(value)}
        {unit && (
          <span class="text-muted ml-1 text-base font-medium whitespace-nowrap">{unit}</span>
        )}
      </span>
      {sub && <span class="text-muted mt-1.5 text-sm">{sub}</span>}
    </div>
  );
}
