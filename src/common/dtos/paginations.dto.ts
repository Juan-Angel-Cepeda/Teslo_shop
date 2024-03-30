import { IsOptional, IsPositive, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto{
    
    @ApiProperty({
        default:10,
        description:'How many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    //Transformar el string
    @Type( () => Number)
    limit?:number;

    @ApiProperty({
        default:0,
        description:'How many rows do yo want to skip'
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number)
    offset?:number;
}