import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty() @IsEmail() email!: string
  @ApiProperty() @IsString() @MinLength(6) password!: string
  @ApiProperty() @IsString() name!: string
  @ApiProperty() @IsString() surname!: string
  @ApiProperty() @IsString() @IsOptional() company?: string
  @ApiProperty() @IsString() @IsOptional() position?: string
  @ApiProperty() @IsString() @IsOptional() city?: string
  @ApiProperty() @IsString() @IsOptional() phone?: string
}
