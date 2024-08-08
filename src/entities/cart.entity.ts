import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
  } from 'typeorm';
  import { CartStatuses } from '../cart/models';
  import { UserEntity } from './user.entity';
  import { CartItemEntity } from './cartItem.entity';
  import { OrderEntity } from './order.entity';
  
  @Entity('carts')
  export class CartEntity {
    constructor(partialEntity: Partial<CartEntity>) {
      Object.assign(this, partialEntity);
    }
  
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'enum',
      enum: CartStatuses,
    })
    status: CartStatuses;
  
    @ManyToOne(() => UserEntity, (user) => user.carts, { nullable: false })
    user: UserEntity;
  
    @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
      cascade: true,
    })
    items: CartItemEntity[];
  
    @OneToOne(() => OrderEntity, (order) => order.cart, {
      nullable: false,
    })
    order: OrderEntity;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }