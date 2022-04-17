function showSpinner(){
    document.getElementById('pageSpinner').style.display = 'flex';
}

function hideSpinner(){
    document.getElementById('pageSpinner').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelectorAll(".show-spinner").forEach((el)=>{
        el.addEventListener("click", function(e){
            showSpinner()
        })
    })

}
)

