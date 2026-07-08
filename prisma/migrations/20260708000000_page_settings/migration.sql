-- CreateTable
CREATE TABLE "PageSetting" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSetting_pkey" PRIMARY KEY ("key")
);
