![AskAssist](./screenshot-AskAssist.png)

---
AskAssist is a small chrome plugin to complement the AskBCS slack application
and comes with the following features...

**Automated Refresh:** The user may define a number of seconds to wait between refreshes.  When the elapsed time has completed the plugin will simulate the clicking of the refresh button within the AskBCS Application.

**Sound Alerts:**  Whenever a new question is available ( tested by the presence of 'available questions' in the html ), AskAssist will play an alert sound. The user can toggle between several sound options as well as set the volume and frequency of the alert.  
 

## Installation
This is an unpacked work in progress.  To install the plugin enable developer mode in the upper right hand corner of `chrome://extensions` and then 'load unpacked' on the left. Once you have loaded the AskAssist folder the plugin will be ready to use. 

## Usage
![screenshot 'waiting'](./screenshot-waiting.png)
When the user opens the page the automated refresh will be turned off. Clicking the word "waiting" on the right will begin the script and reveal the options.

![screenshot 'watching'](./screenshot-watching.png)
When the script is running its refresh the following options may be adjusted...

### Clickables...
**watching:** toggles the script back off.

**alert:** will cycle through available sound files.

**volume**: will cycle through volume settings. This button is represented by the 5 vertical bars to the right of the AskAssist logo.


### Editables...
These options are content editable fields which accept only numbers up to 3 digits.

**refresh frequency:** determines the interval in seconds between refreshes.  

**alert frequency:** the maximum number of times per minute an alert will play. 

---

## Updating
If you have been using AskAssist and wish to update to the newest version simply use `git pull` and then reload the package in chrome.  There is a circular arrow in chrome extension management that reloads the package files.  After you have updated the plugin it is a good idea to clear your local storage as I currently have no validation for the settings and old settings on new versions may cause hiccups.

## Troubleshooting
Failure to append toolbar:  The plugin waits for the user to visit a "https://app.slack.com/client/TLXH0JYKB/*" url and then appends the toolbar to the page.  On occasion the AskBCS application continues to load after the window's 'load' event has fired and the toolbar may fail to append.  If this happens a simple refresh should fix the issue. 

