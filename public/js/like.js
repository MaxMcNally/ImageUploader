document.addEventListener("DOMContentLoaded", function() {
    const like = document.querySelectorAll(".like")
    if(like){
        like.forEach((el) => {
            el.addEventListener("click", async function(e){
                e.stopImmediatePropagation()
                e.preventDefault()
                
                e.target.classList.toggle("liked")
                const imageID = e.target.dataset.imageid
                const data = {
                    imageID
                }
                console.log(data,JSON.stringify(data))
                const url = e.target.classList.value.includes("liked") ? "/like" : "/unlike"
                const likeResponse = await fetch(`${url}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body : JSON.stringify(data)
                });
                const likeData = await likeResponse.json()
                e.target.closest('.likeable').querySelector(".like-count").innerHTML = likeData.likes > 0 ? likeData.likes : ""
                console.log(likeData)
            })
        })
    }
    
})