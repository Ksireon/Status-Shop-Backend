import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  categoryKey: string;

  @ApiProperty()
  name: { ru: string; uz: string; en: string };

  @ApiProperty()
  description: { ru: string; uz: string; en: string };

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [String] })
  sizes: string[];

  @ApiProperty({ type: [String] })
  colors: string[];

  @ApiProperty({ required: false, type: Object })
  characteristics?: unknown;

  @ApiProperty()
  isFeatured: boolean;
}

