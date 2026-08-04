import Script from "next/script"
import { SignupForm } from "@/components/auth/signup-form"
import { AuthPoster } from "@/components/auth/auth-poster"

export default function SignupPage() {
  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />
      <div className="flex flex-col px-8 py-8 lg:px-24">
        <div className="flex flex-1 flex-col justify-center">
          <div className="w-full max-w-[400px]">
            <SignupForm />
          </div>
        </div>
      </div>
      <AuthPoster variant="cards" title="Every idea finds its place" subtitle="Collect, connect, and retrace your thinking" />
    </>
  )
}
