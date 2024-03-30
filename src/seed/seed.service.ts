import { Injectable, Query } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
    ){}

  async runSeed() {
    await this.deleteAllTables();
    const secondUser = await this.insertUsers();
    await this.insertProducts(secondUser);

    return `Seed Excecuted`;

  }

  private async deleteAllTables(){
    
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
    .delete()
    .where({})
    .execute()

  }

  private async insertUsers(){
    const seedUsers = initialData.users;
    const users:User[] = [];

    seedUsers.forEach(user => {
      const {password, ...userData} = user;
      users.push(this.userRepository.create({
        ...userData,
        password:bcrypt.hashSync(password,10)
      }));
    });

    await this.userRepository.save(users);
    return users[1];
  }


  private async insertProducts( user:User) {
    await this.productService.deleteAllProducts();
    
    const proudcts = initialData.products;
    const insertPromises = [];

    proudcts.forEach(product => {
      insertPromises.push(this.productService.create( product, user ));
    })    
    
    await Promise.all(insertPromises);
    return true;
  }
}
