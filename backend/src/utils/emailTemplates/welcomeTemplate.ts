import { baseLayout, brandName } from "./base.js";

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