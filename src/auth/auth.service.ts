import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>

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
      const {email,fullName,...rest} = {...user};
      return {email,fullName};
      //TODO: Retornar el JWT de acceso

    }catch(error){
      this.handeDBErrors(error);
    }
  }

  private handeDBErrors(error: any): never {
    if(error.code === '23050'){
      throw new BadRequestException(error.detail)
    }
    console.log(error);
    throw new InternalServerErrorException('Pleas check server logs');
  }

}
