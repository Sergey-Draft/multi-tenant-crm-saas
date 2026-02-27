import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        plan: dto.plan,
      },
    });
  }

  findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  findAll() {
    return this.prisma.company.findMany();
  }
}