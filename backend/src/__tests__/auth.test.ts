describe("auth module", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
  });

  it("configure betterAuth et avertit si secret manquant ou trop court", () => {
    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const betterAuthMock = jest.fn((cfg) => ({ cfg }));
    const drizzleAdapterMock = jest.fn(() => ({ adapter: true }));

    jest.doMock("better-auth", () => ({ betterAuth: betterAuthMock }));
    jest.doMock("better-auth/adapters/drizzle", () => ({
      drizzleAdapter: drizzleAdapterMock,
    }));
    jest.doMock("dotenv", () => ({ config: jest.fn() }));
    jest.doMock("../db/index.js", () => ({ db: {} }));
    jest.doMock("../db/schema.js", () => ({
      user: {},
      session: {},
      account: {},
      verification: {},
    }));

    process.env.BETTER_AUTH_SECRET = "short";

    const mod = require("../auth.js");

    expect(mod.auth).toBeDefined();
    expect(betterAuthMock).toHaveBeenCalledTimes(1);
    expect(drizzleAdapterMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it("utilise le secret fallback si secret absent", () => {
    const betterAuthMock = jest.fn((cfg) => ({ cfg }));

    jest.doMock("better-auth", () => ({ betterAuth: betterAuthMock }));
    jest.doMock("better-auth/adapters/drizzle", () => ({
      drizzleAdapter: jest.fn(() => ({})),
    }));
    jest.doMock("dotenv", () => ({ config: jest.fn() }));
    jest.doMock("../db/index.js", () => ({ db: {} }));
    jest.doMock("../db/schema.js", () => ({
      user: {},
      session: {},
      account: {},
      verification: {},
    }));

    delete process.env.BETTER_AUTH_SECRET;

    require("../auth.js");

    expect(betterAuthMock).toHaveBeenCalledTimes(1);
    const configArg = betterAuthMock.mock.calls[0][0] as { secret: string };
    expect(configArg.secret).toBe("dev-secret-min-32-chars-change-in-prod");
  });

  it("n avertit pas si secret valide", () => {
    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const betterAuthMock = jest.fn((cfg) => ({ cfg }));

    jest.doMock("better-auth", () => ({ betterAuth: betterAuthMock }));
    jest.doMock("better-auth/adapters/drizzle", () => ({
      drizzleAdapter: jest.fn(() => ({})),
    }));
    jest.doMock("dotenv", () => ({ config: jest.fn() }));
    jest.doMock("../db/index.js", () => ({ db: {} }));
    jest.doMock("../db/schema.js", () => ({
      user: {},
      session: {},
      account: {},
      verification: {},
    }));

    process.env.BETTER_AUTH_SECRET = "12345678901234567890123456789012";

    require("../auth.js");

    expect(betterAuthMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("utilise le baseURL par defaut si BETTER_AUTH_URL absent", () => {
    const betterAuthMock = jest.fn((cfg) => ({ cfg }));

    jest.doMock("better-auth", () => ({ betterAuth: betterAuthMock }));
    jest.doMock("better-auth/adapters/drizzle", () => ({
      drizzleAdapter: jest.fn(() => ({})),
    }));
    jest.doMock("dotenv", () => ({ config: jest.fn() }));
    jest.doMock("../db/index.js", () => ({ db: {} }));
    jest.doMock("../db/schema.js", () => ({
      user: {},
      session: {},
      account: {},
      verification: {},
    }));

    delete process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_SECRET = "12345678901234567890123456789012";

    require("../auth.js");

    expect(betterAuthMock).toHaveBeenCalledTimes(1);
    const configArg = betterAuthMock.mock.calls[0][0] as { baseURL: string };
    expect(configArg.baseURL).toBe("http://localhost:3000");
  });
});
