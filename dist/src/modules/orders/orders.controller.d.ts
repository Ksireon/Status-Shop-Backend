import type { JwtUser } from '../../common/auth/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly orders;
    constructor(orders: OrdersService);
    create(user: JwtUser, dto: CreateOrderDto): Promise<OrderDto>;
    my(user: JwtUser): Promise<OrderDto[]>;
    get(user: JwtUser, id: string): Promise<OrderDto>;
}
