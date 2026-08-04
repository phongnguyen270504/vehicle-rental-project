const rentalService= require('../../../services/rentalService');

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
        });
   } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
   }
}

const rentalDetailPage= async (req, res) => {
    try {
        const rentalId= req.params.id;
        const rental= await rentalService.getRentalById(rentalId);
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
        res.redirect('/admin/manage-rentals');
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
        res.redirect('/admin/manage-rentals');
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
        res.redirect('/admin/manage-rentals');
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}


module.exports= {rentalDetailPage, confirmRental, cancelRental, completeRental};
