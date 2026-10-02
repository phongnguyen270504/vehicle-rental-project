const {Sequelize,DataTypes}= require('sequelize')
const {sequelize}= require('./db');
const Rental=require('./Rental');

const Payment= sequelize.define('Payment',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false,
    },
    rental_id:{
        type: DataTypes.INTEGER,
        allowNull:false,
    },
    amount:{
        type: DataTypes.DECIMAL(12,2),
        allowNull:false,
    },
    payment_method:{
        type: DataTypes.STRING(50),
        allowNull:true,

    },
    status:{
        type: DataTypes.ENUM('paid','pending','failed'),
        allowNull:true,
    },
    paid_at:{
        type: DataTypes.DATE,
        allowNull:true,
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

    tableName: 'payments',
    timestamps: false

})


Rental.hasOne(Payment, { foreignKey: 'rental_id' });
Payment.belongsTo(Rental, { foreignKey: 'rental_id' });

module.exports=Payment;