import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto'
import { GetUser, RawHeaders, RoleProtected, Auth } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(

    //Insertar decoradores personalizados
    @Req() request: Express.Request,
    @GetUser() user:User,
    @GetUser('email') userEmail:string,
    @RawHeaders() rawHeaders:string[]
  ){
    return {
      ok:true,
      user,
      userEmail,
      rawHeaders
    }
  }

  //@SetMetadata('roles',['admin','supervisor','coordinator'])  
  @Get('private2')
  @RoleProtected(ValidRoles.coordinator,ValidRoles.supervisor,ValidRoles.coordinator)
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user:User
  ){
    return {
      ok:true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.supervisor,ValidRoles.admin)
  privateRoute3(
    @GetUser() user:User
  ){
    return {
      ok:true,
      user
    }
  }
}
