
const rentalService= require('../services/rentalService');

const getAllRentals= async (req, res)=>{
    try {
        const rentals= await rentalService.getRentals(
            {status: req.query.status}
        );
        res.json(rentals);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const getAllRentalsByUser= async (req, res)=>{
    try {
        const rentals= await rentalService.getRentals({
            userId: req.user.id,
            status: req.query.status,
        });
        res.json(rentals);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const getRentalById= async (req, res)=>{
    try {
        const rentalId= req.params.id;
        const user= req.user;
        if(user.role != 'admin' && rental.customerId != user.id){
            return res.status(403).json({message: 'Bạn không có quyền truy cập đơn thuê này'});
        }
        const rental= await rentalService.getRentalById(rentalId);
        res.json(rental);
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json(
            { message: err.message || 'Server error' }
        );
    }
}
const createRental= async (req, res)=>{
    try {
        const userId= req.user.id;

        const rental= await rentalService.rentalCreate(userId, req.body);
        res.status(201).json({
            message : 'Tạo đơn thuê thành công',
            rental
        }
        );
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json(
            { message: err.message || 'Server error' }
        );
    }
}

const confirmRental= async (req, res)=>{
    try {
        const rentalId= req.params.id;
        const admin= req.user;
        const result= await rentalService.confirmRental(rentalId, admin);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json(
            { message: err.message || 'Server error' }
        );
    }
}

const rentalCancel= async (req, res)=>{
    try {
        const rentalId= req.params.id;
        const user= req.user;
        const result= await rentalService.rentalCancel(rentalId, user);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json(
            { message: err.message || 'Server error' }
        );
    }
}

const rentalComplete= async (req, res)=>{
    try {
        const rentalId= req.params.id;
        const user= req.user;

        const result= await rentalService.rentalComplete(rentalId, user);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json(
            { message: err.message || 'Server error' }
        );
    }
}

module.exports= {
    createRental, 
    getAllRentals, 
    getAllRentalsByUser,
    getRentalById,
    confirmRental,
    rentalCancel, 
    rentalComplete
};