import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login, loginLoading } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    login(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Username or Email"
        name="username"
        type="text"
        placeholder="Enter your username or email"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        disabled={loginLoading}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        disabled={loginLoading}
      />

      <Button type="submit" fullWidth size="lg" loading={loginLoading}>
        {loginLoading ? 'Logging in...' : 'Login'}
      </Button>

      <div className="text-center">
        <p className="text-text-secondary text-sm">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-gold-500 hover:text-gold-400 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </form>
  )
}
