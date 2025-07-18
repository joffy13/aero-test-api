import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { JwtToken } from 'src/common/decorators/jwt-token-decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  А;
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post('signin/new_token')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('logout')
  async logout(@UserId() userId: string, @JwtToken() token: string) {
    return this.authService.logout(userId, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('info')
  async info(@UserId() userId: string) {
    return { id: userId };
  }
}
