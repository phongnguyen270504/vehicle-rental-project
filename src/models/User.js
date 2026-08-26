const {Sequelize,DataTypes}= require('sequelize')
const {sequelize}= require('./db');
const User= sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false,
    },
    fullname:{
        type: DataTypes.STRING(80),
        allowNull:false,
        
    },
    phone:{
        type: DataTypes.STRING(20),
        allowNull:true,
    },
    email:{
        type: DataTypes.STRING(255),
        allowNull:false,
        unique: true,
        validate:{
            isEmail:true,
            notEmpty:true,
        }
    },
    hashpass:{
        type: DataTypes.STRING(255),
        allowNull: false,
        validate:{
            notEmpty:true,
            len: [6, 100],
        }
    },
    role:{
        type: DataTypes.ENUM('admin','customer'),
        allowNull:false,
        defaultValue: 'customer',
        validate: {
            isIn: [['admin', 'customer']]
        }
    },
    user_status:{
        type: DataTypes.ENUM('active','locked','inactive'),
        allowNull:false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'locked', 'inactive']]
        }
    },
    created_at:{
        type: DataTypes.DATE,
        allowNull:true,
    },
    updated_at:{
        type: DataTypes.DATE,
        allowNull:true,
    }
},{
    tableName:'users',
    timestamps: false,
})

module.exports=User;