import { baseLayout, brandName } from "./base.js";

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