const carService= require('../../services/carService');
const rentalService= require('../../services/rentalService');
const indexPage= async (req,res)=>{
    try {
        const query ={
            ...req.query,
            limit: Number(req.query.limit) || 2,
        }
        const results = await carService.getAllCars(query);
        res.render('cars/index.ejs',{
            title: 'Danh sách xe',
            cars: results.cars,
            limit: results.limit,
            query: req.query,
            totalPages: results.totalPages,
            currentPage: results.currentPage,
            totalItems: results.totalItems,
            currentName: req.query.name || '',
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
        res.redirect('/cars');
    }
    catch (err) {
        console.error(err);        res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}



module.exports={
    indexPage, 
    getCarById, 
    bookingCarPage, 
    bookingCar,
};