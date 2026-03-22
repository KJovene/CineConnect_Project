import http from "http";

const getSessionMock = jest.fn();
const createMessageMock = jest.fn();

const ioState: {
  middleware?: (socket: any, next: (err?: Error) => void) => Promise<void>;
  connectionHandler?: (socket: any) => void;
  toMock: jest.Mock;
  emitMock: jest.Mock;
} = {
  toMock: jest.fn(),
  emitMock: jest.fn(),
};

class FakeSocketServer {
  use(fn: any) {
    ioState.middleware = fn;
  }

  on(event: string, fn: any) {
    if (event === "connection") {
      ioState.connectionHandler = fn;
    }
  }

  to = ioState.toMock;
  emit = ioState.emitMock;
}

jest.mock("socket.io", () => ({
  Server: jest.fn(() => new FakeSocketServer()),
}));

jest.mock("../auth.js", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
    },
  },
}));

jest.mock("../services/messagesService.js", () => ({
  createMessage: (...args: unknown[]) => createMessageMock(...args),
}));

import { initSocket } from "../socket.js";

describe("socket init", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("middleware refuse utilisateur non authentifie", async () => {
    initSocket(http.createServer());
    getSessionMock.mockResolvedValue(null);

    const next = jest.fn();
    await ioState.middleware?.({ handshake: { headers: {} }, data: {} }, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as Error;
    expect(err.message).toBe("Non authentifié");
  });

  it("middleware set socket.data et passe", async () => {
    initSocket(http.createServer());
    getSessionMock.mockResolvedValue({ user: { id: "12", name: "Bob" } });

    const socket: any = { handshake: { headers: { cookie: "a=b" } }, data: {} };
    const next = jest.fn();

    await ioState.middleware?.(socket, next);

    expect(socket.data.userId).toBe(12);
    expect(socket.data.userName).toBe("Bob");
    expect(next).toHaveBeenCalledWith();
  });

  it("middleware force userName a null si absent", async () => {
    initSocket(http.createServer());
    getSessionMock.mockResolvedValue({ user: { id: "2", name: undefined } });

    const socket: any = { handshake: { headers: { cookie: "a=b" } }, data: {} };
    const next = jest.fn();

    await ioState.middleware?.(socket, next);

    expect(socket.data.userName).toBeNull();
    expect(next).toHaveBeenCalledWith();
  });

  it("middleware renvoie erreur si exception auth", async () => {
    initSocket(http.createServer());
    getSessionMock.mockRejectedValue(new Error("boom"));

    const next = jest.fn();
    await ioState.middleware?.({ handshake: { headers: {} }, data: {} }, next);

    const err = next.mock.calls[0][0] as Error;
    expect(err.message).toBe("Erreur d'authentification");
  });

  it("connection: dm:send envoie dm:new au destinataire et emetteur", async () => {
    ioState.toMock.mockReturnValue({ emit: jest.fn() });
    createMessageMock.mockResolvedValue({ message_id: 1 });

    initSocket(http.createServer());

    const socketEvents: Record<string, Function> = {};
    const socket: any = {
      data: { userId: 7 },
      join: jest.fn(),
      on: jest.fn((event: string, fn: Function) => {
        socketEvents[event] = fn;
      }),
      emit: jest.fn(),
    };

    ioState.connectionHandler?.(socket);

    expect(socket.join).toHaveBeenCalledWith("user:7");

    await socketEvents["dm:send"]({ toUserId: 9, content: " hello " });

    expect(createMessageMock).toHaveBeenCalledWith(7, 9, "hello");
    expect(ioState.toMock).toHaveBeenCalledWith("user:9");
    expect(socket.emit).toHaveBeenCalledWith("dm:new", {
      message: { message_id: 1 },
    });
  });

  it("connection: dm:send ignore payload invalide", async () => {
    initSocket(http.createServer());

    const socketEvents: Record<string, Function> = {};
    const socket: any = {
      data: { userId: 7 },
      join: jest.fn(),
      on: jest.fn((event: string, fn: Function) => {
        socketEvents[event] = fn;
      }),
      emit: jest.fn(),
    };

    ioState.connectionHandler?.(socket);

    await socketEvents["dm:send"]({ toUserId: 0, content: "x" });
    await socketEvents["dm:send"]({ toUserId: 2, content: "   " });

    expect(createMessageMock).not.toHaveBeenCalled();
  });

  it("connection: dm:send emet dm:error si createMessage echoue", async () => {
    createMessageMock.mockRejectedValue(new Error("fail"));
    ioState.toMock.mockReturnValue({ emit: jest.fn() });

    initSocket(http.createServer());

    const socketEvents: Record<string, Function> = {};
    const socket: any = {
      data: { userId: 7 },
      join: jest.fn(),
      on: jest.fn((event: string, fn: Function) => {
        socketEvents[event] = fn;
      }),
      emit: jest.fn(),
    };

    ioState.connectionHandler?.(socket);
    await socketEvents["dm:send"]({ toUserId: 9, content: "ok" });

    expect(socket.emit).toHaveBeenCalledWith("dm:error", {
      error: "Impossible d'envoyer le message",
    });
  });

  it("connection: dm:seen et disconnect et presence online", () => {
    ioState.toMock.mockReturnValue({ emit: jest.fn() });

    initSocket(http.createServer());

    const socketEvents: Record<string, Function> = {};
    const socket: any = {
      data: { userId: 7 },
      join: jest.fn(),
      on: jest.fn((event: string, fn: Function) => {
        socketEvents[event] = fn;
      }),
      emit: jest.fn(),
    };

    ioState.connectionHandler?.(socket);

    socketEvents["dm:seen"]({ fromUserId: 3 });
    socketEvents["disconnect"]();

    expect(ioState.toMock).toHaveBeenCalledWith("user:3");
    expect(ioState.emitMock).toHaveBeenCalledWith("presence:offline", {
      userId: 7,
    });
    expect(ioState.emitMock).toHaveBeenCalledWith("presence:online", {
      userId: 7,
    });
  });
});
