import { Link } from "@tanstack/react-router";
import { useLogin } from "@/hooks/useLogin";
import { AuthPageLayout } from "@/components/templates";
import { AuthForm } from "@/components/organisms";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useLogin();

  return (
    <AuthPageLayout title="Connexion">
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
          {
            id: "password",
            label: "Mot de passe",
            type: "password",
            value: password,
            onChange: setPassword,
            required: true,
            placeholder: "••••••••",
            autoComplete: "current-password",
          },
        ]}
        submitLabel="Se connecter"
        loading={loading}
        error={error}
        navLink={{ prompt: "Pas encore de compte ?", to: "/signup", label: "S'inscrire" }}
        onSubmit={handleSubmit}
        extraAction={
          <Link
            to="/forgot-password"
            className="text-sm text-neutral-500 hover:text-indigo-400"
          >
            Mot de passe oublié ?
          </Link>
        }
      />
    </AuthPageLayout>
  );
}
