/**
 * DRINK STOP — Order API (Vercel Serverless Function)
 *
 * Receives orders from order.html and sends an email notification.
 *
 * Setup:
 *   1. Sign up at https://resend.com (free, 100 emails/day)
 *   2. Verify your domain (or use sandbox@resend.dev for testing)
 *   3. Create an API key in Resend dashboard
 *   4. Add to Vercel: `vercel env add RESEND_API_KEY`
 *      Or via dashboard: Project → Settings → Environment Variables
 *   5. Update the `from` address below once your domain is verified
 *
 * Testing locally: `vercel dev` will serve the API at localhost:3000/api/order
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.FROM_EMAIL || 'DRINK STOP Orders <orders@drinkstop.co.uk>';
const TO_ADDRESS = process.env.NOTIFY_EMAIL || 'hello@drinkstop.co.uk';

export default async function handler(req, res) {
  // CORS headers for cross-origin requests (local dev, preview deployments)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order, summary, timestamp, source } = req.body || {};

  if (!summary) {
    return res.status(400).json({ error: 'Missing order summary' });
  }

  // Always log the order (available in Vercel dashboard → Project → Functions → Logs)
  console.log('--- NEW ORDER ---');
  console.log(summary);
  console.log('Submitted at:', timestamp || new Date().toISOString());
  console.log('Source:', source || 'unknown');
  console.log('-----------------');

  const emailSent = await sendEmailNotification(summary, order);

  return res.status(200).json({
    success: true,
    emailSent,
    message: emailSent
      ? 'Order received and notified'
      : 'Order received (email notification not configured — see api/order.mjs for setup)',
  });
}

async function sendEmailNotification(summary, order) {
  if (!RESEND_API_KEY) {
    console.warn(
      '⚠ RESEND_API_KEY not set. To enable email notifications:\n' +
      '  1. Sign up at https://resend.com\n' +
      '  2. Add RESEND_API_KEY to Vercel env vars\n' +
      '  3. (optional) Set FROM_EMAIL and NOTIFY_EMAIL'
    );
    return false;
  }

  try {
    const name = order?.name || 'Customer';
    const email = order?.email || '—';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: TO_ADDRESS,
        subject: `New DRINK STOP order from ${name}`,
        reply_to: email,
        text: summary,
        html: htmlEmail(summary, order),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend API error:', response.status, err);
      return false;
    }

    console.log('✓ Email notification sent to', TO_ADDRESS);
    return true;
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return false;
  }
}

function htmlEmail(summary, order) {
  const lines = summary.split('\n').filter(Boolean);
  const items = lines.map(l => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:14px">${escapeHtml(l)}</td></tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fffbe6;font-family:Manrope,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;border:3px solid #0a0a0a;overflow:hidden">
      <tr><td style="background:#00ef02;padding:28px 32px;text-align:center;font-family:Arial Black,Impact,sans-serif;font-size:28px;text-transform:uppercase;letter-spacing:-.02em;line-height:1;color:#0a0a0a">
        🍹 DRINK STOP<br><span style="font-size:14px;font-weight:700;font-family:Manrope,sans-serif;letter-spacing:.08em">NEW ORDER</span>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <table width="100%" cellpadding="0" cellspacing="0">${items}</table>
      </td></tr>
      <tr><td style="padding:0 32px 24px;text-align:center;font-size:12px;color:#888">
        <a href="mailto:${escapeHtml(order?.email||'')}" style="color:#0a0a0a;font-weight:700">Reply to customer</a>
        &nbsp;·&nbsp; DRINK STOP · Please drink responsibly · 18+
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

function escapeHtml(s) {
  return ('' + s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
