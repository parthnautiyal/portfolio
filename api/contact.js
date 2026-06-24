export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, message, attachment } = req.body || {}

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  // Requires EMAIL_USER and EMAIL_PASS (Gmail App Password) env vars on Vercel
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailUser || !emailPass) {
    console.error('EMAIL_USER or EMAIL_PASS not configured')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  try {
    const { createTransport } = await import('nodemailer')

    const transporter = createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    })

    const mailOptions = {
      from: `"Portfolio Contact" <${emailUser}>`,
      to: emailUser,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr/>
        <p>${message.replace(/\n/g, '<br/>')}</p>
        ${attachment ? `<p><em>Attachment: ${attachment.name}</em></p>` : ''}
      `,
      attachments: [],
    }

    if (attachment?.data && attachment?.name) {
      const buf = Buffer.from(attachment.data, 'base64')
      // Basic sanity: reject if buffer is huge (shouldn't happen given client limit)
      if (buf.byteLength > 4 * 1024 * 1024) {
        return res.status(413).json({ error: 'Attachment too large.' })
      }
      mailOptions.attachments.push({
        filename: attachment.name,
        content: buf,
        contentType: attachment.mimeType || 'application/octet-stream',
      })
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to send email:', err)
    return res.status(500).json({ error: 'Failed to send message' })
  }
}
