import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, ...inputProps }: TextFieldProps) {
  const fieldId = id ?? inputProps.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
        {label.toUpperCase()}
      </label>
      <input
        id={fieldId}
        className="min-h-11 border border-rule bg-transparent px-3 text-sm text-ink placeholder:text-ink-dim"
        {...inputProps}
      />
    </div>
  );
}
