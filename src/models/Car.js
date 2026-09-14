const {Sequelize,DataTypes}= require('sequelize')
const {sequelize}= require('./db');
// const Brand = require('./Brand');
// const CarType= require('./CarType');
const Car= sequelize.define(
    'Car',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true,
            allowNull:false
        },
        name: {
            type: DataTypes.STRING,
            allowNull:false,
            validate:{
                notEmpty:true
            }
        },
        brand:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        type:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        price_per_day:{
            type: DataTypes.DECIMAL(10,2),
            allowNull:false,
        },
        status:{
            type: DataTypes.ENUM('available','rented','maintenance'),
            defaultValue: 'available'
        },
        image:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_at:{
            type: DataTypes.DATE,
        },
        updated_at:{
            type: DataTypes.DATE,
        }
    },{
        tableName:'cars',
        timestamps: false,
    }
);


module.exports=Car;