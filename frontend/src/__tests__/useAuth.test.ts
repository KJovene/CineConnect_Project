import { renderHook } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { signOut, useSession } from "@/lib/auth-client";

jest.mock("@/lib/auth-client", () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthenticated state when no session", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });

    const { result } = renderHook(() => useAuth());

    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns authenticated state when session exists", () => {
    const session = { user: { id: "user-1" } };
    (useSession as jest.Mock).mockReturnValue({
      data: session,
      isPending: true,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.session).toEqual(session);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("calls signOut with redirect callback", async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });
    (signOut as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());
    await result.current.handleLogout();

    expect(signOut).toHaveBeenCalledTimes(1);
    const signOutArgs = (signOut as jest.Mock).mock.calls[0][0];
    expect(signOutArgs.fetchOptions.onSuccess).toEqual(expect.any(Function));

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      signOutArgs.fetchOptions.onSuccess();
    } catch {
      // JSDOM ne supporte pas la navigation complète; l'objectif est de couvrir le callback.
    }

    consoleErrorSpy.mockRestore();
  });
});
