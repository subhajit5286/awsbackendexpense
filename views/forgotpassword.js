var form=document.getElementById('addForm')

form.addEventListener('submit', forgotPassword);//

 async function forgotPassword(e){
    try{
        e.preventDefault();
        const emailDetails ={
            
            email: e.target.email.value,
            
        }
        console.log(emailDetails)
         let response = await axios.post("http://54.175.203.55:4000/password/forgotpassword",emailDetails)
        // .then(response=>{
        //   console.log(response.status)
        //   window.location.href = "./login.html"
        // })
        // .catch(err=>{
        //   console.log(err)
        //   throw new Error('Failed to login')
        // })
                
        alert(response.data.message)


  }
  catch(err){
      document.body.innerHTML += `<div style="color:red;">${err} <div> `

  }
     
    
}
