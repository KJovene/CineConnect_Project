import { Link } from "@tanstack/react-router";
import { useResetPassword } from "@/hooks/useResetPassword";
import { AuthPageLayout } from "@/components/templates";
import { AuthForm } from "@/components/organisms";

interface ResetPasswordPageProps {
  token: string;
}

export default function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const { password, setPassword, error, loading, handleSubmit } = useResetPassword(token);

  if (!token) {
    return (
      <AuthPageLayout title="Lien invalide">
        <p className="text-center text-sm text-neutral-400 mb-4">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <p className="text-center text-sm text-neutral-500">
          <Link
            to="/forgot-password"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Demander un nouveau lien
          </Link>
        </p>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout title="Nouveau mot de passe">
      <AuthForm
        fields={[
          {
            id: "password",
            label: "Nouveau mot de passe",
            type: "password",
            value: password,
            onChange: setPassword,
            required: true,
            minLength: 8,
            placeholder: "•••••••• (min. 8 caractères)",
            autoComplete: "new-password",
          },
        ]}
        submitLabel="Réinitialiser"
        loading={loading}
        error={error}
        navLink={{ prompt: "Tu t'en souviens ?", to: "/login", label: "Se connecter" }}
        onSubmit={handleSubmit}
      />
    </AuthPageLayout>
  );
}