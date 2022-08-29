// ALERT TIMER
// time between alerts is controlled by config.alert.frequency
let started = false;
let time=1000;
let timer = setInterval(()=>{
    if(started){time++}
    console.log('background yo!')
},1000);
let currSound;


// Function to replace old functionality when upgrading to manifest v3
function playSound(sound, volume) {
    console.log('lets play a sound at volume:', (1/5)*volume)
    let url = chrome.runtime.getURL('./components/audio.html');
    // set this string dynamically in your code, this is just an example
    // this will play success.wav at half the volume and close the popup after a second
    url += `?volume=${(1/5)*volume}&src=${sound}&length=1000`;

    chrome.windows.create({
        type: 'popup',
        focused: false,
        top: 20,
        left: 20,
        height: 20,
        width: 20,
        url,
    })

}


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
            console.log('unknown alert')
            break;
    } 
    return true  
})

let alert_manager = {
    alertList: [
        {name:"!!!!!", file:'metalGear.m4a'},
        {name:"beep beep", file:'beep.mp3'},
        {name:"softly chirp", file:'chirp.mp3'},
        {name:"alert R2", file:'r2d2.mp3'}
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
        playSound(alertFile, options.volume);
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