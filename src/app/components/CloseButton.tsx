import { X } from 'lucide-react'
import React from 'react'
import { ButtonProps } from '@/app/types/button'

export default function CloseButton({
    onClick
}: ButtonProps) {
  return (
    <button aria-label='Close Button' type='button' onClick={onClick}>
        <X className='text-gray-500 w-5 h-5 transition-all hover:text-[#0c0d0d] cursor-pointer'/>
    </button>
  )
}
