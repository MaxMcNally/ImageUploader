document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelectorAll(".like").forEach((el) => {
        console.log(el)
        el.addEventListener("click", function(e){
            e.preventDefault()
            e.stopPropagation()
            console.log("clicked like")
            e.target.classList.toggle("liked")
            
        })
    })
});