import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-800 dark:bg-steel-blue/20 dark:text-blue-300 border dark:border-steel-blue/50",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border dark:border-green-800",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-steel-yellow/20 dark:text-yellow-400 border dark:border-steel-yellow/50",
        danger: "bg-red-100 text-red-800 dark:bg-steel-red/20 dark:text-red-400 border dark:border-steel-red/50",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border dark:border-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }