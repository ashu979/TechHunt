const threedot = document.querySelectorAll(".fa-ellipsis-v");
const unenroll = document.querySelectorAll(".unenroll");
for(let i=0; i < unenroll.length; ++i){   //  var m undefined ho jayega neche so using let
  threedot[i].addEventListener("click",(e)=>{
    e.preventDefault();
    console.log("three dots");
    // console.log(unenroll[i]);
    unenroll[i].classList.toggle("appear");
  });
unenroll[i].addEventListener("click", (e) => {
  e.preventDefault();
  console.log('Clicked');
  const subj = e.path[2].firstElementChild.innerText;
  const url = `/classroom/deleteroom/${subj}`;
  axios.get(url)
  .then(window.alert('Unenrolled from class successfully! Please refresh the page'));
});
}

const dropdown = document.querySelector('.fa-caret-down');
const dropdowncontent = document.querySelector('.dropdowncontent');
dropdown.addEventListener("click",(e)=>{
  e.preventDefault();
  dropdowncontent.classList.toggle("appear");
})