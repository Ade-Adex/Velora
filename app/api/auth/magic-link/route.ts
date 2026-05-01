// /app/api/auth/magic-link/route.ts



import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateMagicToken } from '@/app/services/auth-service'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email, requestedRole } = await req.json()
    const token = await generateMagicToken(email, requestedRole)

    const shopDomain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const magicLink = `${protocol}://${shopDomain}/auth/verify?token=${token}`
    
    await resend.emails.send({
      /**
       * PROFESSIONAL MOVE: Use a subdomain for the "From" address.
       * This keeps your church project and shop project emails separate
       * in the eyes of spam filters.
       */
      from: 'Velora <no-reply@mail.christbcogbomoso.org>',
      to: email,
      subject: 'Your Magic Link for Velora',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #171717;">Welcome to Velora<span style="color: #FF8A00;">.</span></h2>
          <p style="color: #444;">Click the button below to sign in to your account. This link expires in 15 minutes.</p>
          <div style="margin: 30px 0;">
            <a href="${magicLink}" style="background: #0052CC; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Sign In to Velora
            </a>
          </div>
          <p style="color: #888; font-size: 12px;">If the button doesn't work, copy and paste this link:</p>
          <p style="color: #0052CC; font-size: 11px; word-break: break-all;">${magicLink}</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `A secure link has been sent to your email.`,
    })
  } catch (error) {
    console.error('Resend Error:', error)
    return NextResponse.json(
      { error: 'We could not send the magic link.' },
      { status: 500 },
    )
  }
}
