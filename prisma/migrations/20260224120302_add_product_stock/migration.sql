-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockQuantity" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_stockQuantity_idx" ON "Product"("stockQuantity");
