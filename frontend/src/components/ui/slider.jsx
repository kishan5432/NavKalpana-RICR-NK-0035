import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, min = 0, max = 100, step = 1, value = [0], onValueChange, ...props }, ref) => {
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (index, newValue) => {
    const updated = [...localValue]
    updated[index] = Number(newValue)
    setLocalValue(updated)
    onValueChange?.(updated)
  }

  const percentage = (val) => ((val - min) / (max - min)) * 100

  return (
    <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute h-full bg-primary"
          style={{
            left: `${percentage(localValue[0])}%`,
            right: `${100 - percentage(localValue[1] || localValue[0])}%`
          }}
        />
      </div>
      {localValue.map((val, index) => (
        <input
          key={index}
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => handleChange(index, e.target.value)}
          className="absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow"
        />
      ))}
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
