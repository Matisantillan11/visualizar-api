-- CreateTable
CREATE TABLE "public"."BookRequestStatusAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "bookRequestId" TEXT NOT NULL,
    "previousStatus" "public"."BookRequestStatus" NOT NULL,
    "currentStatus" "public"."BookRequestStatus" NOT NULL,

    CONSTRAINT "BookRequestStatusAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BookRequestStatusAudit" ADD CONSTRAINT "BookRequestStatusAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookRequestStatusAudit" ADD CONSTRAINT "BookRequestStatusAudit_bookRequestId_fkey" FOREIGN KEY ("bookRequestId") REFERENCES "public"."BookRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
