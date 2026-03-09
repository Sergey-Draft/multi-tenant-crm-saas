import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}


  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user,
  ) {
    return this.usersService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.usersService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Patch(':id/role')
  changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() user,
  ) {
    return this.usersService.changeRole(id, dto, user);
  }

  // @Patch(':id/deactivate')
  // deactivate(@Param('id') id: string, @CurrentUser() user) {
  //   return this.usersService.deactivate(id, user);
  // }
}