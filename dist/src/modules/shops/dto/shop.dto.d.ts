export declare class ShopDto {
    id: string;
    key: string;
    city: {
        ru: string;
        uz: string;
        en: string;
    };
    address: {
        ru: string;
        uz: string;
        en: string;
    };
    phone: string;
    cardNumber?: string | null;
    workHours: string;
}
