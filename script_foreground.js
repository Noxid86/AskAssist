let config = config_default = {
    "alert-frequency":1,
    "sound-select":"rick roll",
    "watch-time": 4,
};
function loadConfig(){
    if(JSON.parse(localStorage.getItem('config'))){config=JSON.parse(localStorage.getItem('config'))}
    document.querySelectorAll('[isOption="true"]').forEach(function(el){
        el.innerHTML=config[el.id]
    })
    document.querySelectorAll('#alert-sounds>*').forEach(function(el){
        console.log(el.innerHTML, config["sound-select"])
        if(el.innerHTML==config["sound-select"]){
            el.style.display = "inline"
        } else {
            el.style.display = "none"
        }
    })  
}

function saveConfig(){
    document.querySelectorAll('[isOption="true"]').forEach(function(el){
        config[el.id]=el.innerHTML;
    })
    let soundSelect = "";
    document.querySelectorAll('#alert-sounds>*').forEach(function(el){
        if(el.style.display!="none"){
            soundSelect = el.innerHTML;
        }
    })
    config["sound-select"]=soundSelect;
    localStorage.setItem('config', JSON.stringify(config))
    console.log('saved config:',config);
}

function appendTool(html){
    // fetch the plugin components from the background script...
    chrome.runtime.sendMessage(
        {message:
            {flag:"get", options:[
             {name:'toolbar', path:"./components/toolbar.html"}
            ]}
        }, 
        function(res){   
        //... and append them
        let toolbar = document.createElement('div');
        toolbar.innerHTML=res.toolbar;
        let workspace = document.querySelector('.p-workspace__primary_view_contents');
        workspace.prepend(toolbar);
        loadConfig();
        //... and their event listeners
        let waiting = document.querySelector('#waiting');
        let watching = document.querySelector('#watching');
        let waitBrach = document.querySelector('#waiting-branch');
        let watchBrach = document.querySelector('#watching-branch');
        waiting.addEventListener('click', function(){
            console.log('running refresh')
            waitBrach.style.display = "none";
            watchBrach.style.display = "inline";
            timer = setInterval(function(){
                var refresh_btn = document.querySelector('[data-qa-action-id="refresh-queue"]');
                refresh_btn.click();
                if(newQuestion()){
                    let message = {message:{flag:"alert", options:config}};
                    console.log('New Question Detected - sending alert to background', message);
                    chrome.runtime.sendMessage(message);
                };
            }, config["watch-time"]*1000);
            return timer;
        });
        watching.addEventListener('click', function(){
            waitBrach.style.display = "inline";
            watchBrach.style.display = "none";
            clearInterval(timer);   
        });
        document.querySelectorAll('#alert-sounds>*').forEach(function(el,i){
            el.addEventListener('click', function(e){
                let next = (e.target.id == "one")? "two" : "one";
                document.querySelectorAll('#alert-sounds>*').forEach(function(el,i){
                    el.style.display = 'none';
                })
                document.querySelector('#'+next).style.display = 'inline';
                config["alert-sound"]=document.querySelector('#'+next).innerHTML;
                saveConfig();
            })
        })
        document.querySelectorAll("[contenteditable='true']").forEach(function(el){
            // approximate on('change') which does not appear to work
            function handleChange(e){
                saveConfig();
            }
            el.addEventListener("blur", handleChange);
            el.addEventListener("input", handleChange);
            // prevent return and overspacing on contenteditable features
            el.addEventListener("keypress", function(e){ 
                if (e.target.innerHTML.length>2 || isNaN(String.fromCharCode(e.which)) || e.which==13){
                    e.preventDefault();
                };
            });
        });
    });
};

function newQuestion(){
    console.log('searching for new question...')
    let search = document.body.innerHTML.search('<b data-stringify-type="bold">AVAILABLE QUESTIONS</b>');
    if(search!==-1){
        return true;
    } else {
        return false
    } 
}


window.addEventListener('load', appendTool);
