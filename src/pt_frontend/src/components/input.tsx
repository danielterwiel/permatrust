import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/ui/icon';
import { Input as InputBase } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { ChangeEvent, ComponentProps, FocusEvent, ForwardedRef, MutableRefObject } from 'react';

type InputProps = Omit<ComponentProps<typeof InputBase>, 'onChange'> & {
  clearTooltip?: string;
  debounceDelay?: number;
  onChange: (value: string) => void;
  onChangeImmediate?: (value: string) => void;
  onClear?: () => void;
  withClearButton?: boolean;
};

// Create the component with forwardRef to handle inputRef properly
const InputComponent = forwardRef(function Input(
  {
    className = '',
    debounceDelay = 300,
    onChange,
    onChangeImmediate,
    onClear,
    clearTooltip = 'Clear',
    value = '',
    withClearButton = false, // Default to false for better performance
    onBlur,
    onFocus,
    ...inputProps
  }: InputProps, 
  ref: ForwardedRef<HTMLInputElement>
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState(value as string);
  const [isButtonFocused, setIsButtonFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const internalRef = useRef<HTMLInputElement>(null);
  
  // Use the forwarded ref if available, otherwise fall back to internal ref
  const inputRef = (ref || internalRef) as MutableRefObject<HTMLInputElement | null>;

  // Sync input value with external value prop when it changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value as string);
    }
  }, [value, inputValue]);

  // For title inputs, we want to update immediately (no debounce)
  // For filter inputs with withClearButton=true, we want to debounce
  const shouldDebounce = withClearButton && debounceDelay > 0;

  const handleClearInput = useCallback(() => {
    setInputValue('');
    onChangeImmediate?.('');
    
    // Cancel any pending debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Immediately call onChange without debounce
    onChange('');
    onClear?.();

    // Focus the input element 
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, onChangeImmediate, onClear, inputRef]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Always call onChangeImmediate if provided
    onChangeImmediate?.(newValue);
    
    // If we should debounce, set up the timer
    if (shouldDebounce) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceDelay);
    } else {
      // Otherwise call onChange immediately
      onChange(newValue);
    }
  }, [onChange, onChangeImmediate, shouldDebounce, debounceDelay]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  // Cancel any pending debounce on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Only calculate these values if we're using the clear button
  const hasValue = withClearButton ? inputValue.length > 0 : false;
  const shouldRenderClearButton = withClearButton && hasValue;

  // Only calculate visibility class if we're showing the clear button
  const clearButtonVisibilityClass = shouldRenderClearButton
    ? (isFocused || isHovered || isButtonFocused
        ? 'opacity-100 visible'
        : 'opacity-0 invisible')
    : '';

  return (
    <div 
      className="relative"
      onMouseEnter={withClearButton ? () => setIsHovered(true) : undefined}
      onMouseLeave={withClearButton ? () => setIsHovered(false) : undefined}
    >
      <InputBase
        {...inputProps}
        className={hasValue ? `${className} pr-8` : className}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        ref={inputRef}
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
});

// Memoize the component to prevent unnecessary re-renders
export const Input = memo(InputComponent);
Input.displayName = 'Input';
