// /app/%28auth%29/auth/page.tsx

'use client'

import { useEffect, useState, Suspense } from 'react'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useSnackbar } from 'notistack'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserStore } from '@/app/store/useUserStore'
import Link from 'next/link'

function AuthContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const { enqueueSnackbar } = useSnackbar()

  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useUserStore((state) => state.setUser)

  // Detect if the user clicked the "Register as Vendor" link
  const isVendorIntent = searchParams.get('type') === 'vendor'

  useEffect(() => {
    // Listen for successful login in other tabs (Broadcast Channel)
    const authChannel = new BroadcastChannel('velora_auth')

    authChannel.onmessage = (event) => {
      if (event.data.type === 'LOGIN_SUCCESS') {
        const userData = event.data.user
        setUser(userData)

        enqueueSnackbar('Verified in another tab! Redirecting...', {
          variant: 'success',
        })

        setTimeout(() => {
          // Multi-Role Redirection Logic
          switch (userData.role) {
            case 'admin':
            case 'editor':
              router.push('/admin')
              break
            case 'vendor':
              router.push('/vendor')
              break
            default:
              router.push('/')
          }
        }, 1000)
      }
    }

    return () => authChannel.close()
  }, [router, setUser, enqueueSnackbar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          // Pass the intent to the backend
          requestedRole: isVendorIntent ? 'vendor' : 'customer' 
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSent(true)
        setServerMessage(data.message)
        enqueueSnackbar(data.message, { variant: 'success' })
      } else {
        enqueueSnackbar(data.error || 'Something went wrong', {
          variant: 'error',
        })
      }
    } catch (err) {
      enqueueSnackbar('Network error. Please try again.', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-500 rounded-full shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Check your email</h2>
            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">{serverMessage}</p>
          </div>
          <button
            onClick={() => setIsSent(false)}
            className="text-[#0052CC] font-bold text-sm hover:text-blue-700 transition-colors bg-blue-50 px-6 py-2 rounded-full"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6">
      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-10 transition-all">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-black italic tracking-tighter">
            Velora<span className="text-[#FF8A00]">.</span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            {isVendorIntent ? 'Create your Vendor Account' : 'Sign in or create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0052CC] transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-[#0052CC]/20 focus:ring-4 focus:ring-[#0052CC]/5 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#0052CC] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-[#0041a3] hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                {isVendorIntent ? 'Register as Vendor' : 'Continue'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-gray-100"></div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Secure Access</span>
          <div className="h-[1px] flex-1 bg-gray-100"></div>
        </div>
      </div>

      {/* Conditional Vendor CTA */}
      {!isVendorIntent ? (
        <div className="mt-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="bg-[#F8FAFC] border border-gray-100 rounded-3xl p-6 flex items-center justify-between group hover:border-blue-100 transition-all">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900">Want to sell on Velora?</p>
              <p className="text-xs text-gray-500 font-medium">Join our marketplace today.</p>
            </div>
            <Link 
              href="/auth?type=vendor" 
              className="bg-white text-[#0052CC] text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 hover:bg-[#0052CC] hover:text-white transition-all"
            >
              Register as Vendor
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <Link href="/auth" className="text-xs font-bold text-gray-400 hover:text-[#0052CC] transition-colors uppercase tracking-widest">
            Back to Customer Login
          </Link>
        </div>
      )}
      
      <p className="text-center mt-12 text-[11px] text-gray-400 font-medium tracking-wide">
        &copy; {new Date().getFullYear()} Velora Marketplace. All rights reserved.
      </p>
    </div>
  )
}

// Wrapper to handle Suspense for useSearchParams
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
      }
