import { Link } from "@tanstack/react-router";

export interface AuthNavLinkProps {
  prompt: string;
  to: string;
  label: string;
}

export function AuthNavLink({ prompt, to, label }: AuthNavLinkProps) {
  return (
    <p className="text-center text-sm text-neutral-500">
      {prompt}{" "}
      <Link
        to={to}
        className="text-indigo-400 hover:text-indigo-300 font-medium"
      >
        {label}
      </Link>
    </p>
  );
}
