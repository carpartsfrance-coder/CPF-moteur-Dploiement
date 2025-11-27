import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim();
    const phone = String(b.phone || '').trim();
    const vehicleId = String(b.vehicleId || '').trim();
    const message = String(b.message || '').trim();
    const source = String(b.source || '').trim();
    const createdAt = String(b.createdAt || new Date().toISOString());

    if (!vehicleId || (!phone && !email)) {
      return res.status(400).json({ ok: false, error: 'invalid_payload' });
    }

    const ref = 'Q-' + Math.random().toString(16).slice(2, 8).toUpperCase();

    const host = (req?.headers?.host || '').toString();
    const proto = req?.headers?.['x-forwarded-proto'] || 'https';
    const origin = host ? `${proto}://${host}` : (process.env.COMPANY_WEBSITE_URL || 'https://www.cpfmoteur.fr');

    const fromEmail = (process.env.MAILERSEND_FROM_EMAIL || 'contact@cpfmoteur.fr').trim();
    const fromName = (process.env.MAILERSEND_FROM_NAME || 'Car Parts France').trim();
    const toEmail = (process.env.MAILERSEND_TO_EMAIL || fromEmail).trim();
    const replyToEmail = (email || process.env.MAILERSEND_REPLY_TO || fromEmail).trim();

    const subject = `Nouvelle demande de devis ${vehicleId ? '— ' + vehicleId : ''} (${ref})`;
    const plain = [
      'Nouvelle demande de devis',
      `Réf: ${ref}`,
      `Nom: ${name || '—'}`,
      `Email: ${email || '—'}`,
      `Téléphone: ${phone || '—'}`,
      `Identifiant véhicule: ${vehicleId || '—'}`,
      `Message: ${message || '—'}`,
      `Source: ${source || '—'}`,
      `Créé le: ${createdAt}`,
    ].join('\n');

    const html = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;padding:16px;color:#0f172a">`
      + `<h2 style="margin:0 0 10px">Nouvelle demande de devis</h2>`
      + `<div style="margin:8px 0;padding:10px;border:1px solid #e5e7eb;border-left:4px solid #2563eb;border-radius:8px;background:#f8fafc">`
      + `<div><strong>Réf:</strong> ${ref}</div>`
      + `<div><strong>Nom:</strong> ${name || '—'}</div>`
      + `<div><strong>Email:</strong> ${email || '—'}</div>`
      + `<div><strong>Téléphone:</strong> ${phone || '—'}</div>`
      + `<div><strong>Identifiant véhicule:</strong> ${vehicleId || '—'}</div>`
      + `<div><strong>Message:</strong> ${message || '—'}</div>`
      + `<div><strong>Source:</strong> ${source || '—'}</div>`
      + `<div><strong>Créé le:</strong> ${createdAt}</div>`
      + `</div>`
      + `<div style="margin-top:12px"><img src="${origin}/images/logo.png" alt="Car Parts France" style="height:28px"/></div>`
      + `</body></html>`;

    const apiKey = (process.env.MAILERSEND_API_KEY || '').trim();
    if (!apiKey) return res.status(500).json({ ok: false, error: 'missing_mailersend_key' });

    const mailer = new MailerSend({ apiKey });
    const emailParams = new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(toEmail, 'Car Parts France')])
      .setSubject(subject)
      .setHtml(html)
      .setText(plain)
      .setReplyTo(new Sender(replyToEmail, name || replyToEmail));

    await mailer.email.send(emailParams);

    if (email) {
      const userSubject = `Nous avons bien reçu votre demande de devis (${ref})`;
      const userPlain = [
        'Merci, nous avons bien reçu votre demande.',
        `Réf: ${ref}`,
        `Identifiant véhicule: ${vehicleId || '—'}`,
        `Message: ${message || '—'}`,
        'Notre équipe revient vers vous sous 24h ouvrées.'
      ].join('\n');
      const userHtml = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;padding:16px;color:#0f172a">`
        + `<h2 style=\"margin:0 0 10px\">Merci, nous avons bien reçu votre demande</h2>`
        + `<div style="margin:8px 0;padding:10px;border:1px solid #e5e7eb;border-left:4px solid #2563eb;border-radius:8px;background:#f8fafc">`
        + `<div><strong>Réf:</strong> ${ref}</div>`
        + `<div><strong>Identifiant véhicule:</strong> ${vehicleId || '—'}</div>`
        + `<div><strong>Message:</strong> ${message || '—'}</div>`
        + `<div>Notre équipe revient vers vous sous 24h ouvrées.</div>`
        + `</div>`
        + `<div style="margin-top:12px"><img src="${origin}/images/logo.png" alt="Car Parts France" style="height:28px"/></div>`
        + `</body></html>`;
      const userParams = new EmailParams()
        .setFrom(new Sender(fromEmail, fromName))
        .setTo([new Recipient(email, name || 'Client')])
        .setSubject(userSubject)
        .setHtml(userHtml)
        .setText(userPlain)
        .setReplyTo(new Sender(fromEmail, fromName));
      try { await mailer.email.send(userParams); } catch {}
    }

    return res.json({ ok: true, ref });
  } catch (err: any) {
    console.error('[vercel quote-request] error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
}
