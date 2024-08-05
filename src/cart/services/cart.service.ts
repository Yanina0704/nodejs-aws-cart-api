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
  }

  async findOrCreateByUserId(userId: string) {

      const userCart = this.findByUserId(userId);
      return userCart || await this.createByUserId(userId);
    }
    
    async updateByUserId(
      userId: string,
      cartItem: Partial<CartItemEntity>,
    ) {
    const cart = await this.findOrCreateByUserId(userId);

    if (cartItem.count === 1) {
      const newItem = new CartItemEntity(cartItem);
      const product = new ProductEntity(cartItem.product);
      newItem.product = product;
      newItem.cart = cart;

      await this.cartItemsRepository.save(newItem);
    } else if (cartItem.count === 0) {
      await this.cartItemsRepository.delete({
        product: {
          id: cartItem.product.id
        },
        cart: {
          id: cart.id
        },
      });
    } else {
      const itemToUpdate = await this.cartItemsRepository.findOne({
        where: {
          product: {
            id: cartItem.product.id
          },
          cart: {
            id: cart.id
          },
        },
      });

      await this.cartItemsRepository.update(
        {
          id: itemToUpdate.id
        },
        {
          count: cartItem.count,
        },
      );
    
      return await this.cartRepository.findOne({
        where: {
          id: cart.id
        },
        relations: {
          items: {
            product: true
          }
        },
      });
  }
    }

  async updateUserCartStatus(
    queryRunner: QueryRunner,
    userId: string,
    status: CartStatuses,
  ) {
    const userCart = await this.cartRepository.findOne({
      where: {
        status: CartStatuses.OPEN, user: {
          id: userId
        }
      },
    });

    if (!userCart) {
      throw new NotFoundException('Cart not found');

      userCart.status = status;
  
      await queryRunner.manager.getRepository(CartEntity).save(userCart);
  }
}
  async removeByUserId(userId: string) {
    const userCart = await this.cartRepository.findOne({
      where: {
        status: CartStatuses.OPEN, user: {
        id: userId
      }
    },
    });

    if (!userCart) {
      throw new NotFoundException('Cart not found');
    }

    return await this.cartRepository.remove(userCart);
  }
}
