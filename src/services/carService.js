const Car = require("../models/Car");
const fs = require('fs/promises');
const path = require('path');
// const Brand= require("../models/Brand");
// const CarType= require("../models/CarType");
const {builtPagination}= require('../utils/pagination')
const {Op, NUMBER}= require("sequelize");

const getAllCars= async (query={})=>{
        const whereCar={};
        // const whereBrand={};
        // const whereType={};

        const page= Math.max(Number(query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(query.limit) || 10, 1),
            20
        );
        const offset= (page-1)*limit;
        const order= query.order === 'asc' ? 'ASC' : 'DESC';

        if(query.name?.trim())
        {
             const keyword = query.name.trim();
            whereCar.name={ [Op.like]: `%${keyword}%`};
        }

        // if(query.brand?.trim()){

        //     whereBrand.name=query.brand.trim();
        // }

        // if(query.type?.trim())
        // {
        //     whereType.name=query.type.trim();
        // }

        if (query.status) 
        {
            whereCar.status = query.status;
        }
        
        if(query.minPrice && isNaN(Number(query.minPrice)) || query.maxPrice && isNaN(Number(query.maxPrice)))
        {
            const err= new Error('Giá thuê không hợp lệ');
            err.statusCode= 400;
            throw err;
        }

        if (query.minPrice || query.maxPrice) {
            whereCar.price_per_day = {};

            if (query.minPrice) {
                whereCar.price_per_day[Op.gte] = Number(query.minPrice);
            }

            if (query.maxPrice) {
                whereCar.price_per_day[Op.lte] = Number(query.maxPrice);
            }
        }

        const {count, rows}= await Car.findAndCountAll(
            { 
                where: whereCar,
                attributes:[ 'id', 'name', 'price_per_day', 'status', 'brand', 'type','image'],
                limit: limit,
                offset: offset,
                distinct: true,
                order: [['id', order]]
            }
        );

        const result= rows.map(c=>({
            id: c.id,
            name: c.name,
            pricePerDay: c.price_per_day,
            status: c.status,
            brand: c.brand ?? null,
            type: c.type ?? null,
            image: c.image ?? null
        }))

        const totalPages= Math.ceil(count/limit);
        const pagination=builtPagination(page,totalPages)
        return {
            totalItems: count,
            totalPages,
            currentPage: page,
            pagination,
            limit,
            cars: result
        };
}


const getCarById= async (id)=>{
        const car = await Car.findByPk(id,{
            attributes:['id', 'name', 'price_per_day', 'status', 'brand', 'type','image'],
        });
        if(!car){
            const err= new Error("Không tìm thấy xe");
            err.statusCode=404;
            throw err;
        }
        const result={
            id: car.id,
            name: car.name,
            pricePerDay: car.price_per_day,
            status: car.status,
            brand: car.brand ?? null,
            type: car.type ?? null,
            image: car.image ?? null
        }
        return result;
}

const createCar = async (data)=>{

    // if(!name || !brand || !type || !price_per_day)
    // {
    //     const err = new Error('Thiếu dữ liệu bắt buộc');
    //     err.statusCode = 400;
    //     throw err;
    // }

    // const brandId= Number(brand_id);
    // if (isNaN(brandId) || brandId <= 0) {
    //     const err = new Error('Brand ID không hợp lệ');
    //     err.statusCode = 400;
    //     throw err;
    // }

    // const brand = await Brand.findByPk(brandId);
    // if (!brand) {
    //     const err = new Error('Brand không tồn tại');
    //     err.statusCode = 400;
    //     throw err;
    // }

    // const typeId= Number(type_id);
    // if (isNaN(typeId) || typeId <= 0) {
    //     const err = new Error('Car type ID không hợp lệ');
    //     err.statusCode = 400;
    //     throw err;
    // }
    
    // const type = await CarType.findByPk(typeId);
    // if (!type) {
    //     const err = new Error('Car type không tồn tại');
    //     err.statusCode = 400;
    //     throw err;
    // }

    const price = Number(data.price_per_day);

    if (isNaN(price) || price <= 0) {
        const err = new Error('Giá thuê không hợp lệ');
        err.statusCode = 400;
        throw err;
    }

    const car= await Car.create({
        name: data.name,
        brand: data.brand,
        type: data.type,
        price_per_day: data.price_per_day,
        status: "available",
        image: data.image || null
    })

    return ({
        id: car.id,
        name: car.name,
        pricePerDay: Number(car.price_per_day),
        status: car.status,
        brand: car.brand,
        type: car.type
    })
 
   
}

