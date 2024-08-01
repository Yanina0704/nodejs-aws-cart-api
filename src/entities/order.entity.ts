import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { CartEntity } from './cart.entity';
  import { UserEntity } from './user.entity';
  import { OrderStatus } from '../order/models';
  
  @Entity('orders')
  export class OrderEntity {
    constructor(partialEntity: Partial<OrderEntity>) {
      Object.assign(this, partialEntity);
    }
  
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => UserEntity, (user) => user.orders, { nullable: false })
    user: UserEntity;
  
    @OneToOne(() => CartEntity, (cart) => cart.order, {
      nullable: false,
    })
  
    @JoinColumn()
    cart: CartEntity;
  
    @Column({ type: 'json' })
    payment: string;
  
    @Column({ type: 'json' })
    delivery: string;
  
    @Column({ type: 'varchar', nullable: true })
    comments: string;
  
    @Column({
      type: 'enum',
      enum: OrderStatus,
    })
    status: OrderStatus;
  
    @Column({ type: 'integer' })
    total: number;
  }