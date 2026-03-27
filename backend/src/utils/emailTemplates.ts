const brandColor = "#4f46e5"; // indigo-600
const brandColorLight = "#818cf8"; // indigo-400
const brandName = "CineConnect";

function baseLayout(title: string, content: string): string {
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
    .logo { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; display: flex; align-items: center; gap: 10px; }
    .logo-dot { width: 10px; height: 10px; background-color: ${brandColor}; border-radius: 50%; display: inline-block; }
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
          <span class="logo-dot"></span>
          ${brandName}
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

export function welcomeTemplate(name: string): { subject: string; html: string } {
  return {
    subject: `Bienvenue sur ${brandName}, ${name} !`,
    html: baseLayout(
      `Bienvenue sur ${brandName}`,
      `<span class="badge">Nouveau membre</span>
      <h2>Bienvenue, ${name} !</h2>
      <p>Ton compte <span class="highlight">${brandName}</span> est prêt. Rejoins une communauté de cinéphiles passionnés.</p>
      <p>Pour commencer :</p>
      <ul>
        <li>🔍 Recherche un film et donne-lui une note</li>
        <li>👥 Trouve tes amis et suis leurs avis</li>
        <li>💬 Participe aux discussions</li>
      </ul>
      <hr class="divider" />
      <p>À très vite sur ${brandName} !</p>`,
    ),
  };
}

export function verifyEmailTemplate(
  name: string,
  url: string,
): { subject: string; html: string } {
  return {
    subject: `Confirme ton adresse email — ${brandName}`,
    html: baseLayout(
      "Confirmation d'email",
      `<h2>Confirme ton adresse email</h2>
      <p>Salut ${name},</p>
      <p>Clique sur le bouton ci-dessous pour vérifier ton adresse email. Ce lien expire dans <strong style="color:#fff">24 heures</strong>.</p>
      <p><a href="${url}" class="btn">Vérifier mon email</a></p>
      <hr class="divider" />
      <p class="meta">Si tu n'as pas créé de compte ${brandName}, ignore cet email.</p>
      <p class="meta">Lien alternatif : <a href="${url}" style="color:#737373">${url}</a></p>`,
    ),
  };
}

export function resetPasswordTemplate(
  name: string,
  url: string,
): { subject: string; html: string } {
  return {
    subject: `Réinitialisation de ton mot de passe — ${brandName}`,
    html: baseLayout(
      "Réinitialisation du mot de passe",
      `<h2>Réinitialise ton mot de passe</h2>
      <p>Salut ${name},</p>
      <p>Tu as demandé à réinitialiser ton mot de passe. Clique ci-dessous pour en choisir un nouveau. Ce lien expire dans <strong style="color:#fff">1 heure</strong>.</p>
      <p><a href="${url}" class="btn">Réinitialiser mon mot de passe</a></p>
      <hr class="divider" />
      <div class="danger-box">
        <p style="margin:0;color:#fca5a5"><strong>Tu n'as pas demandé cette réinitialisation ?</strong><br />
        Ignore cet email. Ton mot de passe actuel reste inchangé.</p>
      </div>
      <p class="meta">Lien alternatif : <a href="${url}" style="color:#737373">${url}</a></p>`,
    ),
  };
}

export function loginAlertTemplate(
  name: string,
  ipAddress: string | null,
  userAgent: string | null,
  date: Date,
): { subject: string; html: string } {
  const formattedDate = date.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });

  return {
    subject: `Nouvelle connexion détectée — ${brandName}`,
    html: baseLayout(
      "Alerte de connexion",
      `<h2>Nouvelle connexion à ton compte</h2>
      <p>Salut ${name},</p>
      <p>Une connexion vient d'être effectuée sur ton compte ${brandName}.</p>
      <div class="alert-box">
        <p style="margin:0 0 10px;color:#e5e5e5"><strong>Détails de la connexion</strong></p>
        <p style="margin:0 0 4px" class="meta">📅 <strong>Date :</strong> ${formattedDate}</p>
        ${ipAddress ? `<p style="margin:4px 0 0" class="meta">🌐 <strong>Adresse IP :</strong> ${ipAddress}</p>` : ""}
        ${userAgent ? `<p style="margin:4px 0 0" class="meta">💻 <strong>Navigateur :</strong> ${userAgent}</p>` : ""}
      </div>
      <p>C'est toi ? Parfait, aucune action nécessaire.</p>
      <p><strong style="color:#fff">Ce n'était pas toi ?</strong> Change ton mot de passe immédiatement.</p>`,
    ),
  };
}

export function friendRequestTemplate(
  recipientName: string,
  requesterName: string,
  frontendUrl: string,
): { subject: string; html: string } {
  return {
    subject: `${requesterName} t'a envoyé une demande d'ami — ${brandName}`,
    html: baseLayout(
      "Demande d'ami",
      `<h2>Nouvelle demande d'ami</h2>
      <p>Salut ${recipientName},</p>
      <p><span class="highlight">${requesterName}</span> souhaite t'ajouter comme ami sur ${brandName}.</p>
      <p>
        <a href="${frontendUrl}/friends" class="btn">Voir la demande</a>
      </p>
      <hr class="divider" />
      <p class="meta">Tu peux accepter ou refuser cette demande depuis ton espace amis.</p>`,
    ),
  };
}

export function friendRequestAcceptedTemplate(
  requesterName: string,
  acceptorName: string,
  frontendUrl: string,
): { subject: string; html: string } {
  return {
    subject: `${acceptorName} a accepté ta demande d'ami — ${brandName}`,
    html: baseLayout(
      "Demande d'ami acceptée",
      `<h2>Demande d'ami acceptée !</h2>
      <p>Salut ${requesterName},</p>
      <p>Bonne nouvelle ! <span class="highlight">${acceptorName}</span> a accepté ta demande d'ami sur ${brandName}.</p>
      <p>Vous pouvez maintenant voir vos critiques mutuelles et discuter de vos films préférés.</p>
      <p><a href="${frontendUrl}/friends" class="btn">Voir mes amis</a></p>`,
    ),
  };
}
