import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { isNumber, isUUID } from 'class-validator';
import { PaginationDto } from '../common/dtos/paginations.dto';

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

  async findAll(paginationDto:PaginationDto) {
    const { limit = 10, offset = 0 } =  paginationDto;
    return await this.productRepository.find({
      take:limit,
      skip:offset,
      //TO-DO: relaciones
    });
  }

  async findOne(term:string) {
    
    let product:Product;
    //Buscar por ID
    if (isUUID(term)){
      product = await this.productRepository.findOneBy({id:term});
    }

    //Buscar por Slug o por Title
    else{
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug',{
        title:term.toUpperCase(),
        slug:term.toLowerCase()
      }).getOne();
    }
    
    //Exepcion de no encontrado
    if (!product){
      throw new NotFoundException('Product not found in databse');
    }
    return product

  }

  async update(id:string, updateProductDto: UpdateProductDto) {
    
    const product = await this.productRepository.preload({
      id:id,
      ...updateProductDto
    });

    if (!product ) throw new NotFoundException(`Product with id ${id} not found`);
    
    await this.productRepository.save(product);
    return product;

  }

  async remove(id: string) {
    const product =  await this.productRepository.findOneBy({id:id});
    await this.productRepository.remove(product);
    return `Product deleted succesfuly`
  }

  private handleDBExceptions( error:any){
    if (error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }
}
