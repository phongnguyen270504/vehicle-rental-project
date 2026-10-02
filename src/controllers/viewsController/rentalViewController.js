const rentalService= require('../../services/rentalService');

const getMyRentals= async (req,res)=>{
    try {
        let rentalsResult= null;
        if(req.session.user){       
         rentalsResult = await rentalService.getRentals({
            userId: req.session.user.id,
            status: req.query.status,
            page: req.query.page,
        });
    }
    else{
        if(req.query.keyword){
            rentalsResult = await rentalService.getRentals({
            status: req.query.status,
            page: req.query.page,
            keyword:req.query.keyword,
            guest: true,
        });
        }
    }
        return res.render('rentals/index',{
            title:'Đơn thuê của tôi',
            rentals: rentalsResult ? rentalsResult?.rentals : [],
            totalPages: rentalsResult ? rentalsResult.totalPages : 1,
            currentPage: rentalsResult ? rentalsResult.currentPage : 1,
             ...(rentalsResult && {
            pagination: rentalsResult.pagination
                }),
            query: req.query,
            keyword: req.query.keyword,
        })
    } catch (err) {
         console.error(err);
        res.status(err.statusCode || 500).send(err.message);
    }
}

const getRentalId = async (req, res)=>{
    const rentalId= Number(req.params.id);
    const user = req.session.user;
    
    const rental= await rentalService.getRentalById(rentalId, user);

    res.render('rentals/rental-detail',{
        title: 'Chi tiết đơn thuê',
        rental
    })
}

const rentalCancel= async (req, res)=>{
    try {
        const rentalId= Number(req.params.id);
        const user= req.session.user;
        const rental= await rentalService.rentalCancel(rentalId,user);

        return res.redirect(`/rentals/${rentalId}`);
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
    
}



module.exports= {
    getMyRentals,
    getRentalId,
    rentalCancel
};
