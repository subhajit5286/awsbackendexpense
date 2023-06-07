const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');
//const AWS = require('aws-sdk');
const S3services = require('../services/S3services');
const FileDownloaded = require('../models/filesdownloaded');



exports.downloadexpense = async (req,res) =>{
    try{
         const expenses = await req.user.getExpenses();
  console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);
  const userId = req.user.id;
  const filename = `Expense${userId}/${new Date()}.txt`;
  const fileURl = await S3services.uploadToS3(stringifiedExpenses,filename);
   await FileDownloaded.create({userId: req.user.id, urls: fileURl});
  res.status(200).json({fileURl,success:true})
    } catch(err){
        console.log(err);
        res.status(500).json({fileURl:'',success:false,err:err})
    }
 
}

exports.listOfFilesDownloaded = async (req, res) => {
  try{
      if(req.user.ispremiumuser) {
          const filesDownloaded = await FileDownloaded.findAll({where: {userId: req.user.id}})//{where: {userId: req.user.id}});
          const urls = filesDownloaded.map(download => download.urls);
          console.log("all downloads====>>>",urls);

          res.status(200).json(urls);
      }
  }catch (err) {
      console.log(err);
  }
}




exports.addExpense = async (req, res, next)=> {
    const t = await sequelize.transaction();
   try{   

   const amount = req.body.amount;
   const description = req.body.description;
   const category = req.body.category;

   // const data = await Expense.create( {amount: amount, description: description, category: category,userId: req.user.id} )
   // res.status(201).json({newExpense: data});
   // } catch(err){
   //    res.status(500).json({
   //       error: err
   //    })

   // } 
   if(amount == undefined || amount.length === 0) {
      return res.status(400).json({success: false, message: 'Parameters missing'})
  }
   const expense = await Expense.create({ amount, description, category, userId: req.user.id},{transaction: t})
   //.then(expense => {
      console.log("amount",amount);
      console.log("req.user.totalExp",req.user.totalExpenses);
      const totalExpense = Number(req.user.totalExpenses) + Number(amount)
      console.log("totalExpense",totalExpense);
     await User.update({
          totalExpenses: totalExpense
      },{
          where: {id: req.user.id} , transaction: t
      })
    //   .then(async() => {
    //       res.status(200).json({newExpense: expense})
    //   })
    //   .catch(async(err) => {
    //       return res.status(500).json({success: false, error: err})
    //   })
    // }).catch(async(err) => {
    //    return res.status(500).json({success: false, error: err})
    // })
        await t.commit();
        res.status(200).json({newExpense: expense})
    } catch(err) {
        await t.rollback();
        console.log(`posting data is not working`);
        res.status(500).json(err);
    }

}

exports.getExpense = async (req, res, next) => {
    // try{
    //  const expenses = await Expense.findAll({where:{userId:req.user.id}});
    //  //console.log(expenses);
    //  return res.status(200).json({allExpenses: expenses,name:req.user.name,isPremium:req.user.ispremiumuser,success:true})
    // } catch(error){
    //  console.log('Get expense is failing', JSON.stringify(error));
    //  return res.status(500).json({error: err,success:false})
    // }
     const t = await sequelize.transaction();
  try {
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
      const expenses = await Expense.findAll({ where: {userId: req.user.id} },{transaction:t})
      const user = await User.findOne({ where: {id: req.user.id} },{transaction:t});
      const lastPage = Math.ceil(expenses.length/limit)
      console.log(lastPage)
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const nextPage = endIndex < expenses.length ? page + 1 : null;
      const prevPage = startIndex > 0 ? page - 1 : null;
      await t.commit();
      res.status(200).json({
          allExpensesDetails: expenses,
          currentPage: page,
          nextPage: nextPage,
          prevPage: prevPage,
          limit,
          lastPage:lastPage,
          allExpensesDetails: expenses.slice(startIndex, endIndex),
          balance: user.balance
      });
  } catch(error) {
      await t.rollback();
      console.log('Get expenses is failing', JSON.stringify(error))
      res.status(500).json({error: error})
  }
}

exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    const eId = req.params.id;
    console.log(req.params.id);
    try{
    if(req.params.id == 'undefined'){
       console.log('ID is missing');
      return res.status(400).json({err: 'ID is missing'})
    }
    // await Expense.destroy({where: {id: eId}});
    // res.sendStatus(200);
    // } catch(err){
    //    console.log(err);
    //    res.status(500).json(err)
    // }
    const expense = await Expense.findOne({where: {
        id: eId,
        userId: req.user.id 
       }
      },{transaction:t});
      const totalExpenses = await Expense.sum('amount', {
        where: {userId: req.user.id}
    })
    const updatedTotalExpenses = totalExpenses - expense.amount
    const noOfRows = await Expense.destroy({where: {id: eId, userId: req.user.id}});
    await User.update({
      totalExpenses: updatedTotalExpenses
    },{
      where: {id: req.user.id},
    })
    if(noOfRows === 0) {
      return res.status(404).json({message: `Expense doesn't belongs to user`})
    }
    await t.commit();
    res.sendStatus(200);
      } catch(err){
        await t.rollback();
        console.log(err);
        res.status(500).json(err)
      }
}