window.resizeTo(0, 0);
onload = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let audio = new Audio(urlParams.get('src'));
    audio.volume = urlParams.get('volume');
    audio.play();
    setTimeout(()=>{
        close();
    }, urlParams.get('length'));
}