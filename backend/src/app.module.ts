import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [PrismaModule, CompanyModule],
})
export class AppModule {}