-- CreateTable
CREATE TABLE "LeadAiAnalysis" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usedFallback" BOOLEAN NOT NULL DEFAULT false,
    "geminiModel" TEXT,
    "finishReason" TEXT,
    "requestedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadAiAnalysis_leadId_idx" ON "LeadAiAnalysis"("leadId");

-- CreateIndex
CREATE INDEX "LeadAiAnalysis_companyId_idx" ON "LeadAiAnalysis"("companyId");

-- AddForeignKey
ALTER TABLE "LeadAiAnalysis" ADD CONSTRAINT "LeadAiAnalysis_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAiAnalysis" ADD CONSTRAINT "LeadAiAnalysis_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
