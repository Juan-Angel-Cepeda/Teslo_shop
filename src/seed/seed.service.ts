import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
    ) 
    {}

  runSeed() {
    this.insertProducts();
    return `Seed Excecuted`;

  }

  private async insertProducts() {
    await this.productService.deleteAllProducts();
    
    const proudcts = initialData.products;
    
    const insertPromises = [];

    proudcts.forEach(product => {
      insertPromises.push(this.productService.create( product ));
    })    
    await Promise.all(insertPromises);
    return true;
  }
}
