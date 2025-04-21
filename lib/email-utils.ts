import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "Masterin <noreply@masterin.app>",
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Verify Your Email Address</h1>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; font-size: 14px;">${verificationUrl}</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending verification email:", error)
      throw new Error("Failed to send verification email")
    }

    return data
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error)
    throw error
  }
}

export async function sendVerificationStatusEmail(email: string, status: "approved" | "rejected", reason?: string) {
  try {
    const subject =
      status === "approved"
        ? "Your Educator Verification Request Has Been Approved"
        : "Your Educator Verification Request Has Been Rejected"

    let html = ""

    if (status === "approved") {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Verification Approved</h1>
          <p>Congratulations! Your educator verification request has been approved.</p>
          <p>You now have access to all educator features on our platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
          </div>
          <p>Thank you for being part of our educator community!</p>
        </div>
      `
    } else {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Verification Not Approved</h1>
          <p>We're sorry, but your educator verification request has not been approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>You can submit a new verification request with additional information or documentation.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/educator/verification/appeal" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Submit Appeal</a>
          </div>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      `
    }

    const { data, error } = await resend.emails.send({
      from: "Masterin <noreply@masterin.app>",
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error("Error sending verification status email:", error)
      throw new Error("Failed to send verification status email")
    }

    return data
  } catch (error) {
    console.error("Error in sendVerificationStatusEmail:", error)
    throw error
  }
}
