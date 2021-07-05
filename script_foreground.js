let state = {
    "alert-frequency":1,
    "sound-select":"beep beep",
    "watch-frequency": 5,
    "volume": 1,
    alertList: [],
    loadState: function(){
        if(JSON.parse(localStorage.getItem('config'))){
            saveData=JSON.parse(localStorage.getItem('config'))
            console.log('loading::: ', saveData);
            state["sound-select"] = saveData["sound-select"] || "beep beep"
            state["alert-frequency"] = saveData["alert-frequency"] || "1"
            state["watch-frequency"] = saveData["watch-frequency"] || "5"
            state["volume"] = saveData["volume"] || "1"
        } 
        this.render["sound-select"]();
        this.render.fields();
        this.render.volume();
    },
    
    set: function(property, value){
        if(property in state){
            console.log('state setting ', property, ' to ', value)
            state[property] = value;
            console.log("::",state[property])
            let saveData = {
                "alert-frequency":state["alert-frequency"],
                "sound-select":state["sound-select"],
                "watch-frequency": state["watch-frequency"],
                "volume": state["volume"]
            }
            console.log('saving settings ', saveData)
            localStorage.setItem('config',JSON.stringify(saveData))
            if(property=="sound-select"){
                state.render["sound-select"]();
                sendAlert("skip frequency");
            };
            if(property=="volume"){state.render["volume"]()};
        } 
        else { 
            console.log (`error: ${property} is not a known configuration property`)
            console.log(state);
        }
    },

    render : {
        fields: function(){
            console.log('rendering editable fields');
            document.querySelectorAll("[isoption]").forEach(function(el){
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
        "alert-frequency": function(){this.fields()},
        "watch-frequency": function(){this.fields()},
        "sound-select": function(){
            console.log('rendering sound toggle')
            let alertContainer = document.querySelector('#alert-sounds');
            alertContainer.innerHTML = '';
            state.alertList.forEach(function({name}){
                console.log(`adding ${name} to soundToggle`)
                let alertEl = document.createElement('span')
                let alertState = (name==state["sound-select"]) ? "displayed-alert" : "hidden-alert";
                alertEl.innerHTML = name;
                alertEl.classList.add('ask-opt', alertState);
                alertEl.addEventListener('click', function(e){
                    let curAlert = e.target.innerHTML;
                    state.alertList.forEach(function(alert, i){
                        console.log(`(${alert.name} == ${curAlert}) : ${( alert.name == curAlert)}`);
                        if( alert.name == curAlert){
                            console.log(`i ${i} >= list length ${state.alertList.length} is ${i+1>=state.alertList.length}`)
                            if( i+1>=state.alertList.length ){
                                console.log("alert to 0")
                                state.set('sound-select', state.alertList[0].name)
                            } else {
                                console.log("alert to", i+2)
                                state.set('sound-select', state.alertList[i+1].name)
                            }   
                        }
                    })
                })
                alertContainer.append(alertEl);
            })    
        }, 
        "volume":function(){
            console.log('rendering volume')
            let bars = document.querySelectorAll('#volume div');
            bars.forEach(function(bar, i){
                console.log(`i<=state.volume:: ${(i<=state.volume)}`)
                if(i<state.volume){
                    bar.style.opacity = 1;
                } else {
                    bar.style.opacity = 0.2;
                }
            })
        }
    }
}

function sendAlert(skipFrequency){
    let message = {
        message:{
        flag:"alert", options:{
            frequency:state["alert-frequency"], 
            sound: state["sound-select"], 
            volume: state["volume"]
        }
    }};
    if(skipFrequency){
        message.message.options.frequency = 1000;
    }
    console.log(`requesting alert ${message}`)
    chrome.runtime.sendMessage(message);
}

function appendTool(html){
    // fetch the list of possible alerts from the background script
    chrome.runtime.sendMessage(
        {message:
            {flag:"alertList"}
        }, function(res){
            state.alertList = res;
            console.log('alert list fetched from background');
    })
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
        let volume = document.querySelector('#volume');
        waiting.addEventListener('click', function(){
            waitBrach.style.display = "none";
            watchBrach.style.display = "inline";
            timer = setInterval(function(){
                let refresh_btn = document.querySelector('[data-qa-action-id="refresh-queue"]');
                if(newQuestion()){
                    sendAlert();
                };
                refresh_btn.click();
            }, state["watch-frequency"]*1000);
            return timer;
        });
        watching.addEventListener('click', function(){
            waitBrach.style.display = "inline";
            watchBrach.style.display = "none";
            clearInterval(timer);   
        });
        volume.addEventListener('click', function(e){
            if(state['volume']>=5){
                state.set('volume', 0);
            } else {
                state.set('volume', state['volume']+1);
            }  
        })
        document.querySelectorAll("[isoption]").forEach(function(el){
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
    });
};

function newQuestion(){
    console.log('searching for new question...')
    const match = /(AVAILABLE QUESTIONS|IN CLASS ACTIVITY QUESTIONS)/
    const search = document.body.innerHTML.search(match);
    if(search!==-1){
        return true;
    } else {
        return false
    } 
}


window.addEventListener('load', appendTool);