const updateCar= async (id,data)=>{
    try{
        const car= await Car.findByPk(id);
    if(!car){
        const err = new Error('Không tìm thấy xe');
        err.statusCode = 404;
        throw err;
    }
    const oldImage= car.image;
    const updateData={};
    if(data.name !== undefined)
    {
        if(typeof data.name !== 'string' || !data.name.trim())
        {
            const err = new Error('Tên xe không được để trống');
            err.statusCode = 400;
            throw err;
        }
        updateData.name= data.name.trim();
    }
    if(data.price_per_day !== undefined)    {
        if(isNaN(Number(data.price_per_day)) || Number(data.price_per_day) <=0)
        {
            const err = new Error('Giá thuê không hợp lệ');
            err.statusCode = 400;
            throw err;
        }
        updateData.price_per_day= Number(data.price_per_day);
    }
    if(data.status !== undefined)    {
        if(typeof data.status !== 'string' || !['available', 'rented', 'maintenance'].includes(data.status))
        {
            const err = new Error('Trạng thái xe không hợp lệ');
            err.statusCode = 400;
            throw err;
        }
        updateData.status= data.status;
    }
    if(data.brand !== undefined)    {
        if(typeof data.brand !== 'string' || !data.brand.trim())
        {
            const err = new Error('Tên hãng xe không được để trống');
            err.statusCode = 400;
            throw err;
        }
        updateData.brand= data.brand.trim();
    }
    if(data.type !== undefined)    {
        if(typeof data.type !== 'string' || !data.type.trim())
        {
            const err = new Error('Tên loại xe không được để trống');
            err.statusCode = 400;
            throw err;
        }
        updateData.type= data.type.trim();
    }
    if(data.file)    {
        updateData.image=  "/uploads/cars/" + data.file.filename;
    }
    // if('brand_id' in data){
    //     const brandId= Number(data.brand_id);
    //     if (isNaN(brandId) || brandId <= 0) {
    //         const err = new Error('Brand ID không hợp lệ');
    //         err.statusCode = 400;
    //         throw err;
    //     }
    //     const brand = await Brand.findByPk(brandId);
    //     if (!brand) {
    //         const err = new Error('Brand không tồn tại');
    //         err.statusCode = 400;
    //         throw err;
    //     }
    // }
    // if('type_id' in data){
    //     const typeId= Number(data.type_id);
    //     if (isNaN(typeId) || typeId <= 0) {
    //         const err = new Error('Car type ID không hợp lệ');
    //         err.statusCode = 400;
    //         throw err;
    //     }
    //     const type = await CarType.findByPk(typeId);
    //     if (!type) {
    //         const err = new Error('Car type không tồn tại');
    //         err.statusCode = 400;
    //         throw err;
    //     }
    // }
   
    await car.update(updateData);
   
    if (data.file && oldImage) {
        const oldImagePath = path.join(__dirname, "..", "public", oldImage);
        await fs.promises.unlink(oldImagePath).catch(() => {});
    }

    
    return ({
            id: car.id,
            name: car.name,
            pricePerDay: car.price_per_day,
            status: car.status,
            brand: car.brand,
            type: car.type,
            image: car.image
        });
    }
        catch (err) {
        if (data.file) {
            await fs.promises.unlink(data.file.path).catch(() => {});
        }
        throw err;
    }
}

const deleteCar=async (id)=>{
    const car= await Car.findByPk(id);

    if (!car) {
        const err = new Error('Không tìm thấy xe');
        err.statusCode = 404;
        throw err;
    }
    const oldImage = car.image;
    if(oldImage){
        const oldImagePath = path.join(__dirname, "..", "public", oldImage);
        await fs.unlink(oldImagePath).catch(() => {});
    }

    await car.destroy();
}

module.exports={getAllCars,getCarById,createCar,updateCar,deleteCar};