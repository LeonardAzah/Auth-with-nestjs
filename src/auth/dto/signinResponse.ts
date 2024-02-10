import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';
@ObjectType()
export class SigninResponse {
  @IsNotEmpty()
  @IsString()
  @Field()
  refreshToken: string;

  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
