import { IsNumber, IsOptional, Min } from 'class-validator';

export class GetUserFiles {
  @IsOptional()
  @IsNumber()
  @Min(0)
  list_size: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number;
}
