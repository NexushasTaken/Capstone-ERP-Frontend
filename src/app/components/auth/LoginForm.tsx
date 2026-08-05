'use client'

import { LockKeyhole, Mail } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import React, { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL
      const response = await fetch(
        `${apiBaseUrl?.replace(/\/$/, '') ?? ''}/api/User/Login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        },
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.message ?? payload?.title ?? 'Invalid email or password.'
        throw new Error(message)
      }

      toast.success("You're logged in successfully!")
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full h-screen p-4 bg-[#f9f9f9] items-center justify-center select-none">
        <Toaster richColors closeButton/>
        <div className="flex flex-col w-full sm:max-w-sm">
            <div className="flex flex-col gap-2">
                <span className="text-[#0c0d0d] text-4xl font-medium">Welcome Back</span>
                <span className="text-[#0c0d0d] text-sm font-light">Please enter your details to sign in.</span>
            </div>

            <form className="flex flex-col mt-8" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className='text-sm text-[#0c0d0d]'>Email address</label>
                    <div className="relative">
                        <input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="pl-12 pr-4 py-4 outline-none border rounded-lg border-[#cfd1d1] w-full" placeholder='Email address'/>
                        <Mail className="text-[#0c0d0d] w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>

                <div className="flex flex-col mt-4 gap-2">
                    <label htmlFor="password" className='text-sm text-[#0c0d0d]'>Password</label>
                    <div className="relative">
                        <input id="password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="pl-12 pr-4 py-4 outline-none border rounded-lg border-[#cfd1d1] w-full" placeholder='Password'/>
                        <LockKeyhole className="text-[#0c0d0d] w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>

                <button aria-label='Sign In' type='submit' disabled={isSubmitting} className="bg-[#0c0d0d] text-white py-4 rounded-lg mt-8 transition-all hover:scale-105 duration-300 cursor-pointer text-center disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
                
                {/* <div className="flex justify-center mt-4">
                    <span className="inline-flex gap-1">
                        Don&apos;t have an account? 
                        <Link 
                            href="/auth/signup" 
                            className="text-[#0c0d0d] hover:underline font-medium">
                            Sign up
                        </Link>
                    </span>
                </div> */}
            </form>
        </div>
    </div>
  )
}
