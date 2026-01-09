import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
    timestamps: true,
    versionKey: false
})
export class Category {
    @Prop({
        required: true,
        unique: true,
        trim: true,
        index: true,
    })
    name: string;

    @Prop({
        required: true,
        unique: true,
        trim: true,
        index: true,
    })
    slug: string;

    @Prop({
        trim: true,
    })
    description?: string;

    @Prop({
        default: true,
    })
    isActive : boolean

}

export const CategorySchema = SchemaFactory.createForClass(Category);