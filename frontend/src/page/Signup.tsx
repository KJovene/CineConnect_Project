import { useSignup } from "@/hooks/useSignup";
import { AuthPageLayout } from "@/components/templates";
import { FormField, AuthNavLink } from "@/components/molecules";
import { ErrorAlert, Button } from "@/components/atoms";

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
    <AuthPageLayout
      title="Inscription"
      footer={
        <AuthNavLink
          prompt="Déjà un compte ?"
          to="/login"
          label="Se connecter"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorAlert message={error} />}
        <FormField
          id="name"
          label="Nom d'affichage"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Alexandre D."
          autoComplete="name"
        />
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
          minLength={8}
          placeholder="•••••••• (min. 8 caractères)"
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} fullWidth>
          S'inscrire
        </Button>
      </form>
    </AuthPageLayout>
  );
}
