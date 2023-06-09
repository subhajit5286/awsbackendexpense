

async function showListofFiles() {
try{
    const token = localStorage.getItem('token');
    const response = await axios.get('http://54.227.2.199:4000/expense/downloadedFiles', { headers: {"Authorization" : token} })
       console.log('clicked1')
      const data = response.data;
    console.log('all downloads',data);
    if(data.length >0){ 
    //downloadedFiles.hidden = false;
    const urls = document.getElementById('fileList');
    urls.textContent = 'Downloaded Files';
    urls.style.fontWeight= "500";

    for(let i=0; i<data.length; i++){
        const link = document.createElement('a');
        link.href = data[i]
        link.textContent = data[i].slice(0, 50 - 3) + "...";
        const urlList = document.createElement('li');
        urlList.appendChild(link);
        urls.appendChild(urlList);
        }
    }else{
      alert(`You haven't downloaded any file yet`);
    }
} catch(err){
    console.log(err)
}

}


function back(){
	window.location.href = "./expense.html"
}
