import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from '../common/dtos/paginations.dto';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  
  private readonly logger = new Logger('ProductsService');
  
  constructor(
    
    //patron repositorio
    //El patron repositorio inyecta un repositorio de tipo Proudcto para
    //el manejo de las solicitudes a la base de datos
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource:DataSource,
  
  ){}
  
  async create(createProductDto: CreateProductDto, user:User) {
    try {
      const { images = [], ...productDetails} = createProductDto;
      
      const product = this.productRepository.create({
        ...productDetails,
        images:images.map( image => this.productImageRepository.create({url:image})),
        user,
      })
      await this.productRepository.save(product);

      return {...product, images};

    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    const { limit = 20, offset = 0 } =  paginationDto;
    const products = await this.productRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true,
      }
    });

    return products.map( product => ({
      ...product,
      images: product.images.map( img => img.url)
    }));
  }

  async findOne(term:string) {
    
    let product:Product;
    //Buscar por ID
    if (isUUID(term)){
      product = await this.productRepository.findOneBy({ id:term });
    }

    //Buscar por Slug o por Title
    else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug',{
        title:term.toUpperCase(),
        slug:term.toLowerCase()
      })
      .leftJoinAndSelect('prod.images','prodImages')
      .getOne();
    }
    
    //Exepcion de no encontrado
    if (!product){
      throw new NotFoundException('Product not found in databse');
    }
    
    return this.plainProduct(product);

  }

  async plainProduct(product:Product){
    const {images = [], ...rest} = product;
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id:string, updateProductDto: UpdateProductDto,user:User) {
     
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({id, ...toUpdate});

    if (!product ) throw new NotFoundException(`Product with id ${id} not found`);
    
    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    //Conectarse a la base de datos
    await queryRunner.connect();
    //Iniciar transacción
    await queryRunner.startTransaction();
    try{
      if(images){
        await queryRunner.manager.delete( ProductImage,{product:{id}})
        product.images = images.map( 
        image => this.productImageRepository.create({url:image}))
      }else{
        product.images = await this.productImageRepository.findBy({product:{id}})
      }

      product.user = user;

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.plainProduct(product);
      //await this.productRepository.save(product);

    }catch(error){

      await queryRunner.rollbackTransaction();
      await queryRunner.release()
      this.handleDBExceptions(error);
    
    }
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

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try{
      return await query
      .delete()
      .where({})
      .execute()
    }catch(error){
      this.handleDBExceptions(error);
    }
  }
}
