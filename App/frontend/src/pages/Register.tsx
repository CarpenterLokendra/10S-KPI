import RegisterForm from '@/components/auth/RegisterForm'

export default function Register() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md card-base">
        <div className="mb-8">
          <h1 className="text-heading-md text-center font-rajdhani mb-2">Create Account</h1>
          <p className="text-center text-text-secondary text-sm">
            Join 10S and start playing now.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}
