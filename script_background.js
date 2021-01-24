// ALERT TIMER
// time between alerts is controlled by config.alert.frequency
let started = false;
let time=1000;
let timer = setInterval(()=>{
    if(started){time++}
},1000);
let currSound;

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log(request);
    flag = request.message.flag;
    switch (flag) {
        case "alertList":
            sendResponse(alert_manager.alertList)
            break;
        case "alert":
            console.log('alert request')
            alert_manager.handleAlert(request.message.options);
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

let alert_manager = {
    alertList: [
        {name:"beep beep", file:'beep'},
        {name:"softly chirp", file:'chirp'}
    ],
    handleAlert: (options)=>{
        // TERMS:
        // alert-frequency: the number in times per minute given per the user that the alert should maximally go off.
        // alert-interval: the number of seconds that must have passed since the last alert to statisfy the alert-frequency
        let frequency = parseInt(options['frequency']);
        let alertInterval = 60/frequency
        let sound = options.sound;
        console.log(`${time} < ${alertInterval}: ${time < alertInterval}`)
        // ensure that the user has not turned off alerts, nor is it too soon, given the current frequency,  to issue another alert
        if(
            options['alert-frequency'] != 0 && 
            time < alertInterval
        ){
            console.log('aborting alert')
            return false
        }
        // load the sound file and issue the alert
        let alertFile;
        alert_manager.alertList.forEach(function(alert){
            if (alert.name==sound){
                alertFile = alert.file;
            }
        })
        if(!alertFile){
            console.log(options)
            console.log(sound, "does not have an associated sound file");
            return false
        }
        console.log('Playing Alert')
        alert = new Audio(chrome.runtime.getURL(`./assets/sounds/${alertFile}.mp3`));
        alert.volume = (1/5)*options["volume"];
        if(currSound){currSound.pause()}
        currSound = alert;
        currSound.play();
        started = true;
        time = 0;
    }
}

// HANDLE GET REQUESTS FROM THE FRONT END
/* Unneccessary Functionality - handleGet was designed 
   to be able to fetch many different components for 
   the front end.  I have since redesigned the plugin 
   to use a single component.*/

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