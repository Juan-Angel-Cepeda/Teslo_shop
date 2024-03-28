import { BadRequestException, Controller, Post, 
         UploadedFile, UseInterceptors, Get, 
         Param, Res} from '@nestjs/common';

import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';

import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService

  ){}

  @Get('product/:imageName')
  findOneProductImage(
    @Res() res:Response,
    @Param('imageName') imageName:string
  ){
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file',{
    fileFilter:fileFilter,
    //limits:{ fileSize:1000 }
    //diskStorage, en donde se guradan los archivos
    storage: diskStorage({
      destination:'./static/uploads',
      filename:fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file:Express.Multer.File,
  ){
    
    //esto ya ese encuentra en la capreta temporal
    //se debe de grabar en un bucket o en un servicio de nube
    //O en casos de entornos cerrados en file system

    if(!file){
      throw new BadRequestException('Please upload an image, Accepted files: jpg, png, jpeg, gif');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return{secureUrl};

  }
}
