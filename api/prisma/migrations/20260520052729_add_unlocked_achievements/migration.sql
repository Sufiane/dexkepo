-- CreateTable
CREATE TABLE "UnlockedAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockedAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateIndex
CREATE INDEX "UnlockedAchievement_userId_idx" ON "UnlockedAchievement"("userId");

-- AddForeignKey
ALTER TABLE "UnlockedAchievement" ADD CONSTRAINT "UnlockedAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
