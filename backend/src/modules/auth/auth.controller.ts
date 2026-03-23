import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Регистрация компании и первого пользователя' })
  @ApiResponse({ status: 201, description: 'Компания и пользователь созданы' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'accessToken + refreshToken' })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Обновить access-токен по refresh-токену' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Новый accessToken' })
  @ApiResponse({ status: 401, description: 'Refresh-токен недействителен' })
  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @ApiOperation({ summary: 'Текущий пользователь (из JWT)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Данные текущего пользователя' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user) {
    return this.authService.me(user);
  }
}
