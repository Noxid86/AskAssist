// ALERT TIMER
// time between alerts is controlled by config.alert.frequency
let time=0;
let timer = setInterval(()=>{
    time++
},1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log(request);
    flag = request.message.flag;
    console.log(flag)
    switch (flag) {
        case "alert":
            handleAlert(request);
        case "get":
            //handleGet(request, sendResponse);
    }
    sendResponse("This is a mo'fuckin response")
})

function handleAlert({message}){
    console.log('handling alert')
    alert = new Audio(chrome.runtime.getURL(`./assets/sounds/alert${message.option.sound}.mp3`));
    if(
        alert && 
        message.option.frequency > 0 && 
        time>message.option.frequency
    ){alert.play()}   
}

function handleGet({message}, sendResponse){
    console.log('handling get');

}