import { AuthToken } from 'src/core/auth/entities/auth-token.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { File } from '../../file/entities/file.entity';

@Entity()
export class User {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  password: string;

  @OneToMany(() => File, (file: File) => file.user)
  files: File[];

  @OneToMany(() => AuthToken, (token) => token.user, { cascade: true })
  authTokens: AuthToken[];
}
