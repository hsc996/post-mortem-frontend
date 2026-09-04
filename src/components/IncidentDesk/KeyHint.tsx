interface KeyHintProps {
  char: string;
}

/** A visible keycap next to an action's label — a hidden shortcut isn't a real feature. */
export function KeyHint({ char }: KeyHintProps) {
  return (
    <span
      aria-hidden="true"
      className="ml-2 inline-flex h-4 w-4 items-center justify-center border border-current text-[11px] font-bold leading-none opacity-70"
    >
      {char}
    </span>
  );
}
