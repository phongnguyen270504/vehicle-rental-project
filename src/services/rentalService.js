const Car= require('../models/Car');
const Rental= require('../models/Rental');
const {sequelize}= require('../models/db');
const { Op, where }= require('sequelize');
const {builtPagination } = require('../utils/pagination');
const User = require('../models/User');


const getRentals= async (options={})=>{
    const where={};

    const page= Math.max(Number(options.page) || 1, 1);
    const limit= Math.min(Number(options.limit) || 10, 20);
    const offset= (page-1)*limit;

    if(options.userId){
        where.user_id= options.userId;
    }

    if(options.guest){
        where.user_id ={
            [Op.is]:null,
        }
    }
    
    if(options.status){
        where.status= options.status;
    }
    if(options.car_id){
        where.car_id= options.car_id;
    }
    if(options.keyword?.trim())
    {
        const search= options.keyword?.trim()

        where[Op.or]=[
            {
                customer_name: {
                    [Op.like]:`%${search}%`
                }
            },
            {
                customer_phone: {
                    [Op.like]:`%${search}%`
                }
            },
            {
                customer_email: {
                    [Op.like]:`%${search}%`
                }
            },
        ]
    }

     if (options.start_date && options.end_date) {
        where.start_date = {
            [Op.lte]: new Date(options.end_date)
        };

        where.end_date = {
            [Op.gte]: new Date(options.start_date)
        };
    }

     const sortMap = {
        updated_desc: ['updated_at', 'DESC'],
        created_desc: ['created_at', 'DESC'],
        start_asc: ['start_date', 'ASC'],
        total_desc: ['total_price', 'DESC']
    };

   const sort = sortMap[options.sort] || sortMap.updated_desc;

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
            order: [sort]
        }
    );
    
    const results= rows.map(r=>({
            id: r.id,
            customerId: r.user_id,
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
    const  totalPages= Math.ceil(count/limit) || 1;
    const pagination= builtPagination(page,totalPages);
    return {
        rentals: results,
        totalPages,
        currentPage: page,
        pagination,
    };
}

const getRentalById= async (rentalId,user)=>{

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
   
    if (user && user.role !== 'admin') {
    if (user.id !== rental.user_id) {
            const err = new Error('Không tồn tại đơn thuê');
            err.statusCode = 404;
            throw err;
        }
    }

    if (!user && rental.user_id !== null) {
        const err = new Error('Không tồn tại đơn thuê');
        err.statusCode = 404;
        throw err;
    }
    
    

    return {
        customerId: rental.user_id,
        id: rental.id,
        startDate: rental.start_date,
        endDate: rental.end_date,
        totalPrice: rental.total_price,
        status: rental.status,
        customerName: rental.customer_name,
        customerPhone: rental.customer_phone,
        customerEmail: rental.customer_email,
        car:{
            name: rental.Car.name,
            pricePerDay: rental.Car.price_per_day,
            status: rental.Car.status,
            image: rental.Car.image
        }
    };
}

const confirmRental= async (rentalId,admin)=>{
    const transaction= await sequelize.transaction();
    try {
        if(!admin ||admin.role !== 'admin'){
            const err= new Error('Bạn không có quyền xác nhận đơn thuê');
            err.statusCode=403;
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
        const now = new Date();
        const startDate = new Date(rental.start_date);

        if (startDate > now) {
            const err = new Error('Chưa đến ngày bắt đầu thuê');
            err.statusCode = 400;
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
           rental.status = 'cancelled';

            await rental.save({ transaction });

            await transaction.commit();

            return {
                message: 'Xe đã được thuê trong khoảng thời gian này',
                rental_id: rental.id,
                status: 'cancelled'
            };
        }

        await rental.update(
            {status:'active'},
            {transaction}
        );

        await transaction.commit();
        return {
            message:'Xác nhận đơn thuê thành công',
            rental_id: rental.id,
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
    if (user && user.role !== 'admin') {
        if (rental.user_id !== user.id) {
            const err = new Error(
                'Bạn chỉ có thể hủy đơn thuê của chính mình'
            );
            err.statusCode = 403;
            throw err;
        }
    }

    // Guest
    if (!user && rental.user_id !== null) {
        const err = new Error(
            'Bạn chỉ có thể hủy đơn thuê của chính mình'
        );
        err.statusCode = 403;
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
    const transaction = await sequelize.transaction();

    try {
        if (user.role !== 'admin') {
            const err = new Error('Không có quyền hoàn tất đơn này');
            err.statusCode = 403;
            throw err;
        }

        const rental = await Rental.findByPk(rentalId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!rental) {
            const err = new Error('Đơn thuê không tồn tại');
            err.statusCode = 404;
            throw err;
        }

        if (rental.status !== 'active') {
            const err = new Error(
                'Chỉ có thể hoàn tất đơn thuê ở trạng thái đang hoạt động'
            );
            err.statusCode = 400;
            throw err;
        }

        rental.status = 'completed';

        await rental.save({ transaction });

        await Car.update(
            { status: 'available' },
            {
                where: { id: rental.car_id },
                transaction
            }
        );

        await transaction.commit();

        return {
            message: 'Hoàn tất đơn thuê thành công',
            rental_id: rental.id
        };

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

const rentalCreate= async (userId,data, user)=>{
    const {
        customer_name,
        customer_phone,
        customer_email,
        car_id,
        start_date,
        end_date,
        status='pending',
    }= data;


    if(userId)
    {
        const user= await User.findByPk(userId);
        if(!user){
             const err= new Error('Người dùng không tồn tại');
            err.statusCode=404;
            throw err;
        }
        data.customer_name= user.fullname;
        data.customer_phone = user.phone;
        data.customer_email = user.email;
    }
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
        const err = new Error('Ngày thuê không hợp lệ');
        err.statusCode=400;
        throw err;
    }
   
    const total_price= days * Number(car.price_per_day);

    const conflict = await Rental.findOne({
            where: {
                car_id,
                status: {
                    [Op.in]: ['pending', 'active']
                },
                start_date: {
                    [Op.lte]: end
                },
                end_date: {
                    [Op.gte]: start
                }
            },
        });
    if(conflict)
    {
        const err= new Error('Xe không khả dụng để thuê');
        err.statusCode=400;
        throw err;
    }
    const dataToCreate= {
        user_id: userId,
        car_id,
        customer_name: userId ? data.customer_name : customer_name,
        customer_phone: userId ? data.customer_phone : customer_phone,
        customer_email: userId ? data.customer_email : customer_email,
        start_date, 
        end_date,
        total_price,
        status,
    }
    if(user && user.role === 'admin') {
        dataToCreate.admin_id = user.id;
    }

    const rental = await Rental.create(dataToCreate);

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