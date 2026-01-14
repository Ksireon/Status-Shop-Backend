export declare class ProductDto {
    id: string;
    type: string;
    categoryKey: string;
    name: {
        ru: string;
        uz: string;
        en: string;
    };
    description: {
        ru: string;
        uz: string;
        en: string;
    };
    price: number;
    images: string[];
    sizes: string[];
    colors: string[];
    characteristics?: unknown;
    isFeatured: boolean;
}
