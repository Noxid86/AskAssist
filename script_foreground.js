let options = {
    "alert-frequency": 10,
    "alert-sound": 1,
    "refresh-frequency": 2
};

function appendTool(html){
    // fetch the plugin components from the background script...
    chrome.runtime.sendMessage({message:{flag:"get", options:[{name:'toolbar', path:"./components/toolbar.html"}, {name:'options', path:"./components/options.html"}]}}, function(res){
        //... and append them
        document.querySelector('.p-ia__view_header').innerHTML += res.toolbar;
        document.querySelector('.c-tabs__tab_menu').innerHTML += res.options;
        //... and their event listeners
        document.querySelector('#start-timer').addEventListener('click', function(){
            start.style.display = 'none';
            stop.style.display = 'inline-block';
            timer = setInterval(function(){
                var refresh_btn = document.querySelectorAll('[data-qa-action-id="refresh-queue"]')[0];
                if(refresh_btn){refresh_btn.click()};
                if(newQuestion()){
                    chrome.runtime.sendMessage({message:{flag:"alert", option:options["alert-sound"]}});
                };
                console.log(options["refresh-frequency"]*1000)
            }, options["refresh-frequency"]*1000);
            return timer;
        });
        document.querySelector('#stop-timer').addEventListener('click', function(){
            stop.style.display = 'none';
            start.style.display = 'inline';
            clearInterval(timer);   
        });
        document.querySelector('#settings-button').addEventListener('click', function(){
            let container = document.querySelector('#options-container');
            if(container.classList.contains('slideOut')){
                container.classList.remove('slideOut');
            } else {
                container.classList.add('slideOut');
            }
        });
        document.querySelectorAll('.ask-option').forEach(function(el){
            el.addEventListener('change', function(e){
                options[e.target.id]=e.target.value;
                console.log(options);
            })
        })
        var start = document.querySelector('#start-timer');
        var stop = document.querySelector('#stop-timer');
        //document.querySelector('#options-container').style.display="none"
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


function handleInput(e){
    console.log("handling input")
    console.log(e.target.value);
}

window.addEventListener('load', appendTool);
