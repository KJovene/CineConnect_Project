import { Input } from "@/components/atoms";

export interface FormFieldProps {
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

export function FormField({
  id,
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
  minLength,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
      />
    </div>
  );
}