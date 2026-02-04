import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import buildReplyEmailHtml from '../../server/emailTemplate.js';

const renderEmail = buildReplyEmailHtml as (options: any) => string;

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

    if (!vehicleId || !phone) {
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

    const html = renderEmail({
      subject,
      toName: 'Équipe Car Parts France',
      message: [
        'Nouvelle demande de devis.',
        `Réf: ${ref}`,
        `Nom: ${name || '—'}`,
        `Email: ${email || '—'}`,
        `Téléphone: ${phone || '—'}`,
        `Identifiant véhicule: ${vehicleId || '—'}`,
        `Message: ${message || '—'}`,
        `Source: ${source || '—'}`,
        `Créé le: ${createdAt}`,
      ].join('\n'),
      companyName: 'Car Parts France',
      websiteUrl: process.env.COMPANY_WEBSITE_URL || origin,
      supportEmail: fromEmail,
      logoUrl: `${origin}/images/logo.png`,
    });

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
      const socialLogos = [
        { src: `${origin}/images/partners/logo-porsche.webp`, alt: 'Centre Porsche Toulon' },
        { src: `${origin}/images/partners/mougins-autosport.webp`, alt: 'Mougins Autosport' },
        { src: `${origin}/images/partners/sun-motors.webp`, alt: 'Sun Motors' },
      ];
      const userMessage = [
        'Merci pour votre confiance, votre dossier passe en priorité auprès de notre équipe.',
        `Réf: ${ref}`,
        `Identifiant véhicule: ${vehicleId || '—'}`,
        `Message transmis: ${message || '—'}`,
        'Nous revenons vers vous sous 24h ouvrées avec un devis détaillé (garantie 12 mois + rapport de tests).'
      ].join('\n');
      const userPlain = `${userMessage}\n\nÉtapes suivantes :\n1) Validation compatibilité (VIN / plaque)\n2) Rapport de tests envoyé pour validation finale\n3) Organisation de l’expédition assurée (72h à 14 jours)`;
      const nextSteps = [
        'Validation de la compatibilité à partir de votre plaque / VIN et disponibilité stock.',
        'Envoi du rapport de tests (compression, endoscopie, capteurs) pour validation finale.',
        'Organisation de l’expédition assurée (72h à 14 jours) avec suivi WhatsApp et prise de rendez-vous.'
      ];
      const replyNotice = 'Vous pouvez répondre directement à cet e-mail ou utiliser les coordonnées ci-dessous.';
      const replyOptions = {
        phone: '04 65 84 54 88',
        whatsapp: 'https://wa.me/33756875025'
      };
      const testsPageUrl = `${process.env.COMPANY_WEBSITE_URL || origin}/tests-moteurs`;
      const companyInfo = {
        instagramUrl: 'https://www.instagram.com/carpartsfrance/'
      };
      const details = {
        reference: ref,
        delivery: 'Devis détaillé sous 24h ouvrées, expédition 72h à 14 jours (assurance casse/perte)'
      };
      const userHtml = renderEmail({
        subject: userSubject,
        toName: name || '',
        message: userMessage,
        companyName: 'Car Parts France',
        websiteUrl: process.env.COMPANY_WEBSITE_URL || origin,
        supportEmail: fromEmail,
        logoUrl: `${origin}/images/logo.png`,
        socialProof: { logos: socialLogos },
        nextSteps,
        testsPageUrl,
        details,
        replyNotice,
        replyOptions,
        companyInfo,
      });
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
