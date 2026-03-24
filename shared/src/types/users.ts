export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse extends Omit<User, "id"> {
  id: string;
}
