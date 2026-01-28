import { useSignup } from "@/hooks/useSignup";
import {
  AuthLayout,
  AuthFormField,
  AuthErrorAlert,
  AuthSubmitButton,
  AuthFooter,
} from "@/components/Auth";

/**
 * Page Inscription. Conteneur : logique via useSignup, UI via composants Auth.
 */
export default function SignupPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useSignup();

  return (
    <AuthLayout
      title="Inscription"
      footer={
        <AuthFooter
          prompt="Déjà un compte ?"
          to="/login"
          label="Se connecter"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthErrorAlert message={error} />}
        <AuthFormField
          id="name"
          label="Nom d'affichage"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Alexandre D."
          autoComplete="name"
        />
        <AuthFormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="vous@exemple.com"
          autoComplete="email"
        />
        <AuthFormField
          id="password"
          label="Mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={8}
          placeholder="•••••••• (min. 8 caractères)"
          autoComplete="new-password"
        />
        <AuthSubmitButton loading={loading}>S'inscrire</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
