document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelectorAll(".toggle").forEach((el)=>{
        el.addEventListener("click", function(e){
            e.preventDefault()
            if(e.target.dataset.startclass){
                e.target.classList.toggle(e.target.dataset.startclass)
            }
            e.target.classList.toggle(e.target.dataset.toggleclass)
            document.querySelector(e.target.dataset.target).classList.toggle("show")
        })
    })

});