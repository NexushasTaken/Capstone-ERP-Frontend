import React from 'react'

export interface SeeMoreModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function SeeMoreModal({
open,
onClose,
children,
className = ""
}: SeeMoreModalProps) {
    if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        className={`w-full lg:max-w-lg rounded-none lg:rounded-lg bg-white ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
