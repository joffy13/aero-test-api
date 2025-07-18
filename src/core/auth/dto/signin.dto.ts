import { IsNotEmpty } from 'class-validator';
import { IsEmailOrPhone } from 'src/common/validators/is-email-or-phone.validator';

export class SigninDto {
  @IsNotEmpty()
  @IsEmailOrPhone({ message: 'id должен быть email или номером телефона' })
  id: string;

  @IsNotEmpty()
  password: string;
}
