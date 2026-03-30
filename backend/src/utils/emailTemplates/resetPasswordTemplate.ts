import { baseLayout, brandName } from "./base.js";

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