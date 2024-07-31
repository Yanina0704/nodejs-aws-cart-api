import { CartItem } from '../../cart/models';

export enum OrderStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  ORDERED = 'ORDERED',
}

export type Order = {
  id?: string,
  userId: string;
  cartId: string;
  items: CartItem[]
  payment: {
    type: string,
    address?: any,
    creditCard?: any,
  },
  delivery: {
    type: string,
    address: any,
  },
  comments: string,
  status: string;
  total: number;
}
