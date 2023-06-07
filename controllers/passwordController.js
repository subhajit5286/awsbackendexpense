const User = require('../models/user')
const Sib = require('sib-api-v3-sdk')
const Forgotpassword = require('../models/forgotpassword');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config()

const forgotPassword = async (req,res) =>{
    const  {email}  = req.body;
        try {
            const user = await User.findOne({ where: { email} });
            console.log(process.env.API_KEY)
        if (user) {
            const id = uuid.v4();
            user.createForgotpassword({ id , isActive: true })
            const client = Sib.ApiClient.instance ;
            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.API_KEY;
            const tranEmailApi = new Sib.TransactionalEmailsApi();
            const sender = {
                email: 'subhajit.bhattacharyya@gmail.com'
            }
            const receivers = [
                {
                email
            },
        ]
        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to:receivers,
            subject:'Reset your ExpenseTracker Password',
            textContent:'You are receiving this email because you (or someone else) have requested the reset of the password for your account.',
            htmlContent: `
                <p>Hello,</p>
                <p>We received a request to reset the password for your account. Please follow the link below to reset your password:</p>
                <p>
                <a href="http://localhost:4000/password/resetpassword/${id}">
                 Reset Password </a>
                 </p>
                <p>If you did not request this password reset, please ignore this email and contact us immediately.
                </p><p>Thank you,
                </p><p>Expensifyz</p>
                `
        })
            return res.status(200).json({ message:  'Link to reset password sent to your mail ', success: true })
        }
        else{
        return res.status(202).json({ message: 'User not Exists..Please Signup or enter correct email id.' }); 
     }  
           
    }
        catch(err){
            console.log(err)
        return res.json({ message: "Reset link not send", sucess: false });
    }
}
const resetPassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        console.log(forgotpasswordrequest.dataValues.isActive)
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ isActive: false});
           return  res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()
        }
        // else {
        //     return res.send(`
        //     <html>
        //         <h2> Link Expired or already clicked once. </h2>
        //     </html> 
        //     `
        //     )
       // }
    })
}

const updatePassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                if(user) {
                    //encrypt the password
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly update the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }
}


module.exports = {
    forgotPassword,
    resetPassword,
    updatePassword
}