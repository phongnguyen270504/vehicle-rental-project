const validateCreateRental= (data)=>{
    const errors={};
    
    if(!data.car_id)
    {
         errors.car_id = 'Vui lòng chọn xe';
    };
    if (!data.start_date) {
        errors.start_date = 'Ngày bắt đầu là bắt buộc';
    }
    if(!data.end_date){
        errors.end_date='Ngày kết thúc là bắt buộc'
    }
    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            errors.start_date = 'Thời gian thuê không hợp lệ';
        } else if (end <= start) {
            errors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
        }
    }
    if(!data.user_id)
    {
        if (!data.customer_name?.trim()) {
            errors.customer_name = 'Họ và tên là bắt buộc';
        }

        const phone = data.customer_phone?.trim();
        const email = data.customer_email?.trim();

        // Phải có ít nhất phone hoặc email
        if (!phone && !email) {
            errors.customer_phone =
                'Vui lòng nhập số điện thoại hoặc email';
        }

        // Có phone thì validate phone
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            errors.customer_phone =
                'Số điện thoại phải có 10 chữ số';
        }

        // Có email thì validate email
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.customer_email = 'Email không hợp lệ';
        }
    }
    return errors;
}

module.exports={
    validateCreateRental
}