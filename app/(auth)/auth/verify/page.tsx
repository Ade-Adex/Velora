'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
// import { useApp } from '@/app/context/AppContext'
import { useUserStore } from '@/app/store/useUserStore' // 1. Import the User Store

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { enqueueSnackbar } = useSnackbar()

  // 2. Extract setUser from Zustand instead of useApp
  const setUser = useUserStore((state) => state.setUser)
  // const { setIsLoading } = useApp()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const hasCalled = useRef(false)

  useEffect(() => {
    if (hasCalled.current) return
    hasCalled.current = true

    const verifyToken = async () => {
      if (!token) {
        setStatus('error')
        enqueueSnackbar('Invalid or missing token.', { variant: 'error' })
        return
      }

      try {
        const res = await fetch(`/api/auth/verify?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          // 3. This now calls the persistent Zustand store
          setUser(data.user)
          enqueueSnackbar('Successfully signed in!', { variant: 'success' })

          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          enqueueSnackbar(data.error || 'Link expired or already used.', {
            variant: 'error',
          })
        }
      } catch (err) {
        setStatus('error')
        enqueueSnackbar('Connection error.', { variant: 'error' })
      }
    }

    verifyToken()
  }, [token, router, enqueueSnackbar, setUser])

  return (
    <div className="w-full max-w-md text-center space-y-6">
      {status === 'loading' && (
        <div className="animate-in fade-in duration-500">
          <Loader2 className="w-12 h-12 text-[#0052CC] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold italic">
            Velora<span className="text-[#FF8A00]">.</span>
          </h2>
          <h3 className="text-xl font-semibold">Verifying your link...</h3>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-in zoom-in duration-500">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        </div>
      )}

      {status === 'error' && (
        <div className="animate-in shake duration-500">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            Verification Failed
          </h2>
          <button
            onClick={() => router.push('/auth')}
            className="mt-4 bg-[#0052CC] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0041a3] transition-colors"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  )
}

// Main Page Component
export default function VerifyPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#0052CC] animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">
              Loading verification session...
            </p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  )
}
