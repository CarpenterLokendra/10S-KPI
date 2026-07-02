import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { useThemeModeStore } from '@/store/themeMode.store'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterForm() {
  const { colorMode } = useThemeModeStore()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const { register, registerLoading } = useAuth()

  const validatePasswordStrength = (password: string) => {
    const strength = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    }
    setPasswordStrength(strength)
    return Object.values(strength).every(Boolean)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (formData.username.length > 15) {
      newErrors.username = 'Username must be maximum 15 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePasswordStrength(formData.password)) {
      newErrors.password = 'Password does not meet strength requirements'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validate password strength on password input
    if (name === 'password') {
      validatePasswordStrength(value)
    }

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

    register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Username"
        name="username"
        type="text"
        placeholder="Choose a username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        disabled={registerLoading}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        disabled={registerLoading}
      />

      <div>
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={registerLoading}
        />

        {formData.password && (
          <div className="mt-2 space-y-1 text-xs">
            <StrengthIndicator met={passwordStrength.minLength}>
              At least 8 characters
            </StrengthIndicator>
            <StrengthIndicator met={passwordStrength.hasUppercase}>
              One uppercase letter
            </StrengthIndicator>
            <StrengthIndicator met={passwordStrength.hasLowercase}>
              One lowercase letter
            </StrengthIndicator>
            <StrengthIndicator met={passwordStrength.hasNumber}>
              One number
            </StrengthIndicator>
            <StrengthIndicator met={passwordStrength.hasSpecial}>
              One special character (!@#$%^&*...)
            </StrengthIndicator>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        disabled={registerLoading}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={registerLoading}
        style={colorMode !== 'colour' ? {
          backgroundColor: '#f59e0b',
          color: '#000000'
        } : {}}
      >
        {registerLoading ? 'Creating account...' : 'Register'}
      </Button>

      <div className="text-center">
        <p className="text-text-secondary text-sm">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold transition-colors"
            style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colorMode === 'colour' ? '#8b5cf6' : '#fbbf24'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colorMode === 'colour' ? '#6125c9' : '#f59e0b'
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </form>
  )
}

interface StrengthIndicatorProps {
  met: boolean
  children: React.ReactNode
}

function StrengthIndicator({ met, children }: StrengthIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${
          met ? 'bg-green-500' : 'bg-gray-600'
        }`}
      />
      <span className={met ? 'text-green-500' : 'text-text-muted'}>{children}</span>
    </div>
  )
}
