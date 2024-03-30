import { BeforeInsert, BeforeUpdate, Column, 
         Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn
        } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity({name:'products'})
export class Product {

    @ApiProperty({
        example:'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description:'UUID generado automaticamente al crear el producto',
        uniqueItems:true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({
        example:'T-Shirt Teslo',
        description:'Product Title',
        uniqueItems:true
    })
    @Column('text',{
        unique:true,
    })
    title:string;
    
    @ApiProperty({
        example:99.99,
        description:'Product price',
        default:0
    })
    @Column('float',{
        default:0
    })
    price:number;

    @ApiProperty({
        example:'Lorem Ipsum dev prod',
        description:'Product description',
        default:null
    })
    @Column({
        type:'text',
        nullable:true
    })
    description:string;

    @ApiProperty({
        example:'For SEO',
        description:'Product slug',
        default:null
    })
    @Column('text',{
        unique:true
    })
    slug:string;
    
    @ApiProperty({
        example:4,
        description:'Product Stock',
        default:0
    })
    @Column('int',{
        default:0
    })
    stock:number;

    @ApiProperty({
        example:'[S,L,XL]',
        description:'Product Size',
        default:[]
    })
    @Column('text',{
        array:true
    })
    sizes: string[]

    @ApiProperty()
    @Column('text')
    gender:string;

    @ApiProperty()
    @Column('text',{
        array:true,
        default:[]
    })
    tags: string[];

    //images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade:true,eager:true }
    )
    images?:ProductImage[];


    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager:true}
    )
    user:User

    @BeforeInsert()
    checkSlugInsert(){
        if (!this.slug){
            this.slug = this.title
        }
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')   
    }
    
    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
    }

}
