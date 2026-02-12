// Utility functions for authentication

export const setAuthToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        // Set cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`
    }
}

export const setUserRole = (role: 'student' | 'admin') => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('role', role)
    }
}

export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token')
    }
    return null
}

export const getUserRole = (): 'student' | 'admin' | null => {
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('role')
        return role as 'student' | 'admin' | null
    }
    return null
}

export const clearAuth = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }
}

export const isAuthenticated = (): boolean => {
    return !!getAuthToken()
}
