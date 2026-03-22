describe("db/index", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("initialise Pool puis drizzle avec schema", () => {
    const poolCtor = jest.fn(() => ({ pool: true }));
    const drizzleMock = jest.fn(() => ({ db: true }));

    jest.doMock("pg", () => ({ Pool: poolCtor }));
    jest.doMock("drizzle-orm/node-postgres", () => ({ drizzle: drizzleMock }));
    jest.doMock("../db/schema", () => ({ schema: true }));

    process.env.DATABASE_URL = "postgres://test";

    const mod = require("../db/index.js");

    expect(mod.db).toBeDefined();
    expect(poolCtor).toHaveBeenCalledWith({
      connectionString: "postgres://test",
    });
    expect(drizzleMock).toHaveBeenCalledTimes(1);
  });
});
