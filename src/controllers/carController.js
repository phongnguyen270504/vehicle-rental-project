const carService= require('../services/carService');

const getAllCars= async(req,res)=>{
    try{
        const cars= await carService.getAllCars(req.query);
        res.json(cars);
    }catch(err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const getCarById= async (req,res) =>{
    try {
        const id= Number(req.params.id);
        if(!Number.isInteger(id) || id<=0)
        {
             return res.status(400).json({
                message: 'ID không hợp lệ'
            });
        }
        const car= await carService.getCarById(id);
        res.json(car);
    } catch (err) {
        console.error("Lỗi:"+ err);
        res.status(err.statusCode || 500).json({message:err.message || "server error"})
    }
}

const createCar= async (req,res)=>{
    try {
    const car = await carService.createCar(req.body);
    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Server error'
    });
  }
}

const updateCar= async (req,res)=>{
    try{
        const {id}= req.params;
        if(!Number.isInteger(Number(id)) || Number(id)<=0)
        {
             return res.status(400).json({message: 'ID không hợp lệ'});
        }

        const data= req.body;

        const car= await carService.updateCar(id, data);

        res.json({
            message: 'Cập nhật xe thành công',
            data: car
        });
    }catch(err)
    {
        console.error(err);
        res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}

const deleteCar = async(req,res)=>{
    try {
        const {id}= req.params;

        if(!Number.isInteger(Number(id)) || Number(id)<=0)
        {
             return res.status(400).json({message: 'ID không hợp lệ'});
        }

        await carService.deleteCar(id);
        res.json({
            message: 'Xóa xe thành công'
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
        message: err.message || 'Server error'
        });
    }
}


module.exports={
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
};