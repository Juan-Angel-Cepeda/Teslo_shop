import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ValidRoles } from 'src/auth/interfaces';
import { Auth } from 'src/auth/decorators';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Seed')
@Auth(ValidRoles.admin)
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth( ValidRoles.admin)
  findAll() {
    return this.seedService.runSeed();
  }
}
