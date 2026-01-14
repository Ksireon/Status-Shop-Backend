import { ApiProperty } from '@nestjs/swagger';

export class ShopDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  city: { ru: string; uz: string; en: string };

  @ApiProperty()
  address: { ru: string; uz: string; en: string };

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  cardNumber?: string | null;

  @ApiProperty()
  workHours: string;
}
