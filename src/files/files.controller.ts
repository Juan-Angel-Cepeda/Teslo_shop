import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors( FileInterceptor('file') )
  uploadProductImage(
    @UploadedFile() file:Express.Multer.File,
  ){
    //esto ya ese encuentra en la capreta temporal
    //se debe de grabar en un bucket o en un servicio de nube
    //O en casos de entornos cerrados en file system
    console.log(file)
    return{
      fileName:file.originalname
    };
  }
}
