import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 px-2.5 py-1 text-ink',
        teal: 'bg-teal/15 px-2.5 py-1 text-teal-bright',
        coral: 'bg-coral/15 px-2.5 py-1 text-coral-bright',
        // translucent dark pill that floats over a product photo
        overlay: 'bg-black/65 px-2.5 py-1 text-white backdrop-blur-sm',
        outline: 'border border-border px-2.5 py-1 text-ink-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
