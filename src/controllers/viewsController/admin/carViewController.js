const carService= require('../../../services/carService');
const rentalService= require('../../../services/rentalService');

const { validateUpdateCar, validateCreateCar } = require('../../../validations/validateCars');

const fs= require('fs/promises');
const indexPage= async (req,res)=>{
    try {
        const results = await carService.getAllCars({
            ...req.query,
            limit: Number(req.query.limit) || 2
        });
        res.render('admin/manage-cars.ejs', {
            title: 'Quản lý xe',
            cars: results.cars,
            limit: results.limit,
            query: req.query,
            totalItems: results.totalItems,
            totalPages: results.totalPages,
            currentPage: results.currentPage,
            query: req.query,
            pagination: results.pagination,
        });
     } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const getCarById= async (req,res) =>{
    try {
        const id= Number(req.params.id);
        if(isNaN(id)){
            const err= new Error('ID không hợp lệ');
            err.statusCode= 400;
            throw err;
        }
        const car = await carService.getCarById(id);
        res.render('cars/car-detail.ejs',{
            result: car
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
        message: err.message || 'Server error'
        });
    }
}

const bookingCarPage= async (req,res)=>{
    try {
        const id= Number(req.params.id);
        if(isNaN(id)){
            const err= new Error('ID không hợp lệ');
            err.statusCode= 400;
            throw err;
        }
        const car = await carService.getCarById(id);
        res.render('cars/booking-page.ejs',{
            result: car
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}

const bookingCar= async (req,res)=>{
    try {
        const car_id= Number(req.params.id);
        const userId= req.session.user ? req.session.user.id : null;
        if(!userId){
            res.redirect('/auth/login');
            return;
        }
        const { startDate, endDate } = req.body;
        const data= {car_id, start_date: startDate, end_date: endDate};
        await rentalService.rentalCreate(userId, data);
        req.flash('success', 'Đặt xe thành công');
        res.redirect('/cars');
    }
    catch (err) {
        console.error(err);        
       req.flash('danger', 'Có lỗi xảy ra khi đặt xe');
        res.redirect('/cars/' + req.params.id + '/booking');
    }
}

const createCarPage= async (req,res)=>{
    try {
        res.render('cars/create-car.ejs',{
            title: 'Thêm xe mới',
            errors: {},
            errorMessage: null,
            carData: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const createCar= async (req,res)=>{
    const errors = validateCreateCar(req.body);
    const hasError = Object.values(errors).some((error) => error);
    if (hasError) {
        return res.status(400).render('cars/create-car.ejs', {
            title: 'Thêm xe mới',
            errors: errors,
            carData: req.body,
            errorMessage: 'Dữ liệu không hợp lệ'
        });
    }
    try {
        console.log("Dữ liệu từ form:", req.body);
        if(req.file){
            req.body.image= "/uploads/cars/" + req.file.filename;
        }
        const car = await carService.createCar(req.body);
        res.redirect('/admin/cars');
    } catch (err) {
        
        if (req.file) {
            await fs.unlink(req.file.path).catch((unlinkErr) => {
                console.error('Lỗi khi xóa file tạm thời:', unlinkErr);
            });
        }
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra khi tạo xe');
        res.redirect('/admin/cars/create');
    }
}

const deleteCar= async (req,res)=>{
    try {
        const id= Number(req.params.id);
        await carService.deleteCar(id);
        req.flash('success', 'Xóa xe thành công');
        res.redirect('/admin/cars');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra khi tạo xe');
        res.redirect('/admin/cars');
    }
}

const updateCarPage= async (req,res)=>{
    try {
        const id= Number(req.params.id);
        const car = await carService.getCarById(id);
        console.log("Dữ liệu xe:", car);
        res.render('cars/update-car.ejs',{
            result: car,
            title: 'Cập nhật thông tin xe',
            errors: {},
            errorMessage: null
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const updateCar= async (req,res) =>{
     const errors = validateUpdateCar(req.body);
        if (Object.keys(errors).length > 0) {
           return res.status(400).render('cars/update-car.ejs', {
                result: {...req.body, id: req.params.id},
                title: 'Cập nhật thông tin xe',
                errors: errors,
                errorMessage:  'Dữ liệu không hợp lệ'
            });
        }
    try {
        const id= Number(req.params.id);
        const file= req.file;
       
        if(file){
            req.body.image= "/uploads/cars/" + file.filename;
        }
        await carService.updateCar(id, {...req.body,file: req.file});
        req.flash('success', 'Cập nhật xe thành công');
        return res.redirect('/admin/cars');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra khi cập nhật xe');
        res.redirect(`/admin/cars/${req.params.id}/update`);
    }
}

module.exports={
    indexPage, 
    getCarById, 
    bookingCarPage, 
    bookingCar,
    createCarPage, 
    createCar, 
    deleteCar, 
    updateCarPage, 
    updateCar
};