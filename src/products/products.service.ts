import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  
  
  
  private readonly logger = new Logger('ProductsService');
  
  constructor(
    
    //patron repositorio
    //El patron repositorio inyecta un repositorio de tipo Proudcto para
    //el manejo de las solicitudes a la base de datos
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  
  ) {}
  
  async create(createProductDto: CreateProductDto) {
    try {
      
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product);

      return product;

    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id:string) {
    const product = await this.productRepository.findOneBy({id})
    return product
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleDBExceptions( error:any){
    if (error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }
}
