const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
};

jest.mock("../../db/index.js", () => ({ db: mockDb }));

import {
  getConversation,
  createMessage,
  getRecentConversations,
  getIncomingMessages,
} from "./messagesService.js";

describe("messagesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getConversation applique limit et offset", async () => {
    const offset = jest.fn().mockResolvedValue([{ message_id: 1 }]);
    const limit = jest.fn().mockReturnValue({ offset });
    const orderBy = jest.fn().mockReturnValue({ limit });
    const where = jest.fn().mockReturnValue({ orderBy });
    const from = jest.fn().mockReturnValue({ where });

    mockDb.select.mockReturnValue({ from });

    const result = await getConversation(1, 2, 3, 10);

    expect(result).toEqual([{ message_id: 1 }]);
    expect(limit).toHaveBeenCalledWith(10);
    expect(offset).toHaveBeenCalledWith(20);
  });

  it("getConversation utilise les valeurs par defaut", async () => {
    const offset = jest.fn().mockResolvedValue([{ message_id: 1 }]);
    const limit = jest.fn().mockReturnValue({ offset });
    const orderBy = jest.fn().mockReturnValue({ limit });
    const where = jest.fn().mockReturnValue({ orderBy });
    const from = jest.fn().mockReturnValue({ where });

    mockDb.select.mockReturnValue({ from });

    await getConversation(1, 2);

    expect(limit).toHaveBeenCalledWith(50);
    expect(offset).toHaveBeenCalledWith(0);
  });

  it("createMessage insere et retourne le message cree", async () => {
    const returning = jest
      .fn()
      .mockResolvedValue([{ message_id: 7, content: "hello" }]);
    const values = jest.fn().mockReturnValue({ returning });
    mockDb.insert.mockReturnValue({ values });

    const result = await createMessage(1, 2, "hello");

    expect(result).toEqual({ message_id: 7, content: "hello" });
  });

  it("getRecentConversations deduplique par interlocuteur", async () => {
    const where = jest.fn().mockReturnValue({
      orderBy: jest.fn().mockResolvedValue([
        {
          message_id: 5,
          sender_id: 1,
          receiver_id: 2,
          content: "last with 2",
          sent_at: new Date(),
        },
        {
          message_id: 4,
          sender_id: 2,
          receiver_id: 1,
          content: "older with 2",
          sent_at: new Date(),
        },
        {
          message_id: 3,
          sender_id: 3,
          receiver_id: 1,
          content: "with 3",
          sent_at: new Date(),
        },
      ]),
    });

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({ where }),
    });

    const result = await getRecentConversations(1);

    expect(result).toHaveLength(2);
    expect(result[0].message_id).toBe(5);
    expect(result[1].message_id).toBe(3);
  });

  it("getIncomingMessages normalise limit min et max", async () => {
    const limit = jest.fn().mockResolvedValue([{ message_id: 1 }]);
    const orderBy = jest.fn().mockReturnValue({ limit });
    const where = jest.fn().mockReturnValue({ orderBy });
    const innerJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ innerJoin });
    mockDb.select.mockReturnValue({ from });

    await getIncomingMessages(1, 0);
    expect(limit).toHaveBeenCalledWith(1);

    await getIncomingMessages(1, 999);
    expect(limit).toHaveBeenCalledWith(100);
  });

  it("getIncomingMessages conserve une limite deja valide", async () => {
    const limit = jest.fn().mockResolvedValue([{ message_id: 1 }]);
    const orderBy = jest.fn().mockReturnValue({ limit });
    const where = jest.fn().mockReturnValue({ orderBy });
    const innerJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ innerJoin });
    mockDb.select.mockReturnValue({ from });

    await getIncomingMessages(1, 12);
    expect(limit).toHaveBeenCalledWith(12);
  });

  it("getIncomingMessages utilise la limite par defaut", async () => {
    const limit = jest.fn().mockResolvedValue([{ message_id: 1 }]);
    const orderBy = jest.fn().mockReturnValue({ limit });
    const where = jest.fn().mockReturnValue({ orderBy });
    const innerJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ innerJoin });
    mockDb.select.mockReturnValue({ from });

    await getIncomingMessages(1);
    expect(limit).toHaveBeenCalledWith(20);
  });
});
