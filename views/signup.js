var form=document.getElementById('addForm')

form.addEventListener('submit', saveUser);//

 async function saveUser(e){
    try{
        e.preventDefault();
        console.log(e.target.email.value);

        const signupDetails ={
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value

        }
        console.log(signupDetails)
         let response = await axios.post("http://54.175.203.55:4000/user/signup",signupDetails)
        // .then(response=>{
        //   console.log(response.status)
        //   window.location.href = "./login.html"
        // })
        // .catch(err=>{
        //   console.log(err)
        //   throw new Error('Failed to login')
        // })
        
        console.log(response.status)
        if(response.status === 201) {
          window.location.href = "./login.html"

        } else {
          throw new Error('Failed to login')

        }

  }
  catch(err){
      document.body.innerHTML += `<div style="color:red;">${err} <div> `

  }
     
    
}
