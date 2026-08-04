const express = require('express');
const cors= require('cors')
const path = require('path');
const session = require('express-session');
const multer= require('multer');

const globalMiddleware= require('./middlewares/global.middleware');
const authSessionsMiddleware = require('./middlewares/auth.session.middleware');

const carRouter= require('./router/carRouter')
const rentalRouter= require('./router/rentalRouter');
const authRouter= require('./router/authRouter');
const userRouter= require('./router/userRoute');

const carViewRouter= require('./router/webRouters/carViewRouter');
const authViewRouter= require('./router/webRouters/authViewRouter');
const adminViewRouter= require('./router/webRouters/adminViewRouter');
const rentalViewRouter= require('./router/webRouters/rentalViewRouter');;
const carAdminViewRouter= require('./router/webRouters/admin/carViewRouter')
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'hello world',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(globalMiddleware.globalVariable);

app.use('/api/cars', carRouter)
app.use('/api/auth', authRouter);
app.use('/api/rentals', rentalRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
    res.redirect('/cars');
});
app.use('/cars', carViewRouter);
app.use('/auth', authViewRouter);
app.use('/admin', authSessionsMiddleware.isLogin, authSessionsMiddleware.isAdmin, adminViewRouter);
app.use('/admin/cars',authSessionsMiddleware.isLogin,authSessionsMiddleware.isAdmin,carAdminViewRouter);


app.use('/rentals', authSessionsMiddleware.isLogin, rentalViewRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

module.exports= app;