import { useSignup } from "@/hooks/useSignup";
import { AuthPageLayout } from "@/components/templates";
import { AuthForm } from "@/components/organisms";

export default function SignupPage() {
  const { name, setName, email, setEmail, password, setPassword, error, loading, handleSubmit } =
    useSignup();

  return (
    <AuthPageLayout title="Inscription">
      <AuthForm
        fields={[
          {
            id: "name",
            label: "Nom d'affichage",
            type: "text",
            value: name,
            onChange: setName,
            placeholder: "Alexandre D.",
            autoComplete: "name",
          },
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
            minLength: 8,
            placeholder: "•••••••• (min. 8 caractères)",
            autoComplete: "new-password",
          },
        ]}
        submitLabel="S'inscrire"
        loading={loading}
        error={error}
        navLink={{ prompt: "Déjà un compte ?", to: "/login", label: "Se connecter" }}
        onSubmit={handleSubmit}
      />
    </AuthPageLayout>
  );
}
