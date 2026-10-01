import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTouch } from './touch';

type NativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onPointerLeave' | 'type'
>;

interface TapButtonProps extends NativeProps {
  onTap: () => void;
  children?: ReactNode;
}

// A button driven by the forgiving shared touch system (tap on release, wobble tolerance,
// double taps and extra fingers ignored). Use this for every tappable thing.
export function TapButton({ onTap, className, disabled, children, ...rest }: TapButtonProps) {
  const { handlers, pressed } = useTouch({ onTap, disabled });
  return (
    <button
      type="button"
      {...rest}
      {...handlers}
      disabled={disabled}
      data-pressed={pressed}
      className={className ? `tap ${className}` : 'tap'}
    >
      {children}
    </button>
  );
}
