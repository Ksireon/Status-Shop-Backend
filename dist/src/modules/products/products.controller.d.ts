import { ProductDto } from './dto/product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly products;
    constructor(products: ProductsService);
    list(filter: ProductFilterDto): Promise<ProductDto[]>;
    get(id: string): Promise<ProductDto>;
}
