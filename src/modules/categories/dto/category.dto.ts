import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  name: { ru: string; uz: string; en: string };

  @ApiProperty({ required: false })
  icon?: string | null;

  @ApiProperty()
  sortOrder: number;
}
