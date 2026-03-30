import { Link } from "@tanstack/react-router";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { AuthPageLayout } from "@/components/templates";
import { AuthForm } from "@/components/organisms";

export default function ForgotPasswordPage() {
  const { email, setEmail, error, loading, sent, handleSubmit } = useForgotPassword();

  if (sent) {
    return (
      <AuthPageLayout title="Email envoyé">
        <p className="text-center text-sm text-neutral-400 mb-4">
          Un lien de réinitialisation a été envoyé à{" "}
          <span className="text-indigo-400 font-medium">{email}</span>. Vérifie
          ta boîte mail.
        </p>
        <p className="text-center text-sm text-neutral-500">
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Retour à la connexion
          </Link>
        </p>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout title="Mot de passe oublié">
      <AuthForm
        fields={[
          {
            id: "email",
            label: "Email",
            type: "email",
            value: email,
            onChange: setEmail,
            required: true,
            placeholder: "vous@exemple.com",
            autoComplete: "email",
          },
        ]}
        submitLabel="Envoyer le lien"
        loading={loading}
        error={error}
        navLink={{ prompt: "Tu t'en souviens ?", to: "/login", label: "Se connecter" }}
        onSubmit={handleSubmit}
      />
    </AuthPageLayout>
  );
}