let state = {
    "alert-frequency":1,
    "sound-select":"rick roll",
    "watch-frequency": 5,

    loadState: function(){
        if(JSON.parse(localStorage.getItem('config'))){
            saveData=JSON.parse(localStorage.getItem('config'))
            state["sound-select"] = saveData["sound-select"] || "rick roll"
            state["alert-frequency"] = saveData["alert-frequency"] || "1"
            state["watch-frequency"] = saveData["watch-frequency"] || "5"
        } 
    },
    set:function(property, value){
        console.log('state setting ', property, ' to ', value)
        if(state[property]){
            state[property] = value;
            let saveData = {
                "alert-frequency":state["alert-frequency"],
                "sound-select":state["sound-select"],
                "watch-frequency": state["watch-frequency"]
            }
            localStorage.setItem('config',JSON.stringify(daveData))
        } 
        else { console.log (`error: ${property} is not a known configuration property`)}
    },
    // renderConfig: function(){
    //     document.querySelectorAll('[isoption]').forEach(function(el){
    //         optionType = el.getAttribute('isoption')
    //         if(optionType=="alertToggle"){

    //         } else if(optionType=="fillable") {

    //         }
    //     })

    //     document.querySelectorAll('#alert-sounds>*').forEach(function(el){
    //         console.log(el.innerHTML, config["sound-select"])
    //         if(el.innerHTML==config["sound-select"]){
    //             el.style.display = "inline"
    //         } else {
    //             el.style.display = "none"
    //         }
    //     }) 
    // },
    render : {
        fields: function(){
            document.querySelectorAll("[isOption]").forEach(function(el){
                // approximate on('change') which does not appear to work
                function handleChange(e){
                    state.set(e.target.id, e.target.innerHTML)
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
        },
        soundToggle: function(){
    
        }
    }
}






function appendTool(html){
    state.set('alert-frequency', 99);
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
        loadState();
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
                    let message = {message:{flag:"alert", options:{frequency:state["alert-frequency"], sound: state["sound-select"]}}};
                    console.log('New Question Detected - sending alert to background', message);
                    chrome.runtime.sendMessage(message);
                };
            }, state["watch-frequency"]*1000);
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
                state["alert-sound"]=document.querySelector('#'+next).innerHTML;
                saveConfig();
            })
        })
        document.querySelectorAll("[optField='true']").forEach(function(el){
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
