document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelector(".toggle").addEventListener("click", function(e){
        e.target.classList.toggle(e.target.dataset.startclass)
        e.target.classList.toggle(e.target.dataset.toggleclass)
        document.querySelector(e.target.dataset.target).classList.toggle("show")
    })

});