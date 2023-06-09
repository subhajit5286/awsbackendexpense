var form=document.getElementById('addForm');


 


form.addEventListener('submit', saveExpense);//

async function download(){
try{
const token = localStorage.getItem('token');
const response = await axios.get('http://54.227.2.199:4000/expense/download', { headers: {"Authorization" : token} })
console.log('clicked')
if(response.status === 200){
        // document.getElementById('fileDownloadedbutton').hidden = false;
        var a = document.createElement("a");
        a.href = response.data.fileURl;
        a.download = 'myexpense.csv';
        a.click();
    } else {
        throw new Error(response.data.message)
    }
}
catch(err) {
        console.log(err);
    }
    
}

function showDownloadedFiles() {
window.location.href = "./filedownloadlist.html"

}





function logOut(){
    //e.preventDefault();
    alert('User will Logged Out..')
    localStorage.removeItem('token')
    window.location.href = "./login.html"

}
function showPremiumuserMessage(){
    document.getElementById('buy premium').style.visibility = "hidden"
    document.getElementById('message').innerHTML = "You are a Premium User"
    
}
function saveExpense(event){
    event.preventDefault();
    const amount = event.target.amount.value;
    const description= event.target.description.value;
    const category = event.target.category.value;
    const userId=1
    const obj = {
        amount,
        description,
        category,
        userId

    }
    const token = localStorage.getItem('token');
    axios.post("http://54.227.2.199:4000/expense/add-expense",obj, {headers: {"Authorization": token}})
       .then((response) => {
        showNewExpenseOnScreen(response.data.newExpense);
           console.log(response);
       })
       .catch((error) => {
        document.body.innerHTML =
          document.body.innerHTML + "<h4>Something went worng";
        console.log(error);
       })

}

window.addEventListener("DOMContentLoaded",() => {
    const token = localStorage.getItem('token');
    var base64Url = token.split('.')[1];
    var decodedToken = JSON.parse(window.atob(base64Url));
    console.log(decodedToken.ispremiumuser)
    // axios.get("http://localhost:4000/expense/get-expenses?page=1&limit=1",{ headers: {"Authorization": token}})
    //    .then((response) => {
    //       console.log(response.data.allExpensesDetails,response.data.balance);
          const welcome = document.getElementById("welcome");
          //console.log(welcome)
         const childHtml = 
         `<h1 style="color: red;font-family: sans-serif;margin-left: 45.5rem;" id="welcome">Welcome ${decodedToken.name} </h1>`
         welcome.innerHTML =welcome.innerHTML+childHtml;
         if(decodedToken.ispremiumuser){
           showPremiumuserMessage()
            showLeaderboard()
        }
        if(!decodedToken.ispremiumuser){
            document.getElementById('leaderboard').style.visibility = 'hidden'
            document.getElementById('downloadexpense').disabled = true
        }
        //   response.data.expenses.forEach(expense => {
        //     showNewExpenseOnScreen(expense);
        //   })
           // for(var i=0; i<response.data.allExpenses.length; i++){
           //    showNewExpenseOnScreen(response.data.allExpenses[i]);
           // }


       // }).catch((error) => {
       //      console.log(error);
       // });
          getAllExpenses();
    setPaginationLimit();
});
async function getAllExpenses(page = 1, limit = 2) {
    const token = localStorage.getItem('token');
    // var w = window.innerWidth;
    // console.log(w)
    if(localStorage.getItem('limit')){
        limit = localStorage.getItem('limit');
    }
    const res = await axios.get(`http://54.227.2.199:4000/expense/get-expenses?page=${page}&limit=${limit}`, {headers: {'Authorization': token}})
        const expenses = res.data.allExpensesDetails;
        document.getElementById("items").innerHTML=''
        expenses.forEach((expense) => {
            showNewExpenseOnScreen(expense)
        })
       // balance = res.data.balance;
        if(expenses.length <= 0){
            //const paginationRowDiv = document.getElementById('paginationRowDiv');
            //paginationRowDiv.innerText = '';
            return;
        }
        const currentPage = res.data.currentPage;
        const prevPage = res.data.prevPage;
        const nextPage = res.data.nextPage;
        const lastPage = res.data.lastPage;
        paginationInDOM(currentPage, prevPage, nextPage,lastPage, limit);
}

