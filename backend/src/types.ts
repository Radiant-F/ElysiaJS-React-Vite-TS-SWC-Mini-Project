export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoRecord = {
  id: string;
  userId: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Pagination = {
  limit: number;
  offset: number;
};
