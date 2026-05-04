const nodemailer = require("nodemailer");

/**
 * Cria o transporter conforme as variáveis de ambiente.
 *
 * Variáveis necessárias no .env:
 *   EMAIL_HOST     — ex: smtp.gmail.com
 *   EMAIL_PORT     — ex: 587
 *   EMAIL_USER     — ex: seuemail@gmail.com
 *   EMAIL_PASS     — senha de app do Gmail (ou senha SMTP)
 *   EMAIL_FROM     — ex: "LiftNote <seuemail@gmail.com>"
 *   APP_URL        — ex: http://localhost:5173  (URL do front-end)
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465", // true só para port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Envia o e-mail de recuperação de senha.
 * @param {string} toEmail  - E-mail do destinatário
 * @param {string} token    - Token de reset gerado pelo authService
 */
async function sendPasswordReset(toEmail, token) {
  const transporter = createTransporter();

  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const resetLink = `${appUrl}/auth?reset=${token}`;

  const from =
    process.env.EMAIL_FROM || `"LiftNote" <${process.env.EMAIL_USER}>`;

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: "🔑 Redefinição de senha — LiftNote",
    text: `Você solicitou a redefinição de senha.\n\nClique no link abaixo para criar uma nova senha (válido por 30 minutos):\n\n${resetLink}\n\nSe não foi você, ignore este e-mail.`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#1f1f1f;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#c8f135;padding:28px 32px;text-align:center;">
              <div style="font-size:13px;font-weight:800;letter-spacing:4px;color:#192126;">LIFTNOTE</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f0f0f0;line-height:1.3;">
                Redefinição de senha
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#999;line-height:1.7;">
                Recebemos uma solicitação para redefinir a senha da sua conta LiftNote. Clique no botão abaixo para criar uma nova senha.
              </p>
              <p style="margin:0 0 28px;font-size:13px;color:#666;">
                ⏱ Este link expira em <strong style="color:#f0f0f0;">30 minutos</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}"
                       style="display:inline-block;background:#c8f135;color:#192126;font-size:14px;font-weight:800;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.5px;">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#555;line-height:1.6;">
                Se você não solicitou a redefinição de senha, apenas ignore este e-mail — sua senha permanece a mesma.
              </p>

              <!-- Fallback link -->
              <p style="margin:16px 0 0;font-size:11px;color:#555;">
                Ou cole este link no navegador:<br/>
                <a href="${resetLink}" style="color:#c8f135;word-break:break-all;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:#444;">
                LiftNote · Track. Train. Evolve.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
}

module.exports = { sendPasswordReset };
