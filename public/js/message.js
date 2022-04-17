function updateMessageNotfication(newValue){
    if(newValue === 0){
        return document.querySelector(".message-indicator").classList.add("d-none")
    }
    document.querySelector(".message-indicator").innerHTML = newValue
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
    let a = null;
    if(e.type === "message"){
        a = document.createElement("a")
        a.setAttribute("href", "/messages")
        a.appendChild(document.createTextNode(e.message))
        a = a.outerHTML
    }
    console.log(a)
    const options = {
        type: "text-primary",
        message: a || event.data.message
    }
   
    const alert = new Alert(options)
    alert.show()
    updateMessageNotfication(e.unreadMessages)
    console.log('Message from server ', event.data);
});

document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelector(".message-indicator").addEventListener("click", function(){
        updateMessageNotfication(0);
    })
    document.querySelector(".message").addEventListener("click", function(e){
        e.target.classList.toggle(e.target.dataset.startclass)
        e.target.classList.toggle(e.target.dataset.toggleclass)
        document.querySelector(e.target.dataset.target).classList.toggle("show")
    })
});