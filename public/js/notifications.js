document.addEventListener("DOMContentLoaded", function(event) {
    const notificationsMenu = document.getElementById("notificationsMenu")
    if(notificationsMenu){
        notificationsMenu.addEventListener('click', async function(){
            const result = await fetch("/clearNotifications",{
                method: "POST",
            })
            console.log(result)

        })
    }
})