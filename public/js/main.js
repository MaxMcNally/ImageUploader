function showSpinner(){
    document.getElementById('pageSpinner')
            .style.display = 'flex';
}

function hideSpinner(){
    document.getElementById('pageSpinner')
    .style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log(document.querySelectorAll(".show-spinner"))
    document.querySelectorAll(".show-spinner").forEach((el)=>{
        console.log(el)
        el.addEventListener("click", function(e){
            console.log(e)
            showSpinner()
        })
    })

}
)

