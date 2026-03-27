const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("../../db/index.js", () => ({ db: mockDb }));

import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "./friendsService.js";

describe("friendsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getFriends retourne [] quand aucune relation acceptee", async () => {
    const where = jest.fn().mockResolvedValue([]);
    const from = jest.fn().mockReturnValue({ where });
    mockDb.select.mockReturnValue({ from });

    const result = await getFriends(1);

    expect(result).toEqual([]);
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });

  it("getFriends enrichit avec friend mappe", async () => {
    const firstWhere = jest.fn().mockResolvedValue([
      {
        friend_id: 1,
        user_id: 1,
        friend_user_id: 2,
        status: "accepted",
        created_at: new Date(),
      },
    ]);
    const secondWhere = jest
      .fn()
      .mockResolvedValue([
        { id: 2, name: "Bob", email: "b@b.com", image: null },
      ]);

    const fromOne = jest.fn().mockReturnValue({ where: firstWhere });
    const fromTwo = jest.fn().mockReturnValue({ where: secondWhere });

    mockDb.select
      .mockReturnValueOnce({ from: fromOne })
      .mockReturnValueOnce({ from: fromTwo });

    const result = await getFriends(1);

    expect(result[0].friend).toEqual({
      id: 2,
      name: "Bob",
      email: "b@b.com",
      image: null,
    });
  });

  it("getFriends met friend a null si utilisateur introuvable", async () => {
    const firstWhere = jest.fn().mockResolvedValue([
      {
        friend_id: 1,
        user_id: 2,
        friend_user_id: 1,
        status: "accepted",
        created_at: new Date(),
      },
    ]);
    const secondWhere = jest.fn().mockResolvedValue([]);

    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({ where: firstWhere }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({ where: secondWhere }),
      });

    const result = await getFriends(1);

    expect(result[0].friend).toBeNull();
  });

  it("getPendingRequests retourne [] quand aucune demande", async () => {
    const where = jest.fn().mockResolvedValue([]);
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({ where }),
    });

    const result = await getPendingRequests(1);

    expect(result).toEqual([]);
  });

  it("getPendingRequests enrichit avec requester", async () => {
    const firstWhere = jest.fn().mockResolvedValue([
      {
        friend_id: 10,
        user_id: 2,
        friend_user_id: 1,
        status: "pending",
        created_at: new Date(),
      },
    ]);
    const secondWhere = jest
      .fn()
      .mockResolvedValue([
        { id: 2, name: "Bob", email: "b@b.com", image: null },
      ]);

    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({ where: firstWhere }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({ where: secondWhere }),
      });

    const result = await getPendingRequests(1);

    expect(result[0].requester?.id).toBe(2);
  });

  it("getPendingRequests met requester a null si utilisateur absent", async () => {
    const firstWhere = jest.fn().mockResolvedValue([
      {
        friend_id: 10,
        user_id: 2,
        friend_user_id: 1,
        status: "pending",
        created_at: new Date(),
      },
    ]);
    const secondWhere = jest.fn().mockResolvedValue([]);

    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({ where: firstWhere }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({ where: secondWhere }),
      });

    const result = await getPendingRequests(1);

    expect(result[0].requester).toBeNull();
  });

  it("sendFriendRequest refuse auto-ajout", async () => {
    await expect(sendFriendRequest(1, 1)).rejects.toThrow(
      "Impossible de s'ajouter soi-même",
    );
  });

  it("sendFriendRequest refuse relation existante", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{}]),
      }),
    });

    await expect(sendFriendRequest(1, 2)).rejects.toThrow(
      "Relation déjà existante",
    );
  });

  it("sendFriendRequest cree une relation pending", async () => {
    mockDb.select.mockReturnValue({
      from: jest
        .fn()
        .mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
    });

    const returning = jest
      .fn()
      .mockResolvedValue([
        { friend_id: 1, user_id: 1, friend_user_id: 2, status: "pending" },
      ]);
    const values = jest.fn().mockReturnValue({ returning });
    mockDb.insert.mockReturnValue({ values });

    const result = await sendFriendRequest(1, 2);

    expect(result.status).toBe("pending");
  });

  it("acceptFriendRequest throw si demande absente", async () => {
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }),
      }),
    });

    await expect(acceptFriendRequest(1, 2)).rejects.toThrow(
      "Demande introuvable",
    );
  });

  it("acceptFriendRequest retourne resultat", async () => {
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ status: "accepted" }]),
        }),
      }),
    });

    const result = await acceptFriendRequest(1, 2);
    expect(result.status).toBe("accepted");
  });

  it("rejectFriendRequest throw si demande absente", async () => {
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }),
      }),
    });

    await expect(rejectFriendRequest(1, 2)).rejects.toThrow(
      "Demande introuvable",
    );
  });

  it("rejectFriendRequest retourne resultat", async () => {
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ status: "rejected" }]),
        }),
      }),
    });

    const result = await rejectFriendRequest(1, 2);
    expect(result.status).toBe("rejected");
  });

  it("removeFriend execute un delete", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    mockDb.delete.mockReturnValue({ where });

    await removeFriend(1, 2);

    expect(mockDb.delete).toHaveBeenCalledTimes(1);
    expect(where).toHaveBeenCalledTimes(1);
  });
});
