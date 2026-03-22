const createAppMock = jest.fn(() => ({ app: true }));
const listenMock = jest.fn((_port, cb) => {
  cb?.();
  return undefined;
});
const fakeServer = { listen: listenMock };
const createHttpServerMock = jest.fn(() => fakeServer);

jest.mock('../app.js', () => ({
  createApp: () => createAppMock(),
  createHttpServer: (arg: unknown) => createHttpServerMock(arg),
}));

jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('index bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('startServer cree app/httpServer et listen', () => {
    process.env.PORT = '4567';
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const mod = require('../index.js');
    const result = mod.startServer();

    expect(createAppMock).toHaveBeenCalledTimes(1);
    expect(createHttpServerMock).toHaveBeenCalledWith({ app: true });
    expect(listenMock).toHaveBeenCalledWith('4567', expect.any(Function));
    expect(result.httpServer).toBe(fakeServer);

    logSpy.mockRestore();
  });

  it('ne demarre pas automatiquement quand NODE_ENV=test', () => {
    require('../index.js');

    expect(listenMock).not.toHaveBeenCalled();
  });

  it('demarre automatiquement quand NODE_ENV!=test', () => {
    process.env.NODE_ENV = 'development';

    require('../index.js');

    expect(listenMock).toHaveBeenCalledTimes(1);
  });

  it('utilise le port 3000 par defaut', () => {
    delete process.env.PORT;

    const mod = require('../index.js');
    mod.startServer();

    expect(listenMock).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
