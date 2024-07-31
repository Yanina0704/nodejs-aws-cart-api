import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { Order, OrderStatus } from '../models';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateOrderDto } from 'src/dto/createOrder.dto';
import { CartEntity } from 'src/entities/cart.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
  ) {}

  async findById(orderId: string) {
    return await this.orderRepository.findOneBy({
      id: orderId
    });
  }

  async update(orderId: string, data: Partial<CreateOrderDto>) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    const {
      cartId,
      userId,
      total,
      status,
      address,
      comments,
      payment
    } = data;

    if (cartId) {
      order.cart = new CartEntity({
        id: cartId
      });
    }

    if (userId) {
      order.user = new UserEntity({
        id: userId
      });
    }

    order.total = total;
    order.status = status;
    order.delivery = address;
    order.comments = comments;
    order.delivery = JSON.stringify(address);
    order.payment = JSON.stringify(payment);

    return await this.orderRepository.save(order);
  }

  async create(queryRunner: QueryRunner, data: CreateOrderDto) {
    const {
      cartId,
      userId,
      total,
      address,
      comments,
      payment
    } = data;

    const order = new OrderEntity({
      status: OrderStatus.IN_PROGRESS
    });

    order.cart = new CartEntity({
      id: cartId
    });

    order.user = new UserEntity({
      id: userId
    });

    order.total = total;
    order.comments = comments;
    order.delivery = JSON.stringify(address);
    order.payment = JSON.stringify(payment);

    return await queryRunner.manager.getRepository(OrderEntity).save(order);
  }
}
