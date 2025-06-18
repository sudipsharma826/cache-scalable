import mongoose ,{Document } from 'mongoose';

//definig the interface form the product model
export interface IProduct extends Document {
  id: string;
  name: string;
  avatar: string;
  material: string;
  company: string;
  description: string;
  price: number;
  createdAt: Date;
}

//defining the product schema
const productSchema = new mongoose.Schema<IProduct>({
   id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  material: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

//creating the product model
const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;
