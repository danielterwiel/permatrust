import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/ui/icon';
import { Input as InputBase } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { ChangeEvent, ComponentProps, FocusEvent } from 'react';

type InputProps = Omit<ComponentProps<typeof InputBase>, 'onChange'> & {
  clearTooltip?: string;
  debounceDelay?: number;
  onChange: (value: string) => void;
  onChangeImmediate?: (value: string) => void;
  onClear?: () => void;
};

export const Input = ({
  className = '',
  debounceDelay = 300,
  onChange,
  onChangeImmediate,
  onClear,
  clearTooltip = 'Clear',
  value = '',
  ...inputProps
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState(value as string);
  const [isButtonFocused, setIsButtonFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value as string);
    }
  }, [value, inputValue]);

  const handleClearInput = () => {
    setInputValue('');
    onChangeImmediate?.('');
    handleDebouncedChange('');
    onClear?.();

    const inputElement = document.querySelector(
      `input[name="${inputProps.name}"]`,
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleDebouncedChange = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(value);
    }, debounceDelay);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChangeImmediate?.(value);
    handleDebouncedChange(value);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    inputProps.onBlur?.(e);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    inputProps.onFocus?.(e);
  };

  const hasValue = inputValue.length > 0;

  // Always render the clear button when there's a value
  const shouldRenderClearButton = hasValue;

  // Determine the visibility class based on focus, hover, and button focus states
  const clearButtonVisibilityClass =
    isFocused || isHovered || isButtonFocused
      ? 'opacity-100 visible'
      : 'opacity-0 invisible';

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <InputBase
        {...inputProps}
        className={hasValue ? `${className} pr-8` : className}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        value={inputValue}
      />
      {shouldRenderClearButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="Clear input"
              className={`absolute right-2 top-1/2 -translate-y-1/2 flex
                items-center justify-center h-5 w-5 text-gray-400
                hover:text-gray-600 transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 rounded-full
                ${clearButtonVisibilityClass}`}
              onBlur={() => setIsButtonFocused(false)}
              onClick={(e) => {
                e.preventDefault();
                handleClearInput();
              }}
              onFocus={() => setIsButtonFocused(true)}
              tabIndex={0}
              type="button"
            >
              <Icon className="h-3.5 w-3.5" name="x-outline" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{clearTooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
