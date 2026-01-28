import { useLogin } from "@/hooks/useLogin";
import {
  AuthLayout,
  AuthFormField,
  AuthErrorAlert,
  AuthSubmitButton,
  AuthFooter,
} from "@/components/Auth";

/**
 * Page Connexion. Conteneur : logique via useLogin, UI via composants Auth.
 */
export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <AuthLayout
      title="Connexion"
      footer={
        <AuthFooter
          prompt="Pas encore de compte ?"
          to="/signup"
          label="S'inscrire"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthErrorAlert message={error} />}
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
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <AuthSubmitButton loading={loading}>Se connecter</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
