export type User = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  photo?: string;
  profilePicture?: string | null;
  role?: string;
};

export type ProfileUpdateData = {
  username?: string;
  email?: string;
  profilePicture?: string;
};