function paginationInDOM(currentPage, prevPage, nextPage, lastPage,limit = 2){
    currentPage = parseInt(currentPage);
    prevPage = parseInt(prevPage);
    nextPage = parseInt(nextPage);
    lastPage = parseInt(lastPage);
    console.log(lastPage)
    document.getElementById('paginationButtons').innerText = '';

    const currentPageBtn = document.createElement('button');
    currentPageBtn.innerText = 'currentPage';
    currentPageBtn.className = 'btn btn-secondary';
    currentPageBtn.addEventListener('click', () => getAllExpenses(currentPage, limit));

    const prevPageBtn = document.createElement('button');
    prevPageBtn.innerText = '<< Prev';
    prevPageBtn.className = 'btn btn-outline-secondary';
    prevPageBtn.addEventListener('click', () => getAllExpenses(prevPage, limit));

    const nextPageBtn = document.createElement('button');
    nextPageBtn.innerText = 'Next >>';
    nextPageBtn.className = 'btn btn-outline-secondary';
    nextPageBtn.addEventListener('click', () => getAllExpenses(nextPage, limit));

    const lastPageBtn = document.createElement('button');
    lastPageBtn.innerText = 'Last Page';
    lastPageBtn.className = 'btn btn-outline-secondary';
    lastPageBtn.addEventListener('click', () => getAllExpenses(lastPage, limit));

    if(prevPage){
        prevPageBtn.classList.remove('disabled');
    }else{
        prevPageBtn.classList.add('disabled');
    }
    if(nextPage){
        nextPageBtn.classList.remove('disabled');
    }else{
        nextPageBtn.classList.add('disabled');
    }

    paginationButtons.appendChild(prevPageBtn);
    paginationButtons.appendChild(currentPageBtn);
    paginationButtons.appendChild(nextPageBtn);
    paginationButtons.appendChild(lastPageBtn);
}

function setPaginationLimit(){
    localStorage.removeItem('limit')
    const paginationLimit = document.getElementById('paginationLimit');
    paginationLimit.addEventListener('change', () => {
        localStorage.setItem('limit', paginationLimit.value);
       // window.location.reload();
        limit = localStorage.getItem('limit');
        getAllExpenses(page=1, limit);
    });
}

function showNewExpenseOnScreen(expense) {
   
    const parentNode = document.getElementById("items");
    const childHTML = `<li class="list-group-item" style="display:inline-block;" id=${expense.id}>
                        <div class="row" >
                            <div class="col-sm-1" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;">
                            <span >${expense.id} </span>
                            </div>
                            <div class="col-sm-3" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;">
                            <span >${expense.amount}</span>
                            </div>
                            <div class="col-sm-3" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;">
                            <span>${expense.description}</span>
                            </div>
                            <div class="col-sm-3" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;">
                            <span>${expense.category}</span>
                            </div>
                            <div class="col-sm-2" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;margin-right:0rem">
                            <span>
                                 <button class="btn btn-danger" onclick=deleteExpense('${expense.id}')>Delete</button>
                            </span>
                            </div>
                        </div>        
                    </li>`;
    parentNode.innerHTML = parentNode.innerHTML + childHTML;
  
}

function deleteExpense(expenseid) {
    console.log(expenseid);
    const token = localStorage.getItem('token');
    axios.delete(`http://54.227.2.199:4000/expense/delete-expense/${expenseid}`,{headers:{"Authorization":token}})
        .then((response) => {
           removeExpenseFromScreen(expenseid);
        })
        .catch((err) => console.log(err));
}

function removeExpenseFromScreen(expenseid) {

    const parentNode = document.getElementById("items");
    const childNodeToBeDeleted = document.getElementById(expenseid);
    if (childNodeToBeDeleted) {
        parentNode.removeChild(childNodeToBeDeleted);
    }
}

document.getElementById('buy premium').onclick = async function (e) {
    try{
        const token = localStorage.getItem('token')
    const response = await axios.get('http://54.227.2.199/:4000/purchase/premiummembership',{ headers: {"Authorization": token}});
    console.log(response);
    var options = 
    {
        "key" : response.data.key_id,
        "order_id" : response.data.order.id,
         "handler": async function (response) {
             await axios.post('http://54.227.2.199:4000/purchase/updatetransactionstatus',{
                 order_id: options.order_id,
                 payment_id: response.razorpay_payment_id,

             },{headers:{"Authorization":token}} )

             alert('You are a Premium User Now')
             document.getElementById('buy premium').style.visibility = "hidden"
             document.getElementById('message').innerHTML = "You are a Premium User"
             localStorage.setItem('isadmin',true)
             localStorage.setItem('token',res.data.token)
             
         },
    };
     const rzp1 = new Razorpay(options);
     rzp1.open();
     e.preventDefault();

     rzp1.on('payment.failed',function(response){
         console.log(response);
         alert('Something went wrong')
     });
    }catch(err){
        console.log(err);
    } 
}

async function showLeaderboard(){
    try{
    const token = localStorage.getItem('token');
    console.log(token)
    const userLeaderBoardArray = await axios.get("http://54.227.2.199:4000/premium/showLeaderBoard",{headers:{"Authorization":token}} )
         console.log(userLeaderBoardArray);
         const parentNode = document.getElementById("items1");
         parentNode.innerHTML =""
         console.log(parentNode)
         userLeaderBoardArray.data.forEach((userDetails) => {
            const childHTML = `<li class="list-group-item" style="display:inline-block;" >
                        <div class="row" >
                            <div class="col-sm-6" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;">
                            <span >${userDetails.name}</span>
                            </div>
                            <div class="col-sm-6" style="text-align:center;font-family: Trebuchet MS;font-size: 20px;">
                            <span>${userDetails.totalExpenses}</span>
                            </div>
                            
                        </div>        
                    </li>`;
    parentNode.innerHTML = parentNode.innerHTML + childHTML;
            
        })
    } catch(err){
            console.log(err)
        }
   
}

