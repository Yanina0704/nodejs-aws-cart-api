import { IsNotEmpty } from 'class-validator';
import { ProductEntity } from '../entities/product.entity';

export class UpdateCartDto {
  @IsNotEmpty()
  count: number;

  @IsNotEmpty()
  product: ProductEntity;
}