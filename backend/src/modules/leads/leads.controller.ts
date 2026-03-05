import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ChangeLeadStatusDto } from './dto/change-status.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser() user) {
    console.log(user)
    return this.leadsService.create(dto, user.companyId, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.leadsService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.leadsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user,
  ) {
    return this.leadsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  // @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.leadsService.remove(id, user.companyId);
  }

  @Patch('status/:id')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeLeadStatusDto,
    @CurrentUser() user,
  ) {
    return this.leadsService.changeStatus(id, user.companyId, dto);
  }
}
