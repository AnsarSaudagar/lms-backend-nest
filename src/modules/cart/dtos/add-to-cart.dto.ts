import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: '664f1c2b9a1e2f3d4c5b6a7d', description: 'MongoDB ObjectId of the project to add' })
  @IsMongoId()
  @IsNotEmpty()
  projectId!: string;
}
