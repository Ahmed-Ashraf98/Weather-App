// !============================== Nabvbar Control ==============================

/*
- When user re-size the window without clicking on the toggole button to close the menu
*/

function forceClosingCollabsedNav(){
    togglerBtn.classList.add("collapsed");
    collabseNavbar.classList.remove("collapse","navbar-collapse","Show");
    collabseNavbar.classList.add("d-none");

}

function forceEnablingCollabsedNav(){
    collabseNavbar.classList.remove("d-none");
    collabseNavbar.classList.add("collapse","navbar-collapse");
}

window.onload = function(){
    let currentWidth = window.innerWidth;
    if(currentWidth > 991){
        forceClosingCollabsedNav();
    }else{
        forceEnablingCollabsedNav();
    }
}

window.onresize = function() {         
    
    let currentWidth = window.innerWidth;
    if(currentWidth > 991){
        forceClosingCollabsedNav();
    }else{
        forceEnablingCollabsedNav();
    }

};