const userService = require('../../services/userService');

const updateUserPage = async (req, res)=>{
   try {
    let user= null;
    if(req.session.user)
    {
        const user_id= req.session.user.id
        user= await userService.getUserById(user_id);
        return res.render('users/update-user',
            {
              title: 'Cập nhật thông tin người dùng',
                editUser: user,
                errorMessage: null,
                errors: {}
            }
        );
    }
    return res.status(404).json({ message: 'Không tìm thấy trang' });
   } catch (err) {
    console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
   }
}

const updateUser = async (req, res) =>{
    try {

        const user_id= req.session.user.id;

        const data= req.body

        const user =await userService.updateUser(user_id, data);

       return res.render('users/update-user',
            {
              title: 'Cập nhật thông tin người dùng',
                editUser: user,
                errorMessage: 'Cập nhật người dùng thành công',
                errors: {}
            }
        );
    } catch (err) {
        return res.render('users/update-user',
            {
              title: 'Cập nhật thông tin người dùng',
                errorMessage: err.errorMessage,
                errors: err.errors || {},
                editUser: { ...req.body }
            }
        );
    }
   
}



module.exports = {
    updateUserPage,
    updateUser,
};