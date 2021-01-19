// ALERT TIMER
// time between alerts is controlled by config.alert.frequency
let time=0;
let timer = setInterval(()=>{
    time++
},1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log(request);
    flag = request.message.flag;
    switch (flag) {
        case "alert":
            console.log('alert request')
            handleAlert(request);
            sendResponse("alerted")
            break;
        case "get":
            console.log('get request')
            handleGet(request, sender, sendResponse);
            break;
        default:
            break;
    } 
    return true  
})

function handleAlert({message}){
    let frequency = parseInt(message.options['alert-frequency']);
    let alertInterval = 60/parseInt(message.options['alert-frequency']);
    console.log("FR:", frequency, "IN", alertInterval, "::",time)
    console.log((message.options['alert-frequency'] != 0), (time> alertInterval))
    if(
        message.options['alert-frequency'] != 0 && 
        time < alertInterval
    ){
        console.log('aborting alert')
        return
    }
    console.log('handling alert')
    let alertFile = "";
    let alerts = message.options["possible-alerts"];
    console.log(alerts[0], alerts[1]);
    alerts.forEach(function(alert){
        console.log(alert.name, message.options["sound-select"]);
        if (alert.name==message.options["sound-select"]){
            alertFile = alert.file;
        }
    })
    console.log(alertFile);
    alert = new Audio(chrome.runtime.getURL(`./assets/sounds/${alertFile}.mp3`));
    console.log(time, alertInterval);
    alert.play() 
    time = 0;
}

function handleGet(request, sender, sendResponse){
    let options = request.message.options
    let files = [];
    let components = [];
    // Convert Filenames to extension URLs
    options.forEach(function(u,i){
        options[i].path = chrome.runtime.getURL(options[i].path)
    })
    // Fetch files
    console.log('fetching files...')
    options.forEach(({path}, i) => {
        files.push(
            fetch(path).catch((err)=>{
                console.log(err);
                return {err:"not found"}
            })
        )
        console.log('Files:',files);
    });
    // When all files are fetched, convert them to text
    Promise.all(files).then(function(results){
        console.log('building components...')
        results.forEach(function(file, i){
            if(file['err']){
                components[i]=file['err'];
            } else {
                components[i]=file.text();
            }
        })
        Promise.all(components).then(function(results){
            let response = {}
            results.forEach((res, i)=>{
                response[options[i]['name']]=res;
            })
            console.log('response', response)
            sendResponse(response);
        })
    })
}