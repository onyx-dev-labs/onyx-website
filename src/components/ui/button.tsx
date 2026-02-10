import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-900/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-cyan-500/30 bg-transparent text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300",
        secondary:
          "bg-cyan-950 text-cyan-400 hover:bg-cyan-900",
        ghost: "hover:bg-cyan-950/20 hover:text-cyan-400",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        cyber: "bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 tracking-wider font-mono uppercase",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
