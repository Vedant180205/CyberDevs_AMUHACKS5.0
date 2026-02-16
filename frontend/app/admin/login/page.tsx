'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminLoginRedirect() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/login')
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-500">Redirecting to unified login...</p>
            </div>
        </div>
    )
}
