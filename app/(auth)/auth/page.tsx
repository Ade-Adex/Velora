// /app/%28auth%29/auth/page.tsx


'use client'
import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useSnackbar } from 'notistack'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [serverMessage, setServerMessage] = useState('') 
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          {/* Use the dynamic server message here */}
          <p className="text-gray-500 max-w-xs mx-auto">{serverMessage}</p>
          <button
            onClick={() => setIsSent(false)}
            className="text-[#0052CC] font-semibold text-sm hover:underline"
          >
            Try a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-black italic">
            Velora<span className="text-[#FF8A00]">.</span>
          </h1>
          <p className="text-gray-500 mt-2">Sign in or create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-[#F4F7FA] border-none rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#0052CC] transition-all"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#0052CC] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? (
              'Sending link...'
            ) : (
              <>
                Continue <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
