const rentalService= require('../../../services/rentalService');
const carService= require('../../../services/carService');
const userService= require('../../../services/userService');

const {validateCreateRental}= require('../../../validations/validateRental')
const manageRentalsPage= async (req, res) => {
   try {
        const results = await rentalService.getRentals({...req.query,limit: Number(req.query.limit) || 2});
        res.render('admin/manage-rentals.ejs',{
            title: 'Quản lý đơn thuê',
            limit: results.limit,
            query: req.query,
            rentals: results.rentals,
            totalPages: results.totalPages,
            currentPage: results.currentPage,
            pagination: results.pagination,
            keyword: req.query.keyword || '',
        });
   } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
   }
}

const rentalCreatePage= async (req, res)=>{
    try {
        const carsResult=  await carService.getAllCars({...req.query, limit: 3});
        const users=  await userService.getAllCustomerForRental(req.query);
        
        return res.render('admin/create-rental',
            {
            carsResult,
            users,
            title: 'Tạo đơn hàng',
            query: req.query,
            data: {},
            errors:{},
        }
        )
    } catch (err) {
        console.log(err);
        res.status(err.statusCode || 500).json({message: err.message || 'Server error'});
    }
}

const rentalCreate = async (req, res)=>{
    try {

        const {
            car_id,
            user_id,
            customer_name,
            customer_phone,
            customer_email,
            start_date,
            end_date,
        }= req.body

        const userId= user_id ? Number(user_id): null

         const data = {
            car_id,
            user_id,
            customer_name,
            customer_phone,
            customer_email,
            start_date,
            end_date
        };

        const errors = validateCreateRental({...data,user_id: userId})
        if(Object.keys(errors).length>0){
            const carsResult=  await carService.getAllCars({
                ...req.query, 
                limit: 3, 
                page: Number(req.body.page) || 1
            });
            const users=  await userService.getAllCustomerForRental(req.query);
            return res.status(400).render(
                'admin/create-rental', {
                title: 'Tạo đơn hàng',
                users,
                carsResult,
                errors,
                data: {...data,user_id: userId},
                query: req.query
            }
            )
        }
        const rentalData= {
            car_id,
            customer_name,
            customer_phone,
            customer_email,
            start_date,
            end_date,
            status: 'pending'
        }
        const rental= await rentalService.rentalCreate(userId,rentalData);
        return res.redirect('/admin/rentals');
    } catch (err) {
        console.error(err);

        return res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}

const rentalDetailPage= async (req, res) => {
    try {
        const rentalId= Number(req.params.id);
        const user = req.session.user;
        const rental= await rentalService.getRentalById(rentalId,user);
        res.render('admin/rental-detail.ejs',{
            title: 'Chi tiết đơn thuê',
            rental
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const confirmRental = async (req, res) =>{
    try {
        const rentalId= req.params.id;
        const admin= req.session.user ? req.session.user : null;
        if(!admin){
            res.status(401).json({message: 'Unauthorized'});
            return;
        }
        await rentalService.confirmRental(rentalId, admin);
        res.redirect('/admin/rentals');
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const cancelRental= async (req,res)=>{
    try {
        const rentalId= req.params.id;
        const user= req.session.user ? req.session.user : null;
        if(!user){
            res.status(401).json({message: 'Cần đăng nhập để hủy đơn thuê'});
            return;
        }
        await rentalService.rentalCancel(rentalId, user);
        res.redirect('/admin/rentals');
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const completeRental= async (req,res)=>{
    try {
        const rentalId= req.params.id;
        const user= req.session.user ? req.session.user : null;
        if(!user){
            res.status(401).json({message: 'Cần đăng nhập để hoàn thành đơn thuê'});
            return;
        }
        await rentalService.rentalComplete(rentalId, user);
        res.redirect('/admin/rentals');
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}


module.exports= {
    rentalDetailPage, 
    confirmRental, 
    cancelRental, 
    completeRental,
    manageRentalsPage,
    rentalCreate,
    rentalCreatePage,
};
