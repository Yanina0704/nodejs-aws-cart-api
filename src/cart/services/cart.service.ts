import { Injectable, NotFoundException } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart } from '../models';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItemEntity } from 'src/entities/cartItem.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { CartStatuses } from 'src/cart/models';
import { CartEntity } from 'src/entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItemEntity)
    private cartItemsRepository: Repository<CartItemEntity>,
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,
  ) {}

  async findByUserId(userId: string) {
    return await this.cartRepository.findOne({
      where: {
        status: CartStatuses.OPEN, user: {
        id: userId
        } 
      },
      relations: {
        items: {
          product: true
        }
      },
    });
  }

  async createByUserId(userId: string) {
    const cart = this.cartRepository.create({
      status: CartStatuses.OPEN
    });

    cart.user = new UserEntity({
      id: userId
    });

    const createdCart = await this.cartRepository.save(cart);

    return await this.cartRepository.findOne({
      where: {
        id: createdCart.id
      },
      relations: {
        items: {
          product: true
        }
      },
    });

    async findOrCreateByUserId(userId: string) {
      const userCart = this.findByUserId(userId);
    

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, { items }: Cart): Cart {
    const { id, ...rest } = this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [ ...items ],
    }

    this.userCarts[ userId ] = { ...updatedCart };

    return { ...updatedCart };
  }

  removeByUserId(userId): void {
    this.userCarts[ userId ] = null;
  }

}
}
