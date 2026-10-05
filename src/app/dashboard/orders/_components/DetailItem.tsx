// A small label/value pair used in the order details and the order review.
export default function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-[#737A76]">{label}</span>
      <span className="block truncate text-sm font-semibold capitalize text-[#0c0d0d]">
        {value}
      </span>
    </div>
  )
}
