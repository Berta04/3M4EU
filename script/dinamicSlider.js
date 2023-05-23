let countriesItems = document.querySelectorAll(".slider");
let iframe = document.querySelector(".video");

let debounce = false;
let cooldown = 350;

countriesItems[0].classList.add("active");
iframe.src = countriesItems[0].getAttribute("id");

document.querySelector(".indicatorRight").addEventListener("click", () => {
  if (!debounce){
    let activeItem = document.querySelector(".country.active");
    let index;
    for(let i = 0; i < countriesItems.length; i++) {
        console.log(i);
        if(countriesItems[i].className == activeItem.className) {
            index = i;
            if (i < 5) {
                countriesItems[i].classList.remove("active");
            }
            break;
        }
    }
    if (index < 5) {
        countriesItems[index+1].classList.add("active");
        iframe.src = countriesItems[index+1].getAttribute("id");
        document.querySelector(".countryContainer").style.left = parseInt(getLeft()) - 300 + "px";
        debounce = true;
        setTimeout(function() {
          debounce = false;
        }, cooldown);
    }
  }
})


document.querySelector(".indicatorLeft").addEventListener("click", () => {
  if (!debounce){
    let activeItem = document.querySelector(".country.active");
    let index;
    for(let i = 0; i < countriesItems.length; i++) {
        console.log(i);
        if(countriesItems[i].className == activeItem.className) {
            index = i;
            if (i > 0) {
                countriesItems[i].classList.remove("active");
            }
            break;
        }
    }
    if (index > 0) {
        countriesItems[index-1].classList.add("active");
        iframe.src = countriesItems[index-1].getAttribute("id");
        document.querySelector(".countryContainer").style.left = parseInt(getLeft()) + 300 + "px";
        debounce = true;
        setTimeout(function() {
          debounce = false;
        }, cooldown);
    }
  }
})



let getLeft = () => {
    return window.getComputedStyle(document.querySelector(".countryContainer"),null).getPropertyValue("left");
}