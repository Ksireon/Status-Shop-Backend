import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../../common/dto/pagination.query';

export class AdminListUsersQuery extends PaginationQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsString()
  shopId?: string;
}
