export const brandColor = "#4f46e5"; // indigo-600
export const brandColorLight = "#818cf8"; // indigo-400
export const brandName = "CineConnect";

export function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #111111; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
    .header { background-color: #0d0d0d; padding: 28px 36px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; }
    .logo-dot { width: 10px; height: 10px; background-color: ${brandColor}; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 10px; }
    .logo-text { vertical-align: middle; }
    .body { padding: 36px; color: #a3a3a3; line-height: 1.7; font-size: 15px; }
    .body h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
    .body p { margin: 0 0 14px; }
    .body ul { margin: 0 0 16px; padding-left: 20px; }
    .body ul li { margin-bottom: 6px; }
    .btn { display: inline-block; padding: 14px 28px; background-color: ${brandColor}; color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
    .footer { padding: 24px 36px; color: #525252; font-size: 13px; text-align: center; }
    .footer a { color: #737373; text-decoration: underline; }
    .alert-box { background-color: rgba(79,70,229,0.08); border-left: 3px solid ${brandColor}; border-radius: 6px; padding: 16px 20px; margin: 16px 0; }
    .danger-box { background-color: rgba(239,68,68,0.08); border-left: 3px solid #ef4444; border-radius: 6px; padding: 16px 20px; margin: 16px 0; }
    .meta { color: #525252; font-size: 13px; }
    .highlight { color: ${brandColorLight}; font-weight: 600; }
    .badge { display: inline-block; background: rgba(79,70,229,0.15); color: ${brandColorLight}; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(79,70,229,0.3); margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <span class="logo">
          <span class="logo-dot"></span><span class="logo-text">${brandName}</span>
        </span>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${brandName}. Tous droits réservés.</p>
        <p>Tu reçois cet email car tu as un compte ${brandName}.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}