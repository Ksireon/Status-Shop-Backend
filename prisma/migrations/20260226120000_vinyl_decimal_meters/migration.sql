ALTER TABLE "CartItem" ALTER COLUMN "meters" TYPE DOUBLE PRECISION USING "meters"::double precision;
ALTER TABLE "OrderItem" ALTER COLUMN "meters" TYPE DOUBLE PRECISION USING "meters"::double precision;
ALTER TABLE "Product" ALTER COLUMN "stockQuantity" TYPE DOUBLE PRECISION USING "stockQuantity"::double precision;
