var form=document.getElementById('addForm')

form.addEventListener('submit', loginUser);//

 async function loginUser(e){
    try{
        e.preventDefault();
        console.log(e.target.email.value);

        const loginDetails ={
            
            email: e.target.email.value,
            password: e.target.password.value

        }
        console.log(loginDetails)
         let response = await axios.post("http://54.227.2.199:4000/user/login",loginDetails)
        // .then(response=>{
        //   console.log(response.status)
        //   window.location.href = "./login.html"
        // })
        // .catch(err=>{
        //   console.log(err)
        //   throw new Error('Failed to login')
        // })
        
        console.log(response.status)
        if(response.status === 200) {
            alert(response.data.message)
            localStorage.setItem('token',response.data.token)
            window.location.href = "./expense.html"

        } else {
          throw new Error(response.data.message)

        }

  }
  catch(err){
      document.body.innerHTML += `<div style="color:red;">${err} <div> `

  }
     
    
}
