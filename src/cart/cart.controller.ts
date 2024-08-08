import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus, BadRequestException } from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';

import { DataSource } from 'typeorm';
import { BasicAuthGuard } from 'src/auth/guards';
import { UpdateCartDto } from '../dto/updateCart.dto';
import { OrderService } from '../order';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { OrderEntity } from '../entities/order.entity';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';

import { CartStatuses } from './models';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private dataSource: DataSource,
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const cart = await this.cartService.findOrCreateByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { cart, total: calculateCartTotal(cart) },
      cart,
      total: calculateCartTotal(cart),
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) { // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(getUserIdFromRequest(req), body)

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      },
      cart,
      total: calculateCartTotal(cart),
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  clearUserCart(@Req() req: AppRequest) {
    this.cartService.removeByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode

      return {
        statusCode,
        message: 'Cart is empty',
      }
      throw new BadRequestException();
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let order: OrderEntity;
    try {
      order = await this.orderService.create(
        queryRunner,
        new CreateOrderDto({
          ...body,
          userId,
          cartId,
          total,
        }),
      );
      await this.cartService.updateUserCartStatus(
        queryRunner,
        userId,
        CartStatuses.ORDERED,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order }
    }
  }
}
