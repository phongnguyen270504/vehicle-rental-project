const Car= require('../models/Car');
const Rental= require('../models/Rental');
const {sequelize}= require('../models/db');
const { Op, where }= require('sequelize');
const {builtPagination } = require('../utils/pagination');


const getRentals= async (options={})=>{
    const where={};

    const page= Math.max(Number(options.page) || 1, 1);
    const limit= Math.min(Number(options.limit) || 10, 20);
    const offset= (page-1)*limit;

    if(options.userId){
        where.customer_id= options.userId;
    }
    if(options.status){
        where.status= options.status;
    }
    if(options.car_id){
        where.car_id= options.car_id;
    }
    const {rows, count}= await Rental.findAndCountAll(
        {
            where,
            include:[
                {
                    model:Car,
                    attributes:['name','price_per_day','status'],
                }]
            ,
            limit,
            offset,
            distinct: true,
            order: [['id', 'DESC']]
        }
    );
    
    const results= rows.map(r=>({
            id: r.id,
            customerId: r.customer_id,
            carId: r.car_id,
            startDate: r.start_date,
            endDate: r.end_date,
            totalPrice: r.total_price,
            status: r.status,
            car:{
                name: r.Car.name,
                pricePerDay: r.Car.price_per_day,
                status: r.Car.status,
            }
        }));
    const  totalPages= Math.ceil(count/limit);
    const pagination= builtPagination(page,totalPages);
    return {
        rentals: results,
        totalPages,
        currentPage: page,
        pagination,
    };
}

const getRentalById= async (rentalId)=>{

    const rental= await Rental.findByPk(rentalId,{
        include:[{
            model: Car,
            attributes:['name','price_per_day','status'],
        }]
    });

    if(!rental){
        const err= new Error('Đơn thuê không tồn tại');
        err.statusCode=404;
        throw err;
    }
    return {
        customerId: rental.customer_id,
        id: rental.id,
        startDate: rental.start_date,
        endDate: rental.end_date,
        totalPrice: rental.total_price,
        status: rental.status,
        car:{
            name: rental.Car.name,
            pricePerDay: rental.Car.price_per_day,
            status: rental.Car.status,
        }
    };
}

const confirmRental= async (rentalId,admin)=>{
    const transaction= await sequelize.transaction();
    try {
        if(admin.role !== 'admin'){
            const err= new Error('Bạn không có quyền xác nhận đơn thuê');
            err.statusCode=401;
            throw err;
        }

        const rental= await Rental.findByPk(rentalId,
        {include:[{
            model: Car
        }],
        transaction,
        lock: transaction.LOCK.UPDATE}
            );
        
        if(!rental){
            const err= new Error('Đơn thuê không tồn tại');
            err.statusCode=404;
            throw err;
        }

         if(rental.status !=='pending'){
                const err= new Error('Đơn thuê không ở trạng thái chờ duyệt');
                err.statusCode=400;
                throw err;
            }

        if( rental.Car.status ==='maintenance'){
            const err= new Error('Xe không khả dụng để thuê');
            err.statusCode=400;
            throw err;
        }

        
        const conflict= await Rental.findOne({
            where:{
                car_id: rental.car_id,
                status: 'active',
                [Op.and]: [
                    {
                        start_date: { [Op.lte]: rental.end_date }
                    },
                    {
                        end_date: { [Op.gte]: rental.start_date }
                    }
                ]},
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if(conflict){
            const err= new Error('Xe đã được thuê trong khoảng thời gian này');
            err.statusCode=400;
            throw err;
        }

        await rental.update(
            {status:'active', admin_id: admin.id},
            {transaction}
        );
        rental.Car.status='rented';
        await rental.Car.save({transaction});

        await transaction.commit();
        return {
            message:'Xác nhận đơn thuê thành công',
            rental_id: rental.id,
            adminId: rental.admin_id,
        };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

const rentalCancel= async (rentalId,user)=>{ 
    const rental= await Rental.findByPk(rentalId);

    if(!rental){
        const err= new Error('Đơn thuê không tồn tại');
        err.statusCode=404;
        throw err;
    }

    if(rental.customer_id !== user.id || user.role !== 'admin'){
        const err= new Error('Bạn chỉ có thể hủy đơn thuê của chính mình');
        err.statusCode=403;
        throw err;
    }

    if(rental.status !=='pending'){
        const err= new Error('Không thể hủy đơn thuê không ở trạng thái chờ duyệt');
        err.statusCode=400;
        throw err;
    }

    rental.status='cancelled';
    await rental.save();

    return {
        message:'Hủy đơn thuê thành công',
        rental_id: rental.id,
    };

}

const rentalComplete= async (rentalId,user)=>{ 
    if(user.role !== 'admin'){
        const err= new Error('Không có quyền hoàn tất đơn này');
        err.statusCode=403;
        throw err;
    }
    const rental= await Rental.findByPk(rentalId);
    if(!rental){
        const err= new Error('Đơn thuê không tồn tại');
        err.statusCode=404;
        throw err;
    }
    if(rental.status !=='active'){
        const err= new Error('Chỉ có thể hoàn tất đơn thuê ở trạng thái đang hoạt động');
        err.statusCode=400;
        throw err;
    }
    
    rental.status='completed';
    await rental.save();

    Car.update(
        {status:'available'},
        {where:{id:rental.car_id}}
    );

    return {
        message:'Hoàn tất đơn thuê thành công',
        rental_id: rental.id,
    };
}

const rentalCreate= async (userId,data)=>{
    const {car_id,start_date,end_date}= data;

    const car= await Car.findByPk(car_id);
    console.log("Dữ liệu xe:", car);
    if(!car)
    {
        const err= new Error('Xe không tồn tại');
        err.statusCode=404;
        throw err;
    }
    
    if(car.status ==='maintenance')
    {
        const err= new Error('Xe không khả dụng để thuê');
        err.statusCode=400;
        throw err;
    }
    const start= new Date(start_date);
    const end= new Date(end_date);
    const days= Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if(days <=0)
    {
        const err= new Error('Ngày thuê không hợp lệ');
        err.statusCode=400;
        throw err;
    }
   
    const total_price= days * Number(car.price_per_day);

   const rental= await Rental.create({
        customer_id: userId,
        car_id,
        start_date,
        end_date,
        total_price,
        status:'pending'
   })

    return rental;
}

module.exports={
    rentalCreate, 
    getRentals, 
    getRentalById, 
    confirmRental, 
    rentalCancel, 
    rentalComplete
};