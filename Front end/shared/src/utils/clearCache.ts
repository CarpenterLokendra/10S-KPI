export const clearCacheExceptAuth = () => {
  // Get current auth token before clearing
  const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

  // Clear all localStorage except auth token
  const keysToKeep = ['auth_token', 'user']
  Object.keys(localStorage).forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key)
    }
  })

  // Clear all sessionStorage except auth token
  Object.keys(sessionStorage).forEach((key) => {
    if (!keysToKeep.includes(key)) {
      sessionStorage.removeItem(key)
    }
  })

  // Clear all cookies except JWT/auth cookies
  const authCookiePatterns = ['token', 'auth', 'jwt', 'access']
  document.cookie.split(';').forEach((c) => {
    const eqPos = c.indexOf('=')
    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()

    // Check if this is an auth-related cookie
    const isAuthCookie = authCookiePatterns.some((pattern) =>
      name.toLowerCase().includes(pattern)
    )

    // Only delete non-auth cookies
    if (name && !isAuthCookie) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
    }
  })

  console.log('✅ Cache cleared (auth token preserved)')
}
