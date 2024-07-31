import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { CartEntity } from 'src/entities/cart.entity';
import { CartItemEntity } from '../entities/cartItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    OrderModule,
  ],
  providers: [ CartService ],
  controllers: [ CartController ]
})
export class CartModule {}
