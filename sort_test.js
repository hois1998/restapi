//let resultarr = new Array("lec.ddd_20210110", "lec.ddd_20210109", "lec.ddd_20210111", "lec.ddd_20210130");
let lec_id_arr = new Array();
let lec_id_date_arr = new Array();

//let resultarr = process.argv[2];

function delay() {
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve();
    },100)
  })
}

async function test(resultarr) {

    for(let k=0; k<(resultarr.length-5)/2; k++){
        await delay();
        lec_id_arr[k] = resultarr[2*k+5];
        lec_id_date_arr[k] = resultarr[2*k+5].substr(resultarr[2*k+5].indexOf("_") + 1);       
    }

    /*lec_id_arr[0] = resultarr[0];
    lec_id_arr[1] = resultarr[1];
    lec_id_arr[2] = resultarr[2];
    lec_id_arr[3] = resultarr[3];
    lec_id_arr[4] = resultarr[14];
    lec_id_arr[5] = resultarr[16];
    lec_id_arr[6] = resultarr[18];
    lec_id_arr[7] = resultarr[20];
    

    lec_id_date_arr[0] = resultarr[0].substr(resultarr[6].indexOf("_") + 1);
    lec_id_date_arr[1] = resultarr[1].substr(resultarr[8].indexOf("_") + 1);
    lec_id_date_arr[2] = resultarr[2].substr(resultarr[10].indexOf("_") + 1);
    lec_id_date_arr[3] = resultarr[3].substr(resultarr[12].indexOf("_") + 1);
    lec_id_date_arr[4] = resultarr[14].substr(resultarr[14].indexOf("_") + 1);
    lec_id_date_arr[5] = resultarr[16].substr(resultarr[16].indexOf("_") + 1);
    lec_id_date_arr[6] = resultarr[18].substr(resultarr[18].indexOf("_") + 1);
    lec_id_date_arr[7] = resultarr[20].substr(resultarr[20].indexOf("_") + 1);*/
    setTimeout(function(){
    for(let i=0; i< lec_id_arr.length; i++){
        for(let j=i+1; j<lec_id_arr.length; j++){
            //await delay();           
            if(parseInt(lec_id_date_arr[i])>parseInt(lec_id_date_arr[j])){
                let temp=lec_id_arr[i];
                lec_id_arr[i] = lec_id_arr[j];
                lec_id_arr[j] = temp;
            }
            //await delay(); 
        }
      
    }
    }, 10);
    setTimeout(function(){
        console.log(lec_id_arr);
        return lec_id_arr;
    }, 100);
}

//test(resultarr);
module.exports.test = test;
