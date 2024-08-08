import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
  } from 'typeorm';
  import { CartEntity } from './cart.entity';
  import { CartItemEntity } from './cartItem.entity';
  
  @Entity('products')
  export class ProductEntity {
    constructor(partialEntity: Partial<CartItemEntity>) {
      Object.assign(this, partialEntity);
    }
  
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('varchar')
    title: string;
  
    @Column('varchar')
    description: string;
  
    @Column({ type: 'integer' })
    price: number;
  
    @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product, {
      nullable: false,
    })
    cartItem: CartItemEntity;
  }