export type JwtPayload = {
  username: string;
  userId: string;
};

export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string };
