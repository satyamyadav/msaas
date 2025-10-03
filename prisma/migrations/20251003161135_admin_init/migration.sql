-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('MEMBER', 'ORG_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "platformRole" "PlatformRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "suspendedAt" TIMESTAMP(3);
