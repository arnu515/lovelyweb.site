<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { type VariantProps, tv } from 'tailwind-variants';
  import { cn } from '$lib/utils.js';

  const badgeVariants = tv({
    base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  });

  type Variant = VariantProps<typeof badgeVariants>['variant'];

  type $$Props = HTMLAttributes<HTMLDivElement> & {
    variant?: Variant;
  };

  let className: $$Props['class'] = undefined;
  export let variant: $$Props['variant'] = 'default';
  export { className as class };
</script>

<div class={cn(badgeVariants({ variant }), className)} {...$$restProps}>
  <slot />
</div>
