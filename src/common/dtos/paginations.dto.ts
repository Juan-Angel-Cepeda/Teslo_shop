import { IsOptional, IsPositive } from "class-validator";

export class PaginationDto{
    @IsOptional()
    @IsPositive()
    //Transformar el string
    limit?:number;


    offset?:number;
}