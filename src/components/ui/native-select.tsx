import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, placeholder, value, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            className
          )}
          value={value}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export interface NativeSelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const NativeSelectOption = React.forwardRef<
  HTMLOptionElement,
  NativeSelectOptionProps
>(({ className, ...props }, ref) => (
  <option ref={ref} className={cn("", className)} {...props} />
))
NativeSelectOption.displayName = "NativeSelectOption"

export { NativeSelect, NativeSelectOption }
