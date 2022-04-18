document.addEventListener("DOMContentLoaded", function(event) {
    const avatarImage = document.querySelector(".avatar-img")
    if(avatarImage){
        avatarImage.addEventListener("click", function(e){
            e.target.closest(".mb-3").classList.add("d-none")
            document.querySelector(".avatar-image-upload").classList.remove("d-none") 
        })
    }
    
});