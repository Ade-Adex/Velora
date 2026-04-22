// /app/api/auth/magic-link/route.ts


import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateMagicToken } from '@/app/services/auth-service'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    const token = await generateMagicToken(email)

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'
    const magicLink = `${protocol}://${domain}/auth/verify?token=${token}`

    await resend.emails.send({
      /**
       * CORRECTION: When unverified, you MUST use this exact email address.
       * You can still use the "Velora" name prefix.
       */
      from: 'Velora <onboarding@resend.dev>',
      to: email, 
      subject: 'Your Magic Link for Velora',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to Velora.</h2>
          <p>Click the button below to sign in to your account. This link expires in 15 minutes.</p>
          <div style="margin: 30px 0;">
            <a href="${magicLink}" style="background: #0052CC; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Sign In to Velora
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `A secure link has been sent to your email. Please check your inbox.`,
    })
  } catch (error) {
    console.error('Resend Error:', error)
    return NextResponse.json(
      { error: 'We could not send the magic link. Please try again later.' },
      { status: 500 },
    )
  }
}