import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

export function TextField({ label, id, containerClassName, ...inputProps }: TextFieldProps) {
  const fieldId = id ?? inputProps.name;
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${containerClassName ?? ""}`}>
      <label htmlFor={fieldId} className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
        {label.toUpperCase()}
      </label>
      <input
        id={fieldId}
        className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink placeholder:text-ink-dim"
        {...inputProps}
      />
    </div>
  );
}
