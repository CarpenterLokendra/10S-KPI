import LoginForm from '@/components/auth/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md card-base">
        <div className="mb-8">
          <h1 className="text-heading-md text-center font-rajdhani mb-2">Login to 10S</h1>
          <p className="text-center text-text-secondary text-sm">
            Welcome back! Continue playing.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
