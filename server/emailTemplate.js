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
} = {}) => {
  const rawMessage = String(message || '');
  const safeMessage = escapeHtml(rawMessage).replace(/\n/g, '<br />');
  const safeToName = escapeHtml(toName || '');
  const safeCompany = escapeHtml(companyName);

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
            
            ${websiteUrl ? `<div style="margin-top:10px;"><a class="cta" href="${websiteUrl}" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:none;">Visiter notre site</a></div>` : ''}
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

export default buildReplyEmailHtml;
