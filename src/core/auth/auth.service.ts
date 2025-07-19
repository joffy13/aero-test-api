import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { AuthToken } from './entities/auth-token.entity';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(AuthToken)
    private tokenRepository: Repository<AuthToken>,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const salt = await bcrypt.genSalt(8);
    const password = await bcrypt.hash(dto.password, salt);
    const user = await this.userService.create({ ...dto, password });
    return this.generateTokens(user.id);
  }

  async signin(dto: SigninDto) {
    const user = await this.userService.findOneById(dto.id);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id);
  }

  async refresh(refreshToken: string) {
    const stored = await this.tokenRepository.findOne({
      where: { refreshToken },
    });
    if (!stored) throw new UnauthorizedException('Invalid token');

    await this.tokenRepository.remove(stored);
    return this.generateTokens(stored.userId);
  }

  async logout(userId: string, token: string) {
    await this.tokenRepository.delete({ userId, accessToken: token });
    return { message: 'Logged out' };
  }

  private async generateTokens(userId: string) {
    const payload = { userId: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    const days = parseInt(
      this.configService.get('REFRESH_TOKEN_EXPIRATION_DAYS', '30'),
      10,
    );
    expiresAt.setDate(expiresAt.getDate() + days);

    const entity = this.tokenRepository.create({
      accessToken,
      refreshToken,
      userId: userId,
      isActive: true,
      expiresAt,
    });
    await this.tokenRepository.save(entity);

    return { accessToken, refreshToken };
  }
  private generateRefreshToken(): string {
    return require('crypto').randomBytes(64).toString('hex') as string;
  }

  async findAuthToken(userId: string, token: string) {
    return this.tokenRepository.findOne({
      where: { userId: userId, accessToken: token },
    });
  }
}
