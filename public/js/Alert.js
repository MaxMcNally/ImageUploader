class Alert{
    constructor(options){
        const {type, message, headerMessage, autohide=true} = options
        this.type = type
        this.message = message
        this.headerMessage = headerMessage
        this.datetime = new Date().toLocaleString('en-US')
        const template = document.createElement("div");
        this.id = "toast-" + Math.random().toString(36).replace("0.","")
        template.id = this.id
        template.innerHTML = this.html()
        const toastContainer = this.getToastContainer()
        toastContainer.append(template)
        this.toast = new bootstrap.Toast(document.getElementById(this.id).querySelector('.toast'),{autohide:autohide})
    }
    
    getToastContainer(){
        if(document.getElementById("toastContainer")){
            return document.getElementById("toastContainer")
        }
        else {
            const template = document.createElement("div");
            template.id = "toastContainer"
            let classes = "toast-container position-fixed bottom-0 end-0 p-3".split(" ")
            for (const c of classes){
                template.classList.add(c)
            }
            document.body.append(template)
            return document.getElementById("toastContainer")
        }
    }
    
    show(){
        this.toast.show()
    }

    hide(){
        this.toast.hide()
    }
    remove(){
        document.getElementById(this.id).remove()
    }
    html(){
        return `<div class="toast ${this.type}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto">${this.headerMessage || ""}</strong>
            <small>${this.datetime}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${this.message}
        </div>
        </div>
    `
    }
}