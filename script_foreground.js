let state = {
    "alert-frequency":1,
    "sound-select":"rick roll",
    "watch-frequency": 5,
    alertList: [],
    
    loadState: function(){
        if(JSON.parse(localStorage.getItem('config'))){
            saveData=JSON.parse(localStorage.getItem('config'))
            console.log('loading::: ', saveData);
            state["sound-select"] = saveData["sound-select"] || "rick roll"
            state["alert-frequency"] = saveData["alert-frequency"] || "1"
            state["watch-frequency"] = saveData["watch-frequency"] || "5"
        } 
        this.render.fields();
        this.render.soundToggle;
    },
    
    set: function(property, value){
        if(property in state){
            console.log('state setting ', property, ' to ', value)
            state[property] = value;
            console.log("::",state["alert-frequency"])
            let saveData = {
                "alert-frequency":state["alert-frequency"],
                "sound-select":state["sound-select"],
                "watch-frequency": state["watch-frequency"]
            }
            console.log('saving settings ', saveData)
            localStorage.setItem('config',JSON.stringify(saveData))
            state.render[property];
        } 
        else { 
            console.log (`error: ${property} is not a known configuration property`)
            console.log(state);
        }
    },

    render : {
        fields: function(){
            console.log('rendering editable fields');
            document.querySelectorAll("[isOption]").forEach(function(el){
                console.log('setting ', el);
                el.innerHTML = state[el.id];
                // approximate on('change') which does not appear to work
                function handleChange(e){
                    console.log(e.target.id, "changed")
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
            console.log('render sound toggle WIP');

        }
    }
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
        state.loadState();
        //... and their event listeners
        let waiting = document.querySelector('#waiting');
        let watching = document.querySelector('#watching');
        let waitBrach = document.querySelector('#waiting-branch');
        let watchBrach = document.querySelector('#watching-branch');
        waiting.addEventListener('click', function(){
            waitBrach.style.display = "none";
            watchBrach.style.display = "inline";
            timer = setInterval(function(){
                var refresh_btn = document.querySelector('[data-qa-action-id="refresh-queue"]');
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
