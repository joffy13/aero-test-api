import { IsNotEmpty, IsStrongPassword } from 'class-validator';
import { IsEmailOrPhone } from 'src/common/validators/is-email-or-phone.validator';
import { ICreateUser } from 'src/core/user/user.types';

export class SignupDto implements ICreateUser {
  @IsNotEmpty()
  @IsEmailOrPhone({ message: 'id must be phone number or email' })
  id: string;

  @IsStrongPassword({
    minLength: 8,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
}
