const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a magic link to the student's MANIT email.
 * The link points to GET /api/auth/verify?token=<uuid>
 * Backend verifies → deletes verificationToken → creates anonymousUser → redirects to frontend.
 */
const sendMagicLink = async (email, token) => {
  // MAGIC_LINK_BASE_URL points to the FRONTEND /auth/callback page.
  // The frontend then calls GET /api/auth/verify?token=... via axios.
  // This prevents email client URL-scanners from consuming the token prematurely.
  const baseUrl = process.env.MAGIC_LINK_BASE_URL || `${process.env.FRONTEND_URL}/auth/callback`;
  const url = `${baseUrl}?token=${token}`;


  const mailOptions = {
    from: `"CampusVani AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your CampusVani Magic Link (expires in 15 mins)',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: auto; background: #0F172A; color: #E2E8F0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">CampusVani AI</h1>
          <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">MANIT Bhopal · Verified Anonymous</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px;">
          <p style="font-size: 16px; margin: 0 0 24px; line-height: 1.6;">Hello student,</p>
          <p style="font-size: 15px; color: #94A3B8; line-height: 1.7; margin: 0 0 32px;">
            You requested to access CampusVani AI. Click the button below to verify your identity. 
            Once clicked, your email will be <strong style="color: #A5B4FC;">permanently deleted</strong> from our system — 
            you'll be completely anonymous.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 0 0 32px;">
            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; letter-spacing: 0.3px;">
              Verify &amp; Post Anonymously →
            </a>
          </div>
          
          <!-- Warning -->
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 16px; margin: 0 0 24px;">
            <p style="margin: 0; font-size: 13px; color: #FCD34D;">
              ⏱️ This link expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email safely.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.6;">
            Link not working? Copy and paste this URL into your browser:<br/>
            <span style="color: #818CF8; word-break: break-all;">${url}</span>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #1E293B; padding: 20px 40px; text-align: center; border-top: 1px solid #334155;">
          <p style="margin: 0; font-size: 11px; color: #64748B;">
            CampusVani AI · Made for MANIT Bhopal students · Zero PII stored after verification
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendMagicLink };
