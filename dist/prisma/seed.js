"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function toColorsFromImages(images) {
    return images
        .map((p) => {
        const file = p.split('/').pop() ?? p;
        return file.replace(/\.[^.]+$/, '');
    })
        .filter((x) => x.length > 0);
}
async function main() {
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { key: 'textile' },
            update: {},
            create: {
                key: 'textile',
                nameRu: 'Текстиль',
                nameUz: 'Tekstil',
                nameEn: 'Textile',
                sortOrder: 1,
            },
        }),
        prisma.category.upsert({
            where: { key: 'vinil' },
            update: {},
            create: {
                key: 'vinil',
                nameRu: 'Термо винил',
                nameUz: 'Termo vinil',
                nameEn: 'Heat vinyl',
                sortOrder: 2,
            },
        }),
        prisma.category.upsert({
            where: { key: 'dtf' },
            update: {},
            create: {
                key: 'dtf',
                nameRu: 'DTF материалы',
                nameUz: 'DTF materiallari',
                nameEn: 'DTF materials',
                sortOrder: 3,
            },
        }),
        prisma.category.upsert({
            where: { key: 'cups' },
            update: {},
            create: {
                key: 'cups',
                nameRu: 'Сублимационные кружки',
                nameUz: 'Sublimatsiya krujkalar',
                nameEn: 'Sublimation mugs',
                sortOrder: 4,
            },
        }),
        prisma.category.upsert({
            where: { key: 'equipment' },
            update: {},
            create: {
                key: 'equipment',
                nameRu: 'Оборудование',
                nameUz: 'Uskunalar',
                nameEn: 'Equipment',
                sortOrder: 5,
            },
        }),
    ]);
    const categoryByKey = new Map(categories.map((c) => [c.key, c]));
    const products = [
        {
            type: 'clothes',
            categoryKey: 'textile',
            name: { ru: 'Футболка Статус', uz: 'Status futbolkasi', en: 'Status T-shirt' },
            description: {
                ru: 'Футболка из плотного хлопка премиум-класса. Хорошо держит форму, приятная к телу, идеально подходит для термопереноса и повседневной носки.',
                uz: 'Premium sifatli paxtadan tikilgan futbolka. Yaxshi shaklni saqlaydi, teriga yoqimli, termo bosma va kundalik kiyim uchun ideal.',
                en: 'Premium-quality cotton T-shirt. Keeps its shape, soft on skin, ideal for heat transfer printing and everyday wear.',
            },
            price: 95000,
            images: ['assets/images/tshirt.png'],
            characteristics: {
                material: { ru: 'Хлопок 100%', uz: '100% paxta', en: '100% cotton' },
                weight: { ru: '180 г/м²', uz: '180 g/m²', en: '180 g/m²' },
                sizes: { ru: 'S–XXL', uz: 'S–XXL', en: 'S–XXL' },
                suitable: { ru: 'Подходит для термопереноса', uz: 'Termo bosma uchun mos', en: 'Suitable for heat transfer' },
            },
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            isFeatured: true,
            sortOrder: 1,
        },
        {
            type: 'clothes',
            categoryKey: 'textile',
            name: { ru: 'Футболка Классик', uz: 'Classic futbolkasi', en: 'Classic T-shirt' },
            description: {
                ru: 'Лёгкая классическая футболка с аккуратным швом. Удобна для повседневной носки и нанесения небольших принтов.',
                uz: 'Yengil klassik futbolka, toza tikuv bilan. Kundalik kiyim va kichik printlar uchun qulay.',
                en: 'Lightweight classic T-shirt with neat seams. Comfortable for daily wear and small prints.',
            },
            price: 90000,
            images: ['assets/images/tshirt.png'],
            characteristics: {
                material: { ru: 'Хлопок 100%', uz: '100% paxta', en: '100% cotton' },
                weight: { ru: '150 г/м²', uz: '150 g/m²', en: '150 g/m²' },
                sizes: { ru: 'S–XXL', uz: 'S–XXL', en: 'S–XXL' },
            },
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            isFeatured: true,
            sortOrder: 2,
        },
        {
            type: 'cap',
            categoryKey: 'textile',
            name: { ru: 'Кепка', uz: 'Kepka', en: 'Cap' },
            description: {
                ru: 'Универсальная кепка с регулируемой застёжкой. Подходит для нанесения вышивки и небольших термонаклеек.',
                uz: 'Sozlanadigan qulflanishli universal kepka. Tikuv va kichik termo naqshlar uchun mos.',
                en: 'Adjustable cap with a strap. Suitable for embroidery and small heat transfers.',
            },
            price: 80000,
            images: ['assets/images/cap.png'],
            characteristics: {
                material: { ru: 'Хлопок', uz: 'Paxta', en: 'Cotton' },
                adjustment: { ru: 'Регулируемая застёжка', uz: 'Sozlanadigan qulflash', en: 'Adjustable strap' },
            },
            isFeatured: true,
            sortOrder: 3,
        },
        {
            type: 'oversize',
            categoryKey: 'textile',
            name: { ru: 'Худи', uz: 'Hudi', en: 'Hoodie' },
            description: {
                ru: 'Тёплый худи с начёсом внутри, плотный материал и качественные швы. Отличный выбор для нанесения объемных принтов и флок-декора.',
                uz: 'Ichida tukli issiq hudi, zich mato va sifatli tikuvlar. Hajmli printlar va flok dekor uchun yaxshi tanlov.',
                en: 'Warm hoodie with brushed interior, dense fabric and quality seams. Great for bulky prints and flock decorations.',
            },
            price: 175000,
            images: ['assets/images/hudi.png'],
            characteristics: {
                material: { ru: 'Флис (начёс)', uz: 'Fleece (tukli)', en: 'Fleece (brushed)' },
                sizes: { ru: 'M–XL', uz: 'M–XL', en: 'M–XL' },
                uses: {
                    ru: 'Подходит для флок, сублимации и термопереноса',
                    uz: 'Flok, sublimatsiya va termo bosma uchun mos',
                    en: 'Suitable for flock, sublimation and heat transfer',
                },
            },
            sizes: ['M', 'L', 'XL'],
            isFeatured: true,
            sortOrder: 4,
        },
        {
            type: 'clothes',
            categoryKey: 'textile',
            name: { ru: 'Свитшот', uz: 'Svitsot', en: 'Sweatshirt' },
            description: {
                ru: 'Классический свитшот из футера — удобен в носке и хорошо держит форму после стирок. Подходит для нанесения плотных принтов.',
                uz: 'Futer materiale klassik svitsot — qulay va yuvishdan keyin shaklni saqlaydi. Qalin printlar uchun mos.',
                en: 'Classic sweatshirt made of fleece — comfortable and retains shape after washes. Good for dense prints.',
            },
            price: 160000,
            images: ['assets/images/svitshot.png'],
            characteristics: {
                material: { ru: 'Футер', uz: 'Futer', en: 'Fleece' },
                sizes: { ru: 'S–XXL', uz: 'S–XXL', en: 'S–XXL' },
            },
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            isFeatured: false,
            sortOrder: 5,
        },
        {
            type: 'bag',
            categoryKey: 'textile',
            name: { ru: 'ЭКО сумка', uz: 'EKO sumka', en: 'ECO Bag' },
            description: {
                ru: 'Экологичная сумка из спанбонда — лёгкая и прочная, удобна для нанесения логотипов и принтов.',
                uz: 'Spanbonddan yasalgan ekologik sumka — yengil va mustahkam, logotip va printlar uchun qulay.',
                en: 'Eco-friendly bag made of spunbond — lightweight and durable, easy for logos and prints.',
            },
            price: 55000,
            images: ['assets/images/eco_bag.png'],
            characteristics: {
                material: { ru: 'Спанбонд', uz: 'Spanbond', en: 'Spunbond' },
                size: { ru: '40×35 см', uz: '40×35 sm', en: '40×35 cm' },
            },
            isFeatured: false,
            sortOrder: 6,
        },
        {
            type: 'vinil',
            categoryKey: 'vinil',
            name: { ru: 'PU Flex', uz: 'PU Flex', en: 'PU Flex' },
            description: {
                ru: 'PU Flex — премиальная термотрансферная плёнка высокой эластичности и яркой передачи цвета. Подходит для спортивной и тонкой одежды.',
                uz: 'PU Flex — yuqori elastiklik va yorqin rang beruvchi premium termo plyonka. Sport va yupqa kiyimlar uchun mos.',
                en: 'PU Flex — premium heat transfer film with high elasticity and vivid color reproduction. Suitable for sportswear and lightweight fabrics.',
            },
            price: 140000,
            images: Array.from({ length: 41 }).map((_, i) => `assets/vinill/pu/pu_${i + 1}.png`),
            characteristics: {
                width: { ru: 'Ширина рулона: 50 см', uz: 'Rolning eni: 50 sm', en: 'Roll width: 50 cm' },
                temp: { ru: 'Температура прессования: 150°C', uz: 'Bosish harorati: 150°C', en: 'Press temperature: 150°C' },
                time: { ru: 'Время: 10 сек', uz: 'Vaqt: 10 s', en: 'Time: 10 sec' },
            },
            isFeatured: false,
            sortOrder: 20,
        },
        {
            type: 'vinil',
            categoryKey: 'vinil',
            name: { ru: 'PVC Flex', uz: 'PVC Flex', en: 'PVC Flex' },
            description: {
                ru: 'Плотная PVC-плёнка для устойчивых к износу принтов. Подходит для рабочей и промо-одежды.',
                uz: 'Kuchli PVC plyonka, aşınishga bardoshli printlar uchun. Ish kiyimi va promo kiyimlar uchun mos.',
                en: 'Durable PVC film for wear-resistant prints. Good for workwear and promo apparel.',
            },
            price: 120000,
            images: [
                'assets/vinill/pvc/pvc_1.png',
                'assets/vinill/pvc/pvc_2.png',
                'assets/vinill/pvc/pvc_3.png',
                'assets/vinill/pvc/pvc_9.png',
                'assets/vinill/pvc/pvc_11.png',
                'assets/vinill/pvc/pvc_15.png',
                'assets/vinill/pvc/pvc_17.png',
                'assets/vinill/pvc/pvc_28.png',
                'assets/vinill/pvc/pvc_31.png',
            ],
            characteristics: {
                width: { ru: '50 см', uz: '50 sm', en: '50 cm' },
                temp: { ru: '155°C', uz: '155°C', en: '155°C' },
            },
            isFeatured: false,
            sortOrder: 21,
        },
        {
            type: 'vinil',
            categoryKey: 'vinil',
            name: { ru: 'Flock', uz: 'Flock', en: 'Flock' },
            description: {
                ru: 'Бархатистый винил с мягкой текстурой — придаёт изделиям приятный тактильный эффект.',
                uz: 'Yumshoq teksturali barxat vinil — buyumlarga yoqimli teginish beradi.',
                en: 'Velvety vinyl with soft texture — gives garments a pleasant tactile feel.',
            },
            price: 130000,
            images: [
                'assets/vinill/flock/flock_black.png',
                'assets/vinill/flock/flock_cream.png',
                'assets/vinill/flock/flock_darkpink.png',
                'assets/vinill/flock/flock_green.png',
                'assets/vinill/flock/flock_indigo.png',
                'assets/vinill/flock/flock_red.png',
                'assets/vinill/flock/flock_sky.png',
                'assets/vinill/flock/flock_yellow.png',
            ],
            characteristics: {
                width: { ru: '50 см', uz: '50 sm', en: '50 cm' },
                temp: { ru: '160°C', uz: '160°C', en: '160°C' },
            },
            isFeatured: false,
            sortOrder: 22,
        },
        {
            type: 'vinil',
            categoryKey: 'vinil',
            name: { ru: 'Stretch Foil', uz: 'Stretch Foil', en: 'Stretch Foil' },
            description: {
                ru: 'Металлизированная плёнка с хорошей тянущейся способностью — подходит для эффектных надписей и декоративных элементов.',
                uz: 'Ajoyib cho‘ziladigan metall plyonka — dekorativ yozuvlar uchun mos.',
                en: 'Metallic film with good stretchability — ideal for eye-catching lettering and decorations.',
            },
            price: 160000,
            images: [
                'assets/vinill/stretch/stretch_black.png',
                'assets/vinill/stretch/stretch_gold.png',
                'assets/vinill/stretch/stretch_rainbow.png',
                'assets/vinill/stretch/stretch_zebra.png',
            ],
            characteristics: {
                width: { ru: '50 см', uz: '50 sm', en: '50 cm' },
                temp: { ru: '145°C', uz: '145°C', en: '145°C' },
            },
            isFeatured: false,
            sortOrder: 23,
        },
        {
            type: 'vinil',
            categoryKey: 'vinil',
            name: { ru: 'Metalic Flex', uz: 'Metalic Flex', en: 'Metalic Flex' },
            description: {
                ru: 'Глянцевая металлизированная плёнка для ярких, блестящих дизайнов.',
                uz: 'Yorqin porloq metall plyonka — ko‘zni quvontiruvchi dizaynlar uchun.',
                en: 'Glossy metallic film for bright, shiny designs.',
            },
            price: 150000,
            images: ['assets/vinill/metalic/metallic_gold.png', 'assets/vinill/metalic/metallic_silver.png'],
            characteristics: {
                width: { ru: '50 см', uz: '50 sm', en: '50 cm' },
                temp: { ru: '150°C', uz: '150°C', en: '150°C' },
            },
            isFeatured: false,
            sortOrder: 24,
        },
        {
            type: 'vinil',
            categoryKey: 'vinil',
            name: { ru: 'Reflective Flex', uz: 'Reflective Flex', en: 'Reflective Flex' },
            description: {
                ru: 'Светоотражающий винил для спортивной и рабочей одежды — повышает видимость в темное время суток.',
                uz: 'Yorug‘lik aks ettiruvchi vinil — sport va ish kiyimi uchun xavfsizlikni oshiradi.',
                en: 'Reflective vinyl for sports and workwear — enhances visibility at night.',
            },
            price: 155000,
            images: ['assets/vinill/reflective/reflective_black.png', 'assets/vinill/reflective/reflective_chameleon.png'],
            characteristics: {
                width: { ru: '50 см', uz: '50 sm', en: '50 cm' },
                temp: { ru: '150°C', uz: '150°C', en: '150°C' },
            },
            isFeatured: false,
            sortOrder: 25,
        },
        {
            type: 'cups',
            categoryKey: 'cups',
            name: { ru: 'Сублимационная кружка', uz: 'Sublimatsion krujka', en: 'Sublimation Mug' },
            description: {
                ru: 'Белая керамическая кружка 330 мл, специально покрытая для сублимационной печати, устойчива к мытью и ярко передаёт цвета.',
                uz: 'Sublimatsiya uchun qoplangan 330 ml keramika krujka. Yuvishga chidamli va ranglarni jonli beradi.',
                en: 'White 330 ml ceramic mug pre-coated for sublimation printing, wash-resistant and vivid color reproduction.',
            },
            price: 25000,
            images: ['assets/images/glass.png'],
            characteristics: {
                material: { ru: 'Керамика', uz: 'Keramika', en: 'Ceramic' },
                volume: { ru: '330 мл', uz: '330 ml', en: '330 ml' },
            },
            isFeatured: false,
            sortOrder: 40,
        },
        {
            type: 'cups',
            categoryKey: 'cups',
            name: { ru: 'Термос для сублимации', uz: 'Termos', en: 'Sublimation Thermos' },
            description: {
                ru: 'Металлический термос с покрытием под сублимацию, объём 500 мл. Долговечный и удобный для брендирования.',
                uz: 'Sublimatsiya uchun qoplangan metall termos, hajmi 500 ml. Uzoq muddatli va brending uchun qulay.',
                en: 'Metal thermos pre-coated for sublimation, 500 ml. Durable and great for branding.',
            },
            price: 70000,
            images: ['assets/images/termos.png'],
            characteristics: {
                material: { ru: 'Нержавеющая сталь', uz: 'Zanglamaydigan po‘lat', en: 'Stainless steel' },
                volume: { ru: '500 мл', uz: '500 ml', en: '500 ml' },
            },
            isFeatured: false,
            sortOrder: 41,
        },
        {
            type: 'equipment',
            categoryKey: 'equipment',
            name: { ru: 'Плоттер Teneth 70см', uz: 'Plotter Teneth 70см', en: 'Teneth Plotter 70cm' },
            description: {
                ru: 'Профессиональный режущий плоттер шириной до 70 см. Высокая точность, подходит для витринной и промышленной резки винила и термо материалов.',
                uz: '70 sm gacha kesish qobiliyatiga ega professional plotter. Yuqori aniqlik, vinil va termo materiallar uchun mos.',
                en: 'Professional cutting plotter up to 70 cm wide. High precision, suitable for vinyl and thermo materials.',
            },
            price: 6800000,
            images: ['assets/images/plotter.png'],
            characteristics: {
                cut_width: { ru: 'Ширина резки: 70 см', uz: 'Kesish eni: 70 sm', en: 'Cut width: 70 cm' },
                precision: { ru: 'Точность: 0.1 мм', uz: 'Aniqlik: 0.1 mm', en: 'Precision: 0.1 mm' },
            },
            isFeatured: false,
            sortOrder: 60,
        },
        {
            type: 'equipment',
            categoryKey: 'equipment',
            name: { ru: 'Cameo 5', uz: 'Cameo 5', en: 'Cameo 5' },
            description: {
                ru: 'Компактный и удобный плоттер для малого и среднего бизнеса. Подходит для тонкой резки и сложных контуров.',
                uz: 'Kichik va o‘rta biznes uchun kompakt plotter. Nozik kesish va murakkab konturlar uchun mos.',
                en: 'Compact and handy plotter for small and medium businesses. Good for fine cuts and complex contours.',
            },
            price: 5800000,
            images: ['assets/images/cameo.png'],
            characteristics: {
                cut_width: { ru: 'Ширина резки: 30 см', uz: 'Kesish eni: 30 sm', en: 'Cut width: 30 cm' },
            },
            isFeatured: false,
            sortOrder: 61,
        },
        {
            type: 'dtf',
            categoryKey: 'dtf',
            name: { ru: 'DTF краска', uz: 'DTF bo‘yoq', en: 'DTF Ink' },
            description: {
                ru: 'Пигментная DTF-краска CMYK + White для высококачественной печати на пленке перед переносом на ткань.',
                uz: 'DTF CMYK + oq pigmentli siyoh — plyonkaga yuqori sifatli bosim uchun.',
                en: 'Pigment DTF ink CMYK + White for high-quality printing on film prior to transfer.',
            },
            price: 250000,
            images: ['assets/images/dtf_colors.png'],
            characteristics: {
                volume: { ru: 'Объём: 1 л', uz: 'Hajm: 1 l', en: 'Volume: 1 l' },
                type: { ru: 'Пигментная', uz: 'Pigmentli', en: 'Pigment' },
            },
            isFeatured: false,
            sortOrder: 80,
        },
        {
            type: 'dtf',
            categoryKey: 'dtf',
            name: { ru: 'DTF плёнка', uz: 'DTF plyonka', en: 'DTF Film' },
            description: {
                ru: 'Матовая DTF-плёнка, рассчитанная на стабильную передачу красок и лёгкий отдел от основы при переносе.',
                uz: 'Mat DTF plyonka — ranglarni barqaror uzatish va oson ajratish uchun.',
                en: 'Matte DTF film designed for stable ink transfer and easy release during transfer.',
            },
            price: 120000,
            images: ['assets/images/dtf_plenka.png'],
            characteristics: {
                width: { ru: 'Ширина: 60 см', uz: 'E: 60 sm', en: 'Width: 60 cm' },
            },
            isFeatured: false,
            sortOrder: 81,
        },
        {
            type: 'dtf',
            categoryKey: 'dtf',
            name: { ru: 'DTF клей', uz: 'DTF yopishtiruvchi', en: 'DTF Powder/Adhesive' },
            description: {
                ru: 'Порошковый клей для закрепления отпечатка при переносе DTF — обеспечивает хорошее сцепление с тканью.',
                uz: 'DTF ko‘chirishda ishlatiladigan changli yopishtiruvchi — matoga yaxshi yopishadi.',
                en: 'Powder adhesive for fixing DTF prints during transfer — provides good bonding to fabric.',
            },
            price: 85000,
            images: ['assets/images/dtf_glue.png'],
            characteristics: {
                weight: { ru: 'Вес: 1 кг', uz: 'Og‘irlik: 1 kg', en: 'Weight: 1 kg' },
            },
            isFeatured: false,
            sortOrder: 82,
        },
    ];
    for (const p of products) {
        const category = categoryByKey.get(p.categoryKey);
        if (!category)
            continue;
        const images = p.images;
        const colors = toColorsFromImages(images);
        const sizes = p.sizes ?? [];
        const existing = await prisma.product.findFirst({
            where: {
                nameRu: p.name.ru,
                type: p.type,
                categoryId: category.id,
            },
            select: { id: true },
        });
        const data = {
            type: p.type,
            nameRu: p.name.ru,
            nameUz: p.name.uz,
            nameEn: p.name.en,
            descRu: p.description.ru,
            descUz: p.description.uz,
            descEn: p.description.en,
            price: new client_1.Prisma.Decimal(p.price),
            images,
            sizes,
            colors,
            characteristics: (p.characteristics ?? null),
            isFeatured: p.isFeatured ?? false,
            sortOrder: p.sortOrder ?? 0,
            categoryId: category.id,
        };
        if (existing) {
            await prisma.product.update({
                where: { id: existing.id },
                data,
            });
        }
        else {
            await prisma.product.create({
                data,
            });
        }
    }
    await prisma.shop.upsert({
        where: { key: 'tashkent' },
        update: {},
        create: {
            key: 'tashkent',
            cityRu: 'Ташкент',
            cityUz: 'Toshkent',
            cityEn: 'Tashkent',
            addressRu: 'Чиланзар, 1-й квартал 59',
            addressUz: 'Chilonzor, 1-kvartal 59',
            addressEn: 'Chilanzar, Block 1, 59',
            phone: '+998901760104',
            cardNumber: '8600 0000 0000 0000',
            workHours: 'Mon-Sat: 10:00–19:00',
            sortOrder: 1,
        },
    });
    await prisma.shop.upsert({
        where: { key: 'samarkand' },
        update: {},
        create: {
            key: 'samarkand',
            cityRu: 'Самарканд',
            cityUz: 'Samarqand',
            cityEn: 'Samarkand',
            addressRu: 'ул. Ибн Сино, 24',
            addressUz: 'Ibn Sino ko‘chasi, 24',
            addressEn: 'Ibn Sino street, 24',
            phone: '+998901760104',
            cardNumber: '8600 0000 0000 0000',
            workHours: 'Mon-Sat: 10:00–19:00',
            sortOrder: 2,
        },
    });
    await prisma.shop.upsert({
        where: { key: 'bukhara' },
        update: {},
        create: {
            key: 'bukhara',
            cityRu: 'Бухара',
            cityUz: 'Buxoro',
            cityEn: 'Bukhara',
            addressRu: 'ул. Б.Накшбандиддин, 12',
            addressUz: 'B. Naqshbandi ko‘chasi, 12',
            addressEn: 'B. Naqshbandi street, 12',
            phone: '+998901760104',
            cardNumber: '8600 0000 0000 0000',
            workHours: 'Mon-Sat: 10:00–19:00',
            sortOrder: 3,
        },
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map