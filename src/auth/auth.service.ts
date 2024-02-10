import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthInput } from './dto/update-auth.input';
import { CreateUserInput } from './dto/createUserInput';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignInInput } from './dto/signinInput';
import { hash, verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createUser(createUserInput: CreateUserInput) {
    const password = await hash(createUserInput.password);

    const user = await this.prisma.user.create({
      data: {
        username: createUserInput.username,
        password: password,
      },
    });
    const { accessToken, refreshToken } = await this.CreateToken(
      user.id,
      user.username,
    );
    await this.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user };
  }

  async signIn(signinInput: SignInInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: signinInput.username,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username and password');
    }
    const isPasswordCorrect = await verify(user.password, signinInput.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid username and password');
    }

    const { accessToken, refreshToken } = await this.CreateToken(
      user.id,
      user.username,
    );

    return { accessToken, refreshToken, user };
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: { not: null },
      },
      data: { refreshToken: null },
    });
    return { loggedOut: true };
  }

  async getNewToken(userId: string, refreshTokenIn: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Authentication Invalid');
    }
    const isRefreshTokenCorrect = await verify(
      user.refreshToken,
      refreshTokenIn,
    );
    if (!isRefreshTokenCorrect) {
      throw new UnauthorizedException('Authentication Invalid');
    }

    const { accessToken, refreshToken } = await this.CreateToken(
      user.id,
      user.username,
    );

    await this.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async CreateToken(userId: string, username: string) {
    const accessToken = this.jwtService.sign(
      {
        userId,
        username,
      },
      {
        expiresIn: '15m',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId,
        username,
        accessToken,
      },
      {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      },
    );
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
