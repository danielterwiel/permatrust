import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import type * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import type { FieldApi } from '@tanstack/react-form'
import * as React from 'react'

type Field = FieldApi<any, any, any, any>

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('space-y-2', className)} {...props} />
})
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    field: Field
  }
>(({ className, field, ...props }, ref) => {
  const hasError = field?.state.meta.errors.length > 0

  return (
    <Label
      ref={ref}
      className={cn(hasError && 'text-destructive', className)}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & {
    field: Field
  }
>(({ field, ...props }, ref) => {
  const hasError = field?.state.meta.errors.length > 0

  return <Slot ref={ref} aria-invalid={hasError} {...props} />
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    field: Field
  }
>(({ className, children, field, ...props }, ref) => {
  const errors = field?.state.meta.errors
  const body = errors?.length > 0 ? errors[0] : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage }
