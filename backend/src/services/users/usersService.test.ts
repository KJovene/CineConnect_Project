const mockUsersRepository = {
  findLatestRatingsByUserId: jest.fn(),
  findLatestCommentsByUserId: jest.fn(),
  findUsersBySearch: jest.fn(),
  findUserRelationsWithOthers: jest.fn(),
};

const mockReviewsService = {
  getUserCommentReplyNotifications: jest.fn(),
};

jest.mock("../../repository/usersRepository.js", () => mockUsersRepository);
jest.mock("../reviews/reviewsService.js", () => mockReviewsService);

import {
  getCommentReplies,
  getLatestComments,
  getLatestRatings,
  searchUsers,
} from "./usersService.js";

describe("usersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getLatestRatings mappe createdAt en string", async () => {
    mockUsersRepository.findLatestRatingsByUserId.mockResolvedValue([
      {
        reviewId: 1,
        filmId: 2,
        omdbId: "tt1",
        filmTitle: "A",
        posterUrl: null,
        rating: 5,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const result = await getLatestRatings(1, { limit: 10 });

    expect(result[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(mockUsersRepository.findLatestRatingsByUserId).toHaveBeenCalledWith(
      1,
      10,
    );
  });

  it("getLatestRatings borne la limite", async () => {
    mockUsersRepository.findLatestRatingsByUserId.mockResolvedValue([]);

    await getLatestRatings(1, { limit: 999 });

    expect(mockUsersRepository.findLatestRatingsByUserId).toHaveBeenCalledWith(
      1,
      200,
    );
  });

  it("getLatestComments mappe isReply et fallback commentaire", async () => {
    mockUsersRepository.findLatestCommentsByUserId.mockResolvedValue([
      {
        reviewId: 1,
        filmId: 2,
        omdbId: "tt1",
        filmTitle: "A",
        posterUrl: null,
        comment: null,
        parentReviewId: 9,
        createdAt: null,
      },
    ]);

    const result = await getLatestComments(1, { pageSize: 7 });

    expect(result[0].isReply).toBe(true);
    expect(result[0].comment).toBe("");
    expect(mockUsersRepository.findLatestCommentsByUserId).toHaveBeenCalledWith(
      1,
      7,
    );
  });

  it("getCommentReplies delegue au service reviews", async () => {
    mockReviewsService.getUserCommentReplyNotifications.mockResolvedValue([
      { replyReviewId: 1 },
    ]);

    const result = await getCommentReplies(1, { limit: 3 });

    expect(result).toEqual([{ replyReviewId: 1 }]);
    expect(
      mockReviewsService.getUserCommentReplyNotifications,
    ).toHaveBeenCalledWith({
      userId: 1,
      limit: 3,
    });
  });

  it("searchUsers retourne [] pour recherche courte", async () => {
    const result = await searchUsers(1, "a");

    expect(result).toEqual([]);
    expect(mockUsersRepository.findUsersBySearch).not.toHaveBeenCalled();
  });

  it("searchUsers exclut soi-meme", async () => {
    mockUsersRepository.findUsersBySearch.mockResolvedValue([
      { id: 1, name: "Me", email: "m", image: null },
    ]);

    const result = await searchUsers(1, "me");

    expect(result).toEqual([]);
    expect(
      mockUsersRepository.findUserRelationsWithOthers,
    ).not.toHaveBeenCalled();
  });

  it("searchUsers mappe relationStatus accepted", async () => {
    mockUsersRepository.findUsersBySearch.mockResolvedValue([
      { id: 1, name: "Me", email: "m", image: null },
      { id: 2, name: "Bob", email: "b", image: null },
    ]);
    mockUsersRepository.findUserRelationsWithOthers.mockResolvedValue([
      { user_id: 1, friend_user_id: 2, status: "accepted" },
    ]);

    const result = await searchUsers(1, "bo");

    expect(result[0].relationStatus).toBe("accepted");
  });

  it("searchUsers mappe pending quand status null", async () => {
    mockUsersRepository.findUsersBySearch.mockResolvedValue([
      { id: 1, name: "Me", email: "m", image: null },
      { id: 2, name: "Bob", email: "b", image: null },
      { id: 3, name: "Eve", email: "e", image: null },
    ]);
    mockUsersRepository.findUserRelationsWithOthers.mockResolvedValue([
      { user_id: 2, friend_user_id: 1, status: null },
    ]);

    const result = await searchUsers(1, "bo");

    expect(result).toHaveLength(2);
    expect(result[0].relationStatus).toBe("pending");
    expect(result[1].relationStatus).toBeNull();
  });
});
