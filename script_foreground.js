let config = {
    speed: 5000,
    alert: {
        sound:1,
        frequency:1
    }, 
    watch: true
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    console.log('message recieved','---------');
    console.log(message, sender, sendResponse);
});

function appendTool(html){
    chrome.runtime.sendMessage({message:{flag:"get", option:"toolbar.html"}})


    /* ADD HTML BUTTONS */
    var header = document.querySelector('.p-ia__view_header__spacer');
    header.innerHTML = "<select class='cusBut' id='alert_select'>ALERT</select><div class='cusBut' id='start-timer'>START</div><div class='cusBut' id='stop-timer'>STOP</div><div class='cusBut' id='options'></div>";
    var start = document.querySelector('#start-timer');
    var stop = document.querySelector('#stop-timer');
    var alert = document.querySelector('#alert');
    var options = document.querySelector('#options');
    var timer;

    
    start.addEventListener('click', function(){
        start.style.display = 'none';
        config.watch = true;
        stop.style.display = 'inline-block';
        console.log('clicking Refresh every '+config.speed+' milliseconds');
        timer = setInterval(function(){
            var refresh_btn = document.querySelectorAll('[data-qa-action-id="refresh-queue"]')[0];
            if(refresh_btn){refresh_btn.click()};
            if(newQuestion()){
                chrome.runtime.sendMessage({message:{flag:"alert", option:config.alert}});
                config.watch = false;
            };
        }, config.speed);
        return timer;
    })

    stop.addEventListener('click', function(){
        stop.style.display = 'none';
        start.style.display = 'inline-block';
        clearInterval(timer);
        
    })
   
    chrome.runtime.sendMessage({message:{flag:"alert", option:config.alert}});
}

function newQuestion(){
    let search = document.body.innerHTML.search('<b data-stringify-type="bold">AVAILABLE QUESTIONS</b>');
    if(search!==-1){
        return true;
    } else {
        return false;
    } 
}

window.addEventListener('load', appendTool)
