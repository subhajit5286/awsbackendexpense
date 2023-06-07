const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');   
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');

//const errorController = require('./controllers/error');

const sequelize = require('./util/database');


var cors = require('cors');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a'});

app.use(cors());
app.use(helmet()); 
app.use(compression()); 
app.use(compression()); 
app.use(morgan('combined', { stream: accessLogStream }));

const Expense = require('./models/expense');
const User = require('./models/user');
const Order = require('./models/orders');
const forgotpassword = require('./models/forgotpassword');
const FileDownloaded = require('./models/filesdownloaded');

const userRoutes = require('./routes/user');    
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const leaderboardRoutes = require('./routes/leaderboard');
const forgotPasswordRoutes = require('./routes/forgotPassword');


app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));  

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',leaderboardRoutes);
app.use('/password',forgotPasswordRoutes);


//app.use(errorController.get404);;
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(forgotpassword);
forgotpassword.belongsTo(User);

User.hasMany(FileDownloaded);
FileDownloaded.belongsTo(User);

sequelize 
  .sync({force:false}) 
  .then(result => {
    //console.log(result);
    app.listen(4000);
})
.catch(err => {
    console.log(err);
});
