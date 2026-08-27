
const adminService= require('../../../services/adminService');
const dashboardPage = async (req, res) => {
    try {
        const dashboardData = await adminService.getDashboardData();
        res.render('admin/dashboard.ejs', {
            title: 'Admin Dashboard',
            dashboardData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}



module.exports = {
    dashboardPage,
};