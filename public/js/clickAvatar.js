document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelector(".avatar-img").addEventListener("click", function(e){
        console.log("clicked avatar image")
        e.target.closest(".mb-3").classList.add("d-none")
        document.querySelector(".avatar-image-upload").classList.remove("d-none") 
    })
});