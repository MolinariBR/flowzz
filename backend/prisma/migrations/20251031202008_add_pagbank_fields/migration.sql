/*
  Warnings:

  - A unique constraint covering the columns `[pagbank_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pagbank_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "last_payment_date" TIMESTAMP(3),
ADD COLUMN     "next_payment_date" TIMESTAMP(3),
ADD COLUMN     "pagbank_status" TEXT,
ADD COLUMN     "pagbank_subscription_id" TEXT,
ADD COLUMN     "payment_method" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "documento" TEXT,
ADD COLUMN     "endereco" JSONB,
ADD COLUMN     "pagbank_customer_id" TEXT,
ADD COLUMN     "telefone" TEXT;

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pagbank_token" TEXT,
    "last_four_digits" TEXT,
    "brand" TEXT,
    "expiry_month" INTEGER,
    "expiry_year" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_pagbank_token_key" ON "payment_methods"("pagbank_token");

-- CreateIndex
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods"("user_id");

-- CreateIndex
CREATE INDEX "payment_methods_pagbank_token_idx" ON "payment_methods"("pagbank_token");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_pagbank_subscription_id_key" ON "subscriptions"("pagbank_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_pagbank_subscription_id_idx" ON "subscriptions"("pagbank_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_pagbank_customer_id_key" ON "users"("pagbank_customer_id");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
