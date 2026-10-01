import { TapButton } from '../kit/TapButton';

export interface Option<T extends string> {
  value: T;
  label: string;
}

// A row of big exclusive choices (language, difficulty...).
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <TapButton
          key={option.value}
          className="segment"
          role="radio"
          aria-checked={option.value === value}
          data-selected={option.value === value}
          onTap={() => onChange(option.value)}
        >
          {option.label}
        </TapButton>
      ))}
    </div>
  );
}

// A big on/off switch.
export function Switch({
  checked,
  onChange,
  label,
  stateLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  stateLabel: string;
}) {
  return (
    <div className="switch-row">
      <span className="switch-state">{stateLabel}</span>
      <TapButton className="switch" role="switch" aria-checked={checked} aria-label={label} data-on={checked} onTap={() => onChange(!checked)}>
        <span className="switch-knob" />
      </TapButton>
    </div>
  );
}
