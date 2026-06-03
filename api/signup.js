const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, club } = req.body

  if (!name || !email || !club) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const { error: dbError } = await supabase
    .from('Signups')
    .insert([{ Name: name, Email: email, Club: club }])

  if (dbError) {
    return res.status(500).json({ error: dbError.message })
  }

  await resend.emails.send({
    from: 'FairToWay <info@fairtoway.dk>',
    to: email,
    subject: 'Du er med i bevægelsen – FairToWay',
    html: `<!DOCTYPE html><html><body style="background:#0a1f0f;font-family:Arial,sans-serif;padding:40px 20px;"><table width="600" style="max-width:600px;margin:0 auto;background:#122b18;border-radius:16px;overflow:hidden;"><tr><td style="padding:48px;border-bottom:1px solid rgba(242,237,228,0.08);"><span style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#f2ede4;">Fair<span style="color:#c9a070;">To</span>Way</span><h1 style="font-family:Georgia,serif;font-size:28px;color:#f2ede4;margin:24px 0 12px;">Du er med i<br><em style="color:#c9a070;">bevægelsen</em></h1><p style="color:rgba(242,237,228,0.6);font-size:15px;line-height:1.7;margin:0;">Tak fordi du har vist din interesse.</p></td></tr><tr><td style="padding:40px 48px;"><p style="color:rgba(242,237,228,0.7);font-size:15px;line-height:1.8;margin:0 0 20px;">Hej ${name},</p><p style="color:rgba(242,237,228,0.7);font-size:15px;line-height:1.8;margin:0 0 20px;">Vi har modtaget din tilmelding fra ${club}. Du er nu en del af en gruppe golfspillere der ønsker et mere fleksibelt medlemskab med adgang til flere baner og flere tee times.</p><p style="color:rgba(242,237,228,0.7);font-size:15px;line-height:1.8;margin:0 0 32px;">Når vi er klar til at gå i dialog med klubberne, er du blandt de første der hører fra os.</p><div style="background:rgba(139,94,60,0.12);border:1px solid rgba(201,160,112,0.2);border-radius:12px;padding:24px;"><p style="font-family:Georgia,serif;font-size:16px;font-style:italic;color:#f2ede4;line-height:1.7;margin:0;">"Vi vil ikke møde op med en idé.<br>Vi vil møde op med <strong style="color:#c9a070;font-style:normal;">jeres opbakning.</strong>"</p><p style="font-size:12px;color:rgba(242,237,228,0.4);margin:12px 0 0;text-transform:uppercase;letter-spacing:0.06em;">Næste milepæl: 500 golfspillere</p></div></td></tr><tr><td style="background:rgba(0,0,0,0.2);padding:24px 48px;border-top:1px solid rgba(242,237,228,0.06);"><span style="font-family:Georgia,serif;font-size:16px;font-weight:bold;color:rgba(242,237,228,0.3);">Fair<span style="color:rgba(201,160,112,0.5);">To</span>Way</span></td></tr></table></body></html>`
  })

  await resend.emails.send({
    from: 'FairToWay <info@fairtoway.dk>',
    to: 'info@fairtoway.dk',
    subject: `Ny tilmelding: ${name} fra ${club}`,
    html: `<p><strong>Navn:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Klub:</strong> ${club}</p>`
  })

  return res.status(200).json({ success: true })
}
