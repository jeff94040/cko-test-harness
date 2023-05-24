const pan_prefix = document.querySelector('#pan-prefix');
const pan_length = document.querySelector('#pan-length');
const num_pans = document.querySelector('#num-pans');
const button = document.querySelector('#generate-pans-button');
const pans_div = document.querySelector('#pans-div');

var luhnChk = (function (arr) {
  return function (ccNum) {
    var 
    len = ccNum.length,
    bit = 1,
    sum = 0,
    val;
    
    while (len) {
      val = parseInt(ccNum.charAt(--len), 10);
      sum += (bit ^= 1) ? arr[val] : val;
    }
    
    return sum && sum % 10 === 0;
  };
}([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]));

function generate_pans(){

  pans_div.innerHTML = '';

  for(let a=0; a < num_pans.value; a++){
    var pan = pan_prefix.value;
    for(let i = pan_prefix.value.length; i < pan_length.value; i++){
      pan += Math.floor(Math.random() * 10);
    }
    if(luhnChk(pan)){
      pans_div.innerHTML += pan + '<br>';
    }
    else{
      a--;
    }
  }

}

button.addEventListener('click', () => {
  generate_pans();
});