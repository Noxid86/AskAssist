let config = {
    speed: 5000,
    alert: {
        sound:1,
        frequency:1
    }
};

function appendTool(html){
    // fetch the plugin HTML from the background script...
    chrome.runtime.sendMessage({message:{flag:"get", option:"toolbar.html"}}, function(res){
        //... and append it
        document.querySelector('.p-ia__view_header__spacer').innerHTML = res;
        //... and it's event listeners
        var start = document.querySelector('#start-timer');
        var stop = document.querySelector('#stop-timer');
        document.querySelector('#start-timer').addEventListener('click', function(){
            start.style.display = 'none';
            stop.style.display = 'inline-block';
            console.log('clicking Refresh every '+config.speed+' milliseconds');
            timer = setInterval(function(){
                var refresh_btn = document.querySelectorAll('[data-qa-action-id="refresh-queue"]')[0];
                if(refresh_btn){refresh_btn.click()};
                if(newQuestion()){
                    //chrome.runtime.sendMessage({message:{flag:"alert", option:config.alert}});
                    config.watch = false;
                };
            }, config.speed);
            return timer;
        });
        document.querySelector('#stop-timer').addEventListener('click', function(){
            stop.style.display = 'none';
            start.style.display = 'inline-block';
            clearInterval(timer);   
        });
        document.querySelector('#settings-button').addEventListener('click', function(){
            if(document.querySelector('#options-container').style.display=="none"){
                document.querySelector('#options-container').style.display="block"
            } else {
                document.querySelector('#options-container').style.display="none"
            }
        });
    })
}

function newQuestion(){
    let search = document.body.innerHTML.search('<b data-stringify-type="bold">AVAILABLE QUESTIONS</b>');
    if(search!==-1){
        return true;
    } else {
        return false;
    } 
}

window.addEventListener('load', appendTool);
