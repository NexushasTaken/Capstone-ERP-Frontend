// Chart.js can't parse the oklch() colours the shadcn theme uses, so this
// resolves a theme variable (e.g. '--chart-5') to rgba() by painting one pixel.
// Browser-only: call it inside an effect.
export function themeColor(variable: string, alpha = 1): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  const context = document.createElement('canvas').getContext('2d')
  if (!value || !context) return value

  context.fillStyle = value
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
