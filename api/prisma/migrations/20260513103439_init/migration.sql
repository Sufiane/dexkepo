-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manhole" (
    "manholeNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefName" TEXT NOT NULL,
    "prefEnName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "pictureUrl" TEXT NOT NULL,
    "pokemon" JSONB NOT NULL,

    CONSTRAINT "Manhole_pkey" PRIMARY KEY ("manholeNo")
);

-- CreateTable
CREATE TABLE "DexEntry" (
    "userId" TEXT NOT NULL,
    "manholeNo" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DexEntry_pkey" PRIMARY KEY ("userId","manholeNo")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pseudo_key" ON "User"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DexEntry_userId_idx" ON "DexEntry"("userId");

-- AddForeignKey
ALTER TABLE "DexEntry" ADD CONSTRAINT "DexEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DexEntry" ADD CONSTRAINT "DexEntry_manholeNo_fkey" FOREIGN KEY ("manholeNo") REFERENCES "Manhole"("manholeNo") ON DELETE RESTRICT ON UPDATE CASCADE;
