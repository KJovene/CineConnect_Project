import { baseLayout, brandName } from "./base.js";

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