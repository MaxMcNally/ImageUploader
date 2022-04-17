document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".like").forEach((el) => {
        el.addEventListener("click", function(e){
            e.preventDefault()
            e.stopPropagation()
            e.target.classList.toggle("liked")
            
        })
    })
})