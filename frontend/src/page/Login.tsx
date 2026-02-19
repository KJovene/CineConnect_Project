import { useLogin } from "@/hooks/useLogin";
import { AuthPageLayout } from "@/components/templates";
import { FormField, AuthNavLink } from "@/components/molecules";
import { ErrorAlert, Button } from "@/components/atoms";

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
    <AuthPageLayout
      title="Connexion"
      footer={
        <AuthNavLink
          prompt="Pas encore de compte ?"
          to="/signup"
          label="S'inscrire"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorAlert message={error} />}
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="vous@exemple.com"
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <Button type="submit" loading={loading} fullWidth>
          Se connecter
        </Button>
      </form>
    </AuthPageLayout>
  );
}
