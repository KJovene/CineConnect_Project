import { inputBase } from "./AuthLayout";

export interface AuthFormFieldProps {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}

/**
 * Champ de formulaire auth (label + input). Présentation seule, props uniquement.
 */
export function AuthFormField({
  id,
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
  minLength,
}: AuthFormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-400 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        className={inputBase}
      />
    </div>
  );
}
