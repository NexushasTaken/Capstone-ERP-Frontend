import { Chart } from "chart.js"

/**
 * A dashed vertical line just before the point at `index` on a category x axis, with a small label at the top.
 * `row` moves the label down one line, so two markers on the same week don't overlap.
 */
export function drawMarker(chart: Chart<"line">, index: number, label: string, color: string, row = 0) {
  const { ctx, chartArea, scales } = chart
  const x = scales.x.getPixelForValue(index - 0.5)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, chartArea.top)
  ctx.lineTo(x, chartArea.bottom)
  ctx.stroke()
  ctx.font = `11px ${Chart.defaults.font.family}`
  ctx.textBaseline = "top"
  ctx.fillText(label, x + 4, chartArea.top + 2 + row * 14)
  ctx.restore()
}

/** Where a new year starts in a run of week Mondays, or -1 if they're all in one year. */
export function yearStartIndex(mondays: Date[]) {
  return mondays.findIndex((date, i) => i > 0 && date.getFullYear() !== mondays[i - 1].getFullYear())
}
