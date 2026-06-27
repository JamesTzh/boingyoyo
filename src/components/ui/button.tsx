import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // teal primary — dark ink on teal, per the brief
        default: 'bg-teal text-primary-foreground hover:bg-teal-bright',
        // coral "Sell" CTA
        sell: 'bg-coral text-white hover:bg-coral-bright',
        destructive: 'bg-coral text-white hover:bg-coral-bright',
        outline: 'border border-border bg-transparent text-ink hover:bg-surface-2',
        secondary: 'bg-surface-2 text-ink hover:bg-surface-2/80',
        ghost: 'text-ink hover:bg-surface-2',
        link: 'text-teal-bright underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-9 px-4',
        lg: 'h-12 px-7 text-base',
        pill: 'h-8 rounded-full px-4 text-[13px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
