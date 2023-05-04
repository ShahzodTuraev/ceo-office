import Engine from "./src/classes/Engine.js";
// import axios from "axios";

const engine = new Engine();
engine.Run();

const points = document.querySelectorAll(".point");
const submitEmail = document.querySelector("#SUBMIT_EMAIL");
const inputEmail = document.querySelector("#INPUT_EMAIL");
const inputPhone = document.querySelector("#INPUT_PHONE");
points.forEach((el) => {
  let path;
  switch(el.classList[1]) {
    case "point-0":
      path = "https://mever.me/main/story";
      break;
    case "point-1":
      path = "https://mever.me/main/form";
      break;
    case "point-2":
      path = "https://mever.me/main/page";
      break;
    case "point-3":
      path = "https://mever.me/PPT/includes/ART_GALLERY/";
      break;
  }
  el.addEventListener("click", () => {
    setTimeout(() => {location.href = path;},2000);
    //test
  });
});
  // pricing page option control by local storage:

let btn0 = document.querySelector('.point-0');
let btn1 = document.querySelector('.point-1');
let btn2 = document.querySelector('.point-2');

btn0.addEventListener('click', function() {
  localStorage.removeItem('option')
});
btn1.addEventListener('click', function() {
  localStorage.removeItem('option')
  localStorage.setItem('option', 'second')
});
btn2.addEventListener('click', function() {
  localStorage.removeItem('option')
});

const controlBox = document.querySelector('#CONTROL_BOX')
const alertEmail = document.querySelector('#ALERT_EMAIL')
const checkBox = document.querySelector('#CHECK_BOX')
const checked = document.querySelector('#CHECK_SIGN')
const footerBox = document.getElementById('FOOTER_BOX')
let isButtonClicked = false;
// CLICK CHECKBOX
checkBox.addEventListener('click', ()=>{
  if (checked.style.display === 'block') {
    checked.style.display = 'none';
  } else {
    checked.style.display = 'block';
  }
  isButtonClicked =! isButtonClicked
  console.log(isButtonClicked);
})

// CLICK THE SUBMIT BUTTON
submitEmail.addEventListener("click", () => {
  let email = inputEmail.value;
  let phone = inputPhone.value;
  let data = { email, phone };
console.log(phone);
    if(inputEmail.value.length > 4 && inputPhone.value.length > 9 && isButtonClicked){
      footerBox.classList.toggle("animation");
      setTimeout(() => {footerBox.style.display = 'none'}, 1998);
      setTimeout(() => {controlBox.style.display = "none"}, 1998);
      localStorage.setItem("mainEmail", email);
      localStorage.setItem("mainPhone", phone);

      fetch('https://api.mever.me:8080/insMember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error(error);
      });


  }else{
      alertEmail.textContent('hi')
  }
});

window.onload = function(){
  let w = window.innerWidth;
  let h = window.innerHeight;

  document.querySelector('body').style.width = w;
  document.querySelector('body').style.height = h;
  console.log(width, height);
}
