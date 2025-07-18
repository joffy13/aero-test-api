import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ICreateUser } from './user.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(dto: ICreateUser) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id: dto.id },
      });
      if (existingUser) {
        throw new ConflictException('User already exist');
      }
      const user = await this.userRepository.save(dto);
      return user;
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  findOneById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
}
