'use client'

import { LockKeyhole, Mail, UserRoundPlus, Users } from 'lucide-react'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import React from 'react'

export default function RegisterForm() {
  return (
     <div className="flex w-full h-screen p-4 bg-[#f9f9f9] items-center justify-center">
        <Toaster richColors closeButton/>
        <div className="flex flex-col w-full sm:max-w-sm">
            <div className="flex flex-col gap-2 items-center">
                <span className="flex items-center justify-center self-center p-2 rounded-lg bg-[#C0C8C3]">
                    <UserRoundPlus className="text-[#58605C] w-10 h-10" />
                </span>
                <span className="text-[#0c0d0d] text-4xl font-medium">Create Account</span>
                <span className="text-[#0c0d0d] text-sm font-light">Fill in your details below.</span>
            </div>

            <div className="flex flex-col mt-8">
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className='text-sm text-[#0c0d0d]'>Full Name</label>
                    <div className="relative">
                        <input type="text" className="pl-12 pr-4 py-4 outline-none border rounded-lg border-[#cfd1d1] w-full" placeholder='Full Name'/>
                        <Users className="text-[#0c0d0d] w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <label htmlFor="email" className='text-sm text-[#0c0d0d]'>Email address</label>
                    <div className="relative">
                        <input type="text" className="pl-12 pr-4 py-4 outline-none border rounded-lg border-[#cfd1d1] w-full" placeholder='Email address'/>
                        <Mail className="text-[#0c0d0d] w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>

                <div className="flex flex-col mt-4 gap-2">
                    <label htmlFor="password" className='text-sm text-[#0c0d0d]'>Password</label>
                    <div className="relative">
                        <input type="password" className="pl-12 pr-4 py-4 outline-none border rounded-lg border-[#cfd1d1] w-full" placeholder='Password'/>
                        <LockKeyhole className="text-[#0c0d0d] w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>

                <button onClick={() => toast.success('Your account has been created successfully!')} aria-label='Sign In' type='button' className="bg-[#0c0d0d] text-white py-4 rounded-lg mt-8 transition-all hover:scale-105 duration-300 cursor-pointer">Sign Up</button>
                
                <div className="flex justify-center mt-4">
                    <span className="inline-flex gap-1">
                        Already have an account? 
                        <Link 
                            href="/auth/login" 
                            className="text-[#0c0d0d] hover:underline font-medium">
                            Sign in
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    </div>
  )
}
