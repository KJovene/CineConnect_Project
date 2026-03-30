import { baseLayout, brandName } from "./base.js";

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