import { act, renderHook } from "@testing-library/react";
import { useLogin } from "@/hooks/useLogin";
import { authClient } from "@/lib/auth-client";

const navigateMock = jest.fn();

jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

jest.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
    },
  },
}));

describe("useLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits credentials and navigates on success", async () => {
    (authClient.signIn.email as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("secret123");
    });

    const preventDefault = jest.fn();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(authClient.signIn.email).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        password: "secret123",
        callbackURL: "/",
      }),
    );

    const signInArgs = (authClient.signIn.email as jest.Mock).mock.calls[0][0];
    signInArgs.fetchOptions.onSuccess();

    expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
    expect(navigateMock).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("sets api error message when signIn returns an error", async () => {
    (authClient.signIn.email as jest.Mock).mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Invalid credentials");
    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("uses default message when API error has no message", async () => {
    (authClient.signIn.email as jest.Mock).mockResolvedValue({
      error: {},
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Échec de la connexion");
    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("sets fallback message when signIn throws", async () => {
    (authClient.signIn.email as jest.Mock).mockRejectedValue(
      new Error("network"),
    );

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe(
      "Impossible de contacter le serveur. Vérifie que le backend tourne sur localhost:3000.",
    );
    expect(result.current.loading).toBe(false);
  });

  it("shows email validation error when email is invalid", async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("invalid-email");
      result.current.setPassword("secret123");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Adresse email invalide.");
    expect(authClient.signIn.email).not.toHaveBeenCalled();
  });

  it("shows password validation error when password is missing", async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Mot de passe requis.");
    expect(authClient.signIn.email).not.toHaveBeenCalled();
  });
});
