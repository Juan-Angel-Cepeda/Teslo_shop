import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { isNumber, isUUID } from 'class-validator';

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
      
      //Validar que exista un slug y formatearlo 
      //segun se quiera en el string
      //se pueden hacer triggers de DB en el entity

      //if(!createProductDto.slug){
      //  createProductDto.slug = createProductDto.title
      //  .toLowerCase()
      //  .replaceAll(' ','_')
      //  .replaceAll("'",'')
      //} else{
      //  createProductDto.slug = createProductDto.slug
      //  .toLowerCase()
      //  .replaceAll(' ','_')
      //  .replaceAll("'",'')
      //}

      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product);

      return product;

    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return await this.productRepository.find({});
  }

  async findOne(term:string) {
    let product:Product;

    //Buscar por ID
    if (isUUID(term)){
      product = await this.productRepository.findOneBy({id:term});
    }

    //Buscar por slug
    if (!product) {
      term = term.toLowerCase()
      product = await this.productRepository.findOneBy({slug:term});
    }

    //buscar por precio
    if(isNumber(+term)){
      product = await this.productRepository.findOneBy({price:+term});
    }

    if (!product){
      throw new NotFoundException('Product not found in databse');
    }
    return product

  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
