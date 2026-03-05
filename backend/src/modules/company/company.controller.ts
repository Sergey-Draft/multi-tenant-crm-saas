import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private service: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto)
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
