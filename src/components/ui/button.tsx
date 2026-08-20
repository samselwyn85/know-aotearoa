import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-semibold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-lagoon text-panel hover:bg-lagoon-deep",
        secondary: "border border-hair bg-panel text-ink hover:border-lagoon hover:text-lagoon",
        ghost: "text-lagoon hover:bg-lagoon-soft",
        ink: "bg-ink text-panel",
      },
      size: {
        sm: "rounded-lg px-3 py-1.5 text-sm",
        md: "rounded-xl px-4 py-2.5 text-sm",
        lg: "rounded-xl px-5 py-4 text-base",
        pill: "rounded-full px-3 py-2 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
