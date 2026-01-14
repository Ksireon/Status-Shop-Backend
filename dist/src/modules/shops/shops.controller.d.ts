import { ShopDto } from './dto/shop.dto';
import { ShopsService } from './shops.service';
export declare class ShopsController {
    private readonly shops;
    constructor(shops: ShopsService);
    list(): Promise<ShopDto[]>;
}
