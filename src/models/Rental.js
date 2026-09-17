const {Sequelize,DataTypes}= require('sequelize')
const {sequelize}= require('./db');
const User=require('./User');
const Car =require('./Car');
const Rental= sequelize.define(
    'Rental',
    {
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement: true,
            primaryKey: true
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        admin_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        car_id:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        start_date:{
            type:DataTypes.DATE,
            allowNull:false,
        },
        end_date:{
            type: DataTypes.DATE,
            allowNull: false
        },
        total_price:{
            type:DataTypes.DECIMAL,
            allowNull:false,
        },
        status:{
            type: DataTypes.ENUM('pending','active','completed','cancelled'),
            allowNull:false,
            defaultValue:'pending',
        },
        customer_name:{
            type: DataTypes.STRING(80),
            allowNull:true,
        },
        customer_phone:{
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        customer_email:{
            type:DataTypes.STRING(100),
            allowNull:true,
        },
        created_at:{
            type:DataTypes.DATE,
            allowNull:true,
        },
        updated_at:{
            type:DataTypes.DATE,
            allowNull:true,
        }
    },
    {
        tableName:'rentals',
        timestamps: false,
    }
)

Rental.belongsTo(User,{foreignKey:'user_id'});
User.hasMany(Rental,{foreignKey:'user_id'})
Rental.belongsTo(Car,{foreignKey:'car_id'});
Car.hasMany(Rental,{foreignKey:'car_id'});
Rental.belongsTo(User,{foreignKey:'admin_id'});
User.hasMany(Rental,{foreignKey:'admin_id'});

module.exports=Rental;