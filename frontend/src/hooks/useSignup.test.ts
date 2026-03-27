import { act, renderHook } from "@testing-library/react";
import { useSignup } from "@/hooks/useSignup";
import { authClient } from "@/lib/auth-client";

const navigateMock = jest.fn();

jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

jest.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: jest.fn(),
    },
  },
}));

describe("useSignup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("trims name and navigates on successful signup", async () => {
    (authClient.signUp.email as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useSignup());

    act(() => {
      result.current.setName("  Kevin  ");
      result.current.setEmail("kevin@example.com");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(authClient.signUp.email).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Kevin",
        email: "kevin@example.com",
        password: "secret123",
        callbackURL: "/",
      }),
    );

    const signUpArgs = (authClient.signUp.email as jest.Mock).mock.calls[0][0];
    signUpArgs.fetchOptions.onSuccess();

    expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
    expect(navigateMock).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("sets signup error message when API returns an error", async () => {
    (authClient.signUp.email as jest.Mock).mockResolvedValue({
      error: { message: "already used" },
    });

    const { result } = renderHook(() => useSignup());

    act(() => {
      result.current.setName("Kevin");
      result.current.setEmail("kevin@example.com");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Echec de l'inscription");
    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("shows email validation error when email is invalid", async () => {
    const { result } = renderHook(() => useSignup());

    act(() => {
      result.current.setName("Kevin");
      result.current.setEmail("bad-email");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Adresse email invalide.");
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });

  it("shows username validation error when name is too short", async () => {
    const { result } = renderHook(() => useSignup());

    act(() => {
      result.current.setName("A");
      result.current.setEmail("kevin@example.com");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe(
      "Le pseudo doit contenir au moins 2 caractères.",
    );
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });

  it("shows password validation error when password is too short", async () => {
    const { result } = renderHook(() => useSignup());

    act(() => {
      result.current.setName("Kevin");
      result.current.setEmail("kevin@example.com");
      result.current.setPassword("short");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe(
      "Le mot de passe doit contenir au moins 8 caractères.",
    );
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });
});
