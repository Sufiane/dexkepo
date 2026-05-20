-- CreateTable
CREATE TABLE "Pokemon" (
    "name" TEXT NOT NULL,
    "pokeApiId" INTEGER NOT NULL,
    "types" TEXT[],
    "isLegendary" BOOLEAN NOT NULL DEFAULT false,
    "isMythical" BOOLEAN NOT NULL DEFAULT false,
    "generation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_pokeApiId_key" ON "Pokemon"("pokeApiId");
