import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { CreateUserInput } from './dto/createUserInput';
import { UpdateAuthInput } from './dto/update-auth.input';
import { SigninResponse } from './dto/signinResponse';
import { SignInInput } from './dto/signinInput';
import { LogoutResponse } from './dto/logoutResponse';
import { Public } from './decorators/public.decorators';
import { NewTokenResponse } from './dto/newTokenResponse';
import { CurrentUserId } from './decorators/currentUserId.decorator';
import { CurrentUser } from './decorators/currentUser.decorator';
import { UseGuards } from '@nestjs/common';
import { RefreshTokenGaurd } from './guards/refreshToken.gaurd';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Mutation(() => SigninResponse)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.authService.createUser(createUserInput);
  }

  @Public()
  @Mutation(() => SigninResponse)
  signIn(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }
  @Mutation(() => LogoutResponse)
  logout(@Args('id') id: string) {
    return this.authService.logout(id);
  }
  // @Public()
  @Query(() => String)
  hello() {
    return 'Hello World!';
  }

  @Public()
  @UseGuards(RefreshTokenGaurd)
  @Mutation(() => NewTokenResponse)
  getNewTokens(
    @CurrentUserId() userId: string,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.getNewToken(userId, refreshToken);
  }

  @Query(() => [Auth], { name: 'auth' })
  findAll() {
    return this.authService.findAll();
  }

  @Query(() => Auth, { name: 'auth' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.authService.findOne(id);
  }

  @Mutation(() => Auth)
  updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
    return this.authService.update(updateAuthInput.id, updateAuthInput);
  }

  @Mutation(() => Auth)
  removeAuth(@Args('id', { type: () => Int }) id: number) {
    return this.authService.remove(id);
  }
}
