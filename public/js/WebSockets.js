function updateMessageNotification(newValue){
    if(document.querySelector(".message-indicator")) {
        if(newValue === 0){
            return document.querySelector(".message-indicator").classList.add("d-none")
        }
        document.querySelector(".message-indicator").innerHTML = newValue
    }
   
}

//Setup web socket connection for messaging
const socket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);

//listen for inital connection
socket.addEventListener('open', function (event) {
    socket.send("Hello World");
});

//Listen for messages
socket.addEventListener('message', function (event) {
    const e = JSON.parse(event.data)
    console.log(e)
    let alertOptions = {
        type: "text-primary"
    }
    switch (e.type){
        case "message":
            a = document.createElement("a")
            a.setAttribute("href", "/messages")
            a.appendChild(document.createTextNode(e.message))
            a = a.outerHTML
            alertOptions.message = a
            
        case "comment":
            a = document.createElement("a")
            a.setAttribute("href", "/image/" + e.imageID)
            a.appendChild(document.createTextNode(e.message))
            a = a.outerHTML
            alertOptions.message = a
            
        case "follower":
            a = document.createElement("a")
            a.setAttribute("href", "/users/" + e.username)
            a.appendChild(document.createTextNode(e.message))
            a = a.outerHTML
            alertOptions.message = a
        
        case "follower_post":
                a = document.createElement("a")
                a.setAttribute("href", "/image/" + e.imageID)
                a.appendChild(document.createTextNode(e.message))
                a = a.outerHTML
                alertOptions.message = a    
    }

    const alert = new Alert(alertOptions)
    alert.show()
    updateMessageNotification(e.unreadMessages)
    console.log('Message from server ', event.data);
});

document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelector(".message-indicator").addEventListener("click", function(){
        updateMessageNotification(0);
    })

    const message = document.querySelector(".message")
    if(message){
        message.addEventListener("click", function(e){
            e.target.classList.toggle(e.target.dataset.startclass)
            e.target.classList.toggle(e.target.dataset.toggleclass)
            document.querySelector(e.target.dataset.target).classList.toggle("show")
        })
    }
    
});