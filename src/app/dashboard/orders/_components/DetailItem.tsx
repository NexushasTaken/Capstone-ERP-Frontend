// A small label/value pair used in the order details and the order review.
export default function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="block truncate text-sm font-semibold capitalize text-foreground">{value}</span>
    </div>
  )
}
