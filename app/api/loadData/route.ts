import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/ProductModels";
import { NextResponse } from "next/server";

export async function GET(){
  //Check data exists in db
  await connectDB();
  const dataExists = await ProductModel.exists({});
  if(dataExists) {
    return new NextResponse("Data already exists in the database", { status: 200 });
  }
  //Get fata form the api
  const request = await fetch("https://670f530a3e7151861657512d.mockapi.io/producrs");
  const data = await request.json();
  // console.log("Data fetched from API:", data);
  //insert the data intot the db
  await ProductModel.insertMany(data);
  return new NextResponse("Data loaded successfully", { status: 200 });
}