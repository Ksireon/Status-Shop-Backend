import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categories;
    constructor(categories: CategoriesService);
    list(): Promise<CategoryDto[]>;
}
