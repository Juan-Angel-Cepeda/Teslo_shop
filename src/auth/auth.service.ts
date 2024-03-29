import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService,

  ){}

  async create(createUserDto: CreateUserDto) {
    try{

      const {password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password:bcrypt.hashSync(password,10)
      });
      
      await this.userRepository.save(user);
      delete user.password;
      
      return {
        ...user,
        token:this.getJwtToken({id:user.id})
      }

    }catch(error){
      this.handeDBErrors(error);
    }
  }

  async login(loginUserDto:LoginUserDto){
    //Data del usuairo tratando de ingresar
    const { password, email } = loginUserDto;
    const dbUser = await this.userRepository.findOne({
      where:{email},
      select:{email:true,password:true,id:true}
    });

    if(!dbUser){
      throw new UnauthorizedException("User not found");
    }
    
    if(!bcrypt.compareSync(password,dbUser.password)){
      throw new UnauthorizedException("Credentials not valid");
    }
    
    delete dbUser.password;
    return {
      ...dbUser,
      token:this.getJwtToken({id:dbUser.id})
    };
  }

  private getJwtToken(payload:JwtPayload){
    //Generacion de Token
    const token = this.jwtService.sign( payload );
    return token;
  }

  private handeDBErrors(error: any): never {
    if(error.code === '23050'){
      throw new BadRequestException(error.detail)
    }
    console.log(error);
    throw new InternalServerErrorException('Pleas check server logs');
  }
}
