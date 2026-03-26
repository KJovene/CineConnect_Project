import type { FormEvent } from "react";
import { Button, ErrorAlert } from "@/components/atoms";
import {
  FormField,
  AuthNavLink,
  type FormFieldProps,
} from "@/components/molecules";

interface AuthFormProps {
  fields: FormFieldProps[];
  submitLabel: string;
  loading: boolean;
  error: string | null;
  navLink: { prompt: string; to: string; label: string };
  onSubmit: (e: FormEvent) => void;
}

export function AuthForm({
  fields,
  submitLabel,
  loading,
  error,
  navLink,
  onSubmit,
}: AuthFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <ErrorAlert message={error} />}
        {fields.map((field) => (
          <FormField key={field.id} {...field} />
        ))}
        <Button type="submit" loading={loading} fullWidth>
          {submitLabel}
        </Button>
      </form>
      <div className="mt-6">
        <AuthNavLink
          prompt={navLink.prompt}
          to={navLink.to}
          label={navLink.label}
        />
      </div>
    </>
  );
}
