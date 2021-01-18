let options = {
    "alert-frequency": 10,
    "alert-sound": 1,
    "refresh-frequency": 2
};

function appendTool(html){
    // fetch the plugin HTML from the background script...
    chrome.runtime.sendMessage({message:{flag:"get", options:[{name:'toolbar', path:"./abccomponents/toolbar.html"}, {name:'options', path:"./components/options.html"}]}}, function(res){
        //... and append it
        console.log(res[0]);
        console.log(res[1]);
        document.querySelector('.p-ia__view_header__spacer').innerHTML = res[0];

        //... and it's event listeners
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
        document.querySelectorAll('.ask-option').forEach(function(el){
            el.addEventListener('change', function(e){
                options[e.target.id]=e.target.value;
                console.log(options);
            })
        })
        var start = document.querySelector('#start-timer');
        var stop = document.querySelector('#stop-timer');
        document.querySelector('#options-container').style.display="none"
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
