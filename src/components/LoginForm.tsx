"use client"

import { LockKeyhole, Mail } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import type { ApiEnvelope } from "@/types/api"
import { ApiError } from "@/lib/apiError"
import { applyServerErrors } from "@/lib/applyServerErrors"
import { emailSchema } from "@/lib/validation"
import { queryKeys } from "@/lib/query/queryKeys"
import { normalizeCurrentUser, storeCurrentUser, type RawCurrentUser } from "@/services/profileApi"

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  })

  async function login({ email, password }: LoginValues) {
    try {
      const response = await fetch("/api/User/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const payload: ApiEnvelope<RawCurrentUser> | null = await response.json().catch(() => null)

      if (!response.ok || !payload?.success) {
        throw new ApiError(payload?.message ?? "Invalid email or password.", response.status, payload?.errors)
      }

      const currentUser = normalizeCurrentUser(payload.content)
      storeCurrentUser(currentUser)
      queryClient.setQueryData(queryKeys.auth.currentUser, currentUser)
      toast.success("You're logged in successfully!")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      if (applyServerErrors(error, setError)) return
      toast.error(error instanceof Error ? error.message : "Unable to sign in. Please try again.")
    }
  }

  return (
    <div className="flex w-full h-screen p-4 bg-muted/50 items-center justify-center">
      <div className="flex flex-col w-full sm:max-w-sm">
        <div className="flex flex-col gap-2">
          <span className="text-foreground text-4xl font-medium">Welcome Back</span>
          <span className="text-foreground text-sm font-light">Please enter your details to sign in.</span>
        </div>

        <form className="flex flex-col mt-8" onSubmit={handleSubmit(login)} noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-foreground">
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
                className="pl-12 pr-4 py-4 outline-none border rounded-lg border-border w-full text-foreground aria-invalid:border-destructive"
                placeholder="Email address"
              />
              <Mail className="text-foreground w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col mt-4 gap-2">
            <label htmlFor="password" className="text-sm text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
                className="pl-12 pr-4 py-4 outline-none border rounded-lg border-border w-full text-foreground aria-invalid:border-destructive"
                placeholder="Password"
              />
              <LockKeyhole className="text-foreground w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
          </div>

          <button
            aria-label="Sign In"
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground py-4 rounded-lg mt-8 transition-all hover:scale-105 duration-300 cursor-pointer text-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
