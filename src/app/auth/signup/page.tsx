import type { Metadata } from 'next'
import RegisterForm from './_components/RegisterForm'

export const metadata: Metadata = { title: 'Sign Up' }

export default function SignupPage() {
  return <RegisterForm />
}
