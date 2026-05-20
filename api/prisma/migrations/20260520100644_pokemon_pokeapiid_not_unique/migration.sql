-- DropIndex
DROP INDEX "Pokemon_pokeApiId_key";

-- CreateIndex
CREATE INDEX "Pokemon_pokeApiId_idx" ON "Pokemon"("pokeApiId");
