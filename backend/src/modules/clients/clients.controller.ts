import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post('')
  create(@Body() dto: CreateClientDto, @CurrentUser() user) {
    console.log('user', user);
    return this.clientsService.create(dto, user.companyId);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.clientsService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.clientsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user,
  ) {
    return this.clientsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
   return this.clientsService.remove(id, user.companyId);
  }
}
