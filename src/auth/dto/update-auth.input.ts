import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './createUserInput';

@InputType()
export class UpdateAuthInput extends PartialType(CreateUserInput) {
  @Field(() => Int)
  id: number;
}
