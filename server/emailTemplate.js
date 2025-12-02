// Email template builder for professional HTML emails
// ESM module

const escapeHtml = (unsafe = '') =>
  String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const buildReplyEmailHtml = ({
  companyName = 'Car Parts France',
  logoUrl = '',
  brandColor = '#e63946', // Rouge primaire du site (fallback)
  primaryColor = '#e63946',
  primaryLight = '#ff6b6b',
  secondaryColor = '#1d3557',
  textPrimary = '#212529',
  subject = 'Réponse à votre devis - Car Parts France',
  toName = '',
  message = '',
  websiteUrl = '',
  supportEmail = '',
  details = undefined,
  companyInfo = undefined,
  replyLink = '',
  replyNotice = '',
  replyOptions = undefined,
  socialProof = undefined,
  nextSteps = undefined,
  testsPageUrl = '',
} = {}) => {
  const rawMessage = String(message || '');
  const safeMessage = escapeHtml(rawMessage).replace(/\n/g, '<br />');
  const safeToName = escapeHtml(toName || '');
  const safeCompany = escapeHtml(companyName);
  const baseWebsite = String(websiteUrl || '').trim();
  const testUrl = String(testsPageUrl || '').trim();
  const buttonUrl = testUrl || baseWebsite;
  const buttonLabel = testUrl ? 'Voir les tests moteurs' : 'Visiter notre site';

  // Couleurs finales (compatibilité: si primaryColor non fourni, on tombe sur brandColor)
  const PRIMARY = primaryColor || brandColor || '#e63946';
  const PRIMARY_LIGHT = primaryLight || '#ff6b6b';
  const SECONDARY = secondaryColor || '#1d3557';
  const TEXT = textPrimary || '#212529';
  const GREY_100 = '#f8f9fa';
  const GREY_200 = '#e9ecef';
  const TINT_PRIMARY = '#fff5f5';
  const TINT_SECONDARY = '#f2f6ff';

  // Détecte si le message commence déjà par une salutation (pour éviter le doublon)
  const startsWithGreeting = /^\s*(bonjour|bonsoir|bsr)/i.test(rawMessage);

  // Formatage léger pour prix et kilométrage
  const formatPrice = (v) => {
    if (v === undefined || v === null) return '';
    const str = String(v).trim();
    if (!str) return '';
    // Si déjà avec €, ne pas doubler
    if (/€/.test(str)) return escapeHtml(str);
    const num = Number(String(str).replace(/\s+/g, '').replace(',', '.'));
    if (!isFinite(num)) return escapeHtml(str) + ' €';
    return escapeHtml(num.toLocaleString('fr-FR', { minimumFractionDigits: (String(str).includes('.') || String(str).includes(',')) ? 2 : 0, maximumFractionDigits: 2 })) + ' €';
  };
  const formatKm = (v) => {
    if (v === undefined || v === null) return '';
    const str = String(v).trim();
    if (!str) return '';
    if (/km/i.test(str)) return escapeHtml(str);
    const num = Number(String(str).replace(/\s+/g, '').replace(',', '.'));
    if (!isFinite(num)) return escapeHtml(str) + ' km';
    return escapeHtml(num.toLocaleString('fr-FR')) + ' km';
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
  <style>
    /* Reset basique */
    body { margin: 0; padding: 0; background-color: ${GREY_100}; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; max-width: 100%; }
    table { border-collapse: collapse; }
    /* Container */
    .wrapper { width: 100%; background-color: ${GREY_100}; padding: 24px 0; }
    .container { width: 100%; max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08); border: 1px solid ${GREY_200}; }
    /* Header */
    .header { background: #ffffff; border-top: 4px solid ${PRIMARY}; padding: 20px 24px; color: ${SECONDARY}; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid ${GREY_200}; }
    .accent { height: 3px; width: 100%; background: linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%); }
    .accent--muted { background: linear-gradient(90deg, ${SECONDARY} 0%, ${PRIMARY} 100%); opacity: 0.2; }
    .brand { font-size: 18px; font-weight: 700; letter-spacing: 0.2px; color: ${SECONDARY}; }
    .logo { height: 36px; width: auto; display: block; }
    /* Body */
    .body { padding: 24px; color: ${TEXT}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'; }
    h1 { font-size: 20px; margin: 0 0 16px; color: ${SECONDARY}; }
    p { margin: 0 0 12px; line-height: 1.6; }
    .card { background: #ffffff; border: 1px solid ${GREY_200}; border-radius: 16px; padding: 16px; margin: 16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .cta { display: inline-block; background: linear-gradient(45deg, ${PRIMARY} 30%, ${PRIMARY_LIGHT} 90%); background-color: ${PRIMARY}; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600; box-shadow: 0 6px 14px rgba(230,57,70,0.25); }
    .cta:link, .cta:visited { color: #ffffff !important; text-decoration: none !important; }
    .divider { height: 1px; background: ${GREY_200}; margin: 16px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: ${TINT_PRIMARY}; border: 1px solid ${PRIMARY_LIGHT}; color: ${SECONDARY}; font-size: 12px; font-weight: 700; letter-spacing: .2px; margin: 6px 0 12px; }
    .next-steps { margin: 16px 0; border: 1px solid ${GREY_200}; border-radius: 12px; padding: 14px 18px; background: ${TINT_SECONDARY}; }
    .next-steps__title { font-weight: 700; color: ${SECONDARY}; margin-bottom: 8px; }
    .next-steps__list { padding-left: 18px; margin: 0; color: ${TEXT}; }
    .next-steps__list li { margin-bottom: 6px; line-height: 1.5; }
    /* Details (table pour compatibilité clients mail) */
    .details { margin-top: 16px; border: 1px solid ${GREY_200}; border-radius: 12px; overflow: hidden; }
    .details__head { background: ${TINT_PRIMARY}; padding: 12px 16px; font-weight: 700; color: ${SECONDARY}; border-bottom: 1px solid ${GREY_200}; border-left: 4px solid ${PRIMARY}; }
    .details__table { width: 100%; border-collapse: collapse; }
    .details__table td { padding: 10px 16px; border-bottom: 1px solid ${GREY_200}; vertical-align: top; }
    .details__table tr:last-child td { border-bottom: 0; }
    .details__label { width: 48%; max-width: 260px; color: #475569; }
    .details__value { font-weight: 600; color: ${TEXT}; }
    /* Items (articles proposés) */
    .items { margin-top: 16px; border: 1px solid ${GREY_200}; border-radius: 12px; overflow: hidden; }
    .items__head { background: ${TINT_PRIMARY}; padding: 12px 16px; font-weight: 700; color: ${SECONDARY}; border-bottom: 1px solid ${GREY_200}; border-left: 4px solid ${PRIMARY}; }
    .items__table { width: 100%; border-collapse: collapse; }
    .items__table th, .items__table td { padding: 10px 12px; border-bottom: 1px solid ${GREY_200}; text-align: left; font-size: 14px; }
    .items__table th { color: #475569; font-weight: 700; background: ${TINT_SECONDARY}; }
    .items__table tr:nth-child(even) td { background: #fafafa; }
    .items__table tr:last-child td { border-bottom: 0; }
    .items__mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 13px; }
    /* Signature */
    .signature { margin-top: 18px; padding: 12px 16px; border: 1px dashed ${GREY_200}; border-radius: 12px; color: #475569; font-size: 13px; }
    .signature__name { font-weight: 700; color: ${SECONDARY}; }
    .signature__row { margin: 2px 0; }
    .signature a { color: ${SECONDARY}; text-decoration: none; }
    /* Tests & Défaut constaté */
    .tests, .defect { margin-top: 16px; border: 1px solid ${GREY_200}; border-radius: 12px; overflow: hidden; }
    .tests__head, .defect__head { background: ${TINT_PRIMARY}; padding: 12px 16px; font-weight: 700; color: ${SECONDARY}; border-bottom: 1px solid ${GREY_200}; border-left: 4px solid ${PRIMARY}; }
    .tests__table { width: 100%; border-collapse: collapse; }
    .tests__table td { padding: 10px 16px; border-bottom: 1px solid ${GREY_200}; }
    .tests__table tr:last-child td { border-bottom: 0; }
    .defect__body { padding: 12px 16px; color: ${TEXT}; }
    .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; background: ${TINT_SECONDARY}; border: 1px solid ${GREY_200}; color: ${SECONDARY}; font-size: 12px; font-weight: 700; }
    /* Footer */
    .footer { padding: 18px 24px; color: #475569; font-size: 12px; background: #ffffff; text-align: center; border-top: 1px solid ${GREY_200}; }
    .links a { color: #64748b; text-decoration: none; margin: 0 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <div class="header">
            ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="${safeCompany}" />` : ''}
            <div class="brand">${safeCompany}</div>
          </div>
          <div class="accent"></div>
          <div class="body">
            <h1>${escapeHtml(subject)}</h1>
            <div class="badge">Devis personnalisé</div>
            ${!startsWithGreeting && safeToName ? `<p>Bonjour ${safeToName},</p>` : ''}
            <div class="card">${safeMessage}</div>
            ${Array.isArray(nextSteps) && nextSteps.length ? `
            <div class="next-steps">
              <div class="next-steps__title">Ce qui va se passer ensuite</div>
              <ol class="next-steps__list">
                ${nextSteps.map((step) => `<li>${escapeHtml(String(step))}</li>`).join('')}
              </ol>
            </div>` : ''}
            ${socialProof && Array.isArray(socialProof.logos) && socialProof.logos.length ? `
            <div style="margin-top:14px;border:1px solid ${GREY_200};border-radius:12px;padding:12px 14px;">
              <div style="font-weight:700;color:${SECONDARY};margin-bottom:8px;">Ils nous font confiance</div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                ${socialProof.logos.map(l => `<img src="${escapeHtml(String(l.src))}" alt="${escapeHtml(String(l.alt || ''))}" style="height:28px;max-height:32px;object-fit:contain;display:block;" />`).join('')}
              </div>
            </div>` : ''}
            ${details && (details.price || details.mileageKm || details.delivery || details.reference) ? `
            <div class="details">
              <div class="details__head">Détails de l'offre</div>
              <table class="details__table" role="presentation" cellpadding="0" cellspacing="0">
                ${details.price ? `<tr><td class="details__label">Prix TTC</td><td class="details__value">${formatPrice(details.price)}</td></tr>` : ''}
                ${details.mileageKm ? `<tr><td class="details__label">Kilométrage</td><td class="details__value">${formatKm(details.mileageKm)}</td></tr>` : ''}
                ${details.delivery ? `<tr><td class="details__label">Délai de livraison</td><td class="details__value">${escapeHtml(String(details.delivery))}</td></tr>` : ''}
                ${details.reference ? `<tr><td class="details__label">Référence</td><td class="details__value">${escapeHtml(String(details.reference))}</td></tr>` : ''}
              </table>
            </div>` : ''}
            ${details && Array.isArray(details.items) && details.items.length ? `
            <div class="items">
              <div class="items__head">Articles proposés</div>
              <table class="items__table" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <th>Produit</th>
                  <th>Référence</th>
                  <th>Prix TTC</th>
                  <th>Garantie</th>
                  <th>Disponibilité</th>
                </tr>
                ${details.items.map(it => `
                  <tr>
                    <td>${escapeHtml(String(it.product || '—'))}</td>
                    <td class="items__mono">${escapeHtml(String(it.reference || '—'))}</td>
                    <td>${formatPrice(it.price)}</td>
                    <td>${escapeHtml(String(it.warranty || '—'))}</td>
                    <td>${escapeHtml(String(it.availability || '—'))}</td>
                  </tr>
                `).join('')}
              </table>
            </div>` : ''}
            ${details && Array.isArray(details.testsPerformed) && details.testsPerformed.length ? `
            <div class="tests">
              <div class="tests__head">Tests effectués</div>
              <table class="tests__table" role="presentation" cellpadding="0" cellspacing="0">
                ${details.testsPerformed.map(t => `
                  <tr><td>• ${escapeHtml(String(t))}</td></tr>
                `).join('')}
              </table>
            </div>` : ''}
            ${details && details.defectObserved ? `
            <div class="defect">
              <div class="defect__head">Défaut constaté</div>
              <div class="defect__body">${escapeHtml(String(details.defectObserved)).replace(/\n/g, '<br />')}</div>
            </div>` : ''}
            ${replyNotice || (replyOptions && (replyOptions.phone || replyOptions.whatsapp)) ? `
            <div style="margin-top:16px;border:1px solid ${GREY_200};border-left:4px solid ${PRIMARY};border-radius:12px;background:${TINT_PRIMARY};padding:12px 16px;margin-bottom:10px;">
              <div style="font-weight:700;color:${SECONDARY};margin-bottom:6px;">Pour répondre</div>
              ${replyNotice ? `<div style="color:${TEXT};font-size:14px;line-height:1.5;margin-bottom:8px;">${escapeHtml(String(replyNotice))}</div>` : ''}
              ${(replyOptions && (replyOptions.phone || replyOptions.whatsapp)) ? `
                <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                  ${replyOptions.phone ? `<a href="tel:${escapeHtml(String(replyOptions.phone).replace(/\s+/g,'').replace(/^\+/, ''))}" style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid ${GREY_200};background:#fff;color:${SECONDARY};text-decoration:none;font-weight:700;">📞 ${escapeHtml(String(replyOptions.phone))}</a>` : ''}
                  ${replyOptions.whatsapp ? `<a href="${escapeHtml(String(replyOptions.whatsapp))}" target="_blank" rel="noopener" style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid ${GREY_200};background:#fff;color:${SECONDARY};text-decoration:none;font-weight:700;">💬 WhatsApp</a>` : ''}
                </div>
              ` : ''}
            </div>` : ''}
            
            ${buttonUrl ? `<div style="margin-top:10px;"><a class="cta" href="${escapeHtml(buttonUrl)}" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:none;">${escapeHtml(buttonLabel)}</a></div>` : ''}
            <p style="margin-top:18px;">Bien cordialement,<br>${safeCompany}</p>
            ${companyInfo ? `
            <div class="signature">
              <div class="signature__name">${escapeHtml(String(companyInfo.name || safeCompany))}</div>
              ${companyInfo.siren ? `<div class="signature__row">SIREN/SIRET: ${escapeHtml(String(companyInfo.siren))}</div>` : ''}
              ${companyInfo.phone ? `<div class="signature__row">Téléphone: ${escapeHtml(String(companyInfo.phone))}</div>` : ''}
              ${companyInfo.address ? `<div class="signature__row">Adresse: ${escapeHtml(String(companyInfo.address))}</div>` : ''}
              ${companyInfo.instagramUrl ? `<div class="signature__row">Instagram: <a href="${escapeHtml(String(companyInfo.instagramUrl))}" target="_blank" rel="noopener">${escapeHtml(String(companyInfo.instagramUrl))}</a></div>` : ''}
            </div>` : ''}
          </div>
          <div class="accent accent--muted"></div>
          <div class="footer">
            <div class="links">
              ${websiteUrl ? `<a href="${websiteUrl}" target="_blank" rel="noopener">Site web</a>` : ''}
              ${supportEmail ? `<a href="mailto:${escapeHtml(supportEmail)}">Support</a>` : ''}
            </div>
            <div style="margin-top:8px;">© ${new Date().getFullYear()} ${safeCompany}. Tous droits réservés.</div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};

// ==========================
// Nouveau template (CPF Moteur)
// ==========================
export const buildReplyEmailHtmlV2 = ({
  companyName = 'Car Parts France',
  logoUrl = '',
  subject = 'Réponse à votre devis - Car Parts France',
  toName = '',
  message = '',
  websiteUrl = '',
  supportEmail = '',
  details = undefined,
  companyInfo = undefined,
} = {}) => {
  const safe = (v) => escapeHtml(String(v ?? ''));
  const nl2br = (v) => safe(v).replace(/\n/g, '<br />');
  const rawMessage = String(message || '');
  const hasGreeting = /^\s*(bonjour|bonsoir|bsr)/i.test(rawMessage);

  // Helpers prix / km identiques au template précédent
  const formatPrice = (v) => {
    if (v === undefined || v === null) return '';
    const str = String(v).trim();
    if (!str) return '';
    if (/€/.test(str)) return safe(str);
    const num = Number(String(str).replace(/\s+/g, '').replace(',', '.'));
    if (!isFinite(num)) return safe(str) + ' €';
    return safe(num.toLocaleString('fr-FR', { minimumFractionDigits: (String(str).includes('.') || String(str).includes(',')) ? 2 : 0, maximumFractionDigits: 2 })) + ' €';
  };
  const toNumber = (v) => {
    if (v === undefined || v === null) return NaN;
    const s = String(v).trim();
    if (!s) return NaN;
    const num = Number(s.replace(/\s+/g,'').replace(',', '.').replace(/€/g, ''));
    return Number.isFinite(num) ? num : NaN;
  };

  const d = details || {};
  const clientName = String(toName || '').trim();
  const vehicle = String(d.vehicleId || d.reference || '').trim();
  const engineCode = String(d.engineCode || d.reference || '').trim();
  const configuration = String(d.configuration || (Array.isArray(d.items) && d.items[0]?.product) || '').trim();
  const priceStr = formatPrice(d.price);
  const shipStr = formatPrice(d.deliveryCost);
  const warranty = String(d.warranty || (Array.isArray(d.items) && d.items[0]?.warranty) || '').trim();
  const priceNum = toNumber(d.price);
  const shipNum = toNumber(d.deliveryCost);
  const totalNum = (Number.isFinite(priceNum) ? priceNum : 0) + (Number.isFinite(shipNum) ? shipNum : 0);
  const totalStr = (Number.isFinite(priceNum) || Number.isFinite(shipNum)) ? formatPrice(totalNum) : '';

  const phone = String(companyInfo?.phone || '04 65 84 76 78');
  const siren = String(companyInfo?.siren || '907 510 838');
  const safePhoneLink = phone.replace(/\D+/g, '');
  const brandRightTitle = 'CPF Moteur';

  const headerLogo = logoUrl || 'https://carpartsfrance.fr/wp-content/uploads/2024/08/C-2.png';
  const safeCompany = safe(companyName);

  // Liste de tests (par défaut si rien fourni)
  const tests = Array.isArray(d.testsPerformed) && d.testsPerformed.length
    ? d.testsPerformed
    : ['Contrôle visuel complet', 'Test de compression', 'Inspection interne par endoscopie'];

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safe(subject)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f3f4f6;">
    <div style="max-width: 780px; margin: 32px auto; padding: 14px; border: 3px solid #2f2f2f; border-radius: 12px; background: #e5e7eb; box-sizing: border-box;">
      <table role="presentation" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 18px rgba(15,23,42,0.15);" border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
        <!-- EN-TÊTE -->
        <tr>
          <td style="padding: 18px 26px 12px 26px; background: #ffffff;">
            <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td align="left" valign="middle">
                    ${headerLogo ? `<img style="max-width: 210px; height: auto; display: block;" src="${safe(headerLogo)}" alt="${safeCompany}" />` : ''}
                  </td>
                  <td style="font-size: 12px; color: #111827;" align="right" valign="middle">
                    <div style="text-transform: uppercase; letter-spacing: 0.12em; font-size: 11px; color: #6b7280; margin-bottom: 4px;">${safe(brandRightTitle)}</div>
                    <div style="font-size: 13px; color: #111827;">Service devis moteurs<br /><span style="font-weight: bold; color: #e30613;">${safe(phone)}</span></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <!-- BARRE ACCENT -->
        <tr>
          <td style="padding: 0 26px 8px 26px;">
            <div style="display: inline-block; background: #fee2e2; border-radius: 999px; padding: 4px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #b91c1c; font-weight: bold;">Devis moteur contrôlé</div>
          </td>
        </tr>
        <!-- TITRE / CONTEXTE -->
        <tr>
          <td style="padding: 0 26px 16px 26px; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 8px 0 6px 0; font-size: 20px; color: #111827;">${vehicle ? `Devis moteur pour votre véhicule ${safe(vehicle)}` : safe(subject)}</h1>
            ${clientName ? `<p style="margin: 0; font-size: 13px; color: #6b7280;">Client : <strong>${safe(clientName)}</strong></p>` : ''}
          </td>
        </tr>
        <!-- INTRO + INFOS MOTEUR -->
        <tr>
          <td style="padding: 18px 26px 10px 26px; font-size: 14px; color: #111827; line-height: 1.6;">
            ${!hasGreeting && clientName ? `<p style="margin: 0 0 12px 0;">Bonjour ${safe(clientName)},</p>` : ''}
            ${rawMessage ? `<p style="margin: 0 0 12px 0;">${nl2br(rawMessage)}</p>` : `<p style="margin: 0 0 12px 0;">Suite à votre demande, nous avons identifié le moteur compatible avec votre véhicule.</p>`}
            ${(engineCode || configuration) ? `
            <table style="border-collapse: collapse; margin: 0;" border="0" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                ${engineCode ? `<tr><td style="padding: 4px 0; font-size: 14px;"><span style=\"font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.09em;\"> Code moteur </span><br /><strong style=\"font-size: 15px;\">${safe(engineCode)}</strong></td></tr>` : ''}
                ${configuration ? `<tr><td style="padding: 10px 0 0 0; font-size: 14px;"><span style=\"font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.09em;\"> Configuration </span><br /><strong style=\"font-size: 15px;\">${safe(configuration)}</strong></td></tr>` : ''}
              </tbody>
            </table>` : ''}
          </td>
        </tr>
        <!-- BLOC TARIF + TOTAL -->
        ${(priceStr || shipStr || warranty || totalStr) ? `
        <tr>
          <td style="padding: 6px 26px 16px 26px;">
            <table style="border-radius: 10px; border: 1px solid #e5e7eb; background: #f9fafb;" border="0" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td style="padding: 10px 16px 4px 16px;" colspan="2"><span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; font-weight: bold;"> Détail du devis </span></td>
                </tr>
                ${priceStr ? `<tr><td style=\"padding: 8px 16px; font-size: 14px; color: #111827;\">Moteur contrôlé</td><td style=\"padding: 8px 16px; font-size: 14px; font-weight: bold; color: #b91c1c;\" align=\"right\">${priceStr}</td></tr>` : ''}
                ${shipStr ? `<tr><td style=\"padding: 4px 16px; font-size: 14px; color: #111827;\">Livraison assurée</td><td style=\"padding: 4px 16px; font-size: 14px; font-weight: bold; color: #b91c1c;\" align=\"right\">${shipStr}</td></tr>` : ''}
                ${warranty ? `<tr><td style=\"padding: 4px 16px 10px 16px; font-size: 14px; color: #111827;\">Garantie</td><td style=\"padding: 4px 16px 10px 16px; font-size: 14px; font-weight: bold;\" align=\"right\">${safe(warranty)}</td></tr>` : ''}
                ${(totalStr) ? `<tr><td style=\"border-top: 1px solid #e5e7eb; padding: 10px 16px 12px 16px;\" colspan=\"2\"><table border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr><td style=\"font-size: 13px; color: #4b5563;\"><strong>Total TTC (moteur ${shipStr ? '+ livraison' : ''})</strong></td><td style=\"font-size: 18px; font-weight: bold; color: #e30613;\" align=\"right\">${totalStr}</td></tr></tbody></table></td></tr>` : ''}
              </tbody>
            </table>
          </td>
        </tr>` : ''}
        <!-- DELAI -->
        ${d.delivery ? `
        <tr>
          <td style="padding: 4px 26px 14px 26px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 4px;">Délai estimé</div>
            <div style="border-left: 3px solid #e30613; padding-left: 10px; font-size: 14px; color: #111827;">${safe(d.delivery)}</div>
          </td>
        </tr>` : ''}
        <!-- GARANTIE / CONDITIONS -->
        <tr>
          <td style="padding: 4px 26px 14px 26px;">
            <table style="border-radius: 10px; border: 1px solid #e5e7eb;" border="0" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                <tr><td style="padding: 10px 16px 4px 16px;"><span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; font-weight: bold;"> Garantie & conditions </span></td></tr>
                <tr>
                  <td style="padding: 4px 16px 12px 16px; font-size: 13px; color: #111827;">
                    <strong>Garantie 1 an</strong>, sous réserve de :
                    <ul style="margin: 6px 0 0 18px; padding: 0;">
                      <li>Montage par un professionnel qualifié</li>
                      <li>Respect des préconisations constructeur</li>
                      <li>Utilisation de consommables et pièces compatibles</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <!-- NOTRE MÉTHODE -->
        <tr>
          <td style="padding: 4px 26px 16px 26px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 4px;">Notre façon de travailler</div>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #111827;">Chaque moteur est physiquement contrôlé avant expédition afin de limiter au maximum les risques pour vous (main-d’œuvre, immobilisation, frais imprévus).</p>
            <ul style="margin: 0 0 8px 18px; padding: 0; font-size: 14px; color: #111827;">
              ${tests.map(t => `<li>${safe(t)}</li>`).join('')}
            </ul>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #111827;">En cas de non-conformité constatée lors des tests :</p>
            <ul style="margin: 0 0 8px 18px; padding: 0; font-size: 14px; color: #111827;">
              <li>Le moteur n’est pas expédié</li>
              <li>Une autre unité est proposée si disponible</li>
              <li>Ou la commande est annulée avec remboursement intégral</li>
            </ul>
            ${d.defectObserved ? `<p style=\"margin: 0; font-size: 13px; color: #4b5563;\"><strong>Défaut(s) constaté(s) :</strong> ${nl2br(d.defectObserved)}</p>` : `<p style=\"margin: 0; font-size: 13px; color: #4b5563;\"><strong>Objectif :</strong> fiabilité, transparence, et éviter toute perte de temps ou de main-d’œuvre inutile.</p>`}
          </td>
        </tr>
        <!-- CTA / CONTACT -->
        <tr>
          <td style="padding: 20px 26px 10px 26px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #111827;">Pour valider ce devis ou obtenir des précisions, le plus simple est de nous appeler :</p>
            <a style="display: inline-block; padding: 12px 26px; border-radius: 999px; background: #e30613; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 15px;" href="tel:${safePhoneLink}"> ${safe(phone)} </a>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">Vous pouvez également répondre directement à cet email si vous préférez un échange écrit.</p>
            <p style="margin: 18px 0 4px 0; font-size: 14px; color: #111827;">Cordialement,</p>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #4b5563;"><strong>L’équipe ${safeCompany}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">+ de 500 moteurs fournis à des garages et particuliers partout en France.</p>
          </td>
        </tr>
        <!-- PIED DE PAGE -->
        <tr>
          <td style="background: #000000; color: #d1d5db; text-align: center; padding: 10px 26px; font-size: 11px;">CPF Moteur – ${safeCompany} · SIREN ${safe(siren)}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </body>
 </html>`;
};

export default buildReplyEmailHtmlV2;
