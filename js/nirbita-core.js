// =====================================================
// NIRBITA CORE ENGINE v0.2
// Nexus Intelligence Risk Based Territorial Analysis
// DTSEN Desil Intelligence
// =====================================================


import { db } from "./firebase.js";


import {

collection,
onSnapshot,
query,
orderBy

}

from

"https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";





// =====================================================
// GLOBAL DATA
// =====================================================


let wilayahData = [];

let riskChart = null;





// =====================================================
// NIRBITA ANALYTIC ENGINE
// =====================================================


function calculateNirbita(data){


    const desil = data.desil || [];


    const d1 = Number(desil[0] || 0);

    const d2 = Number(desil[1] || 0);



    // Total seluruh KK desil 1-10

    const totalKK = desil.reduce(

        (total,value)=>
        total + Number(value || 0),

        0

    );



    if(totalKK===0){

        return {

            score:0,

            status:"Tidak Ada Data",

            d1,

            d2,

            totalKK:0,

            percentage:0

        };

    }




    // =========================================
    // Persentase kemiskinan ekstrem + miskin
    // =========================================


    const vulnerablePercent =

    ((d1+d2)/totalKK)*100;




    // =========================================
    // Base Score
    // =========================================


    let score =

    (

        ((d1/totalKK)*60)

        +

        ((d2/totalKK)*30)

    );





    let status;

    let level;





    // =========================================
    // PRIORITAS BERDASARKAN JUMLAH D1
    // =========================================


    if(d1 > 300){


        score +=10;

        status="Prioritas Tinggi";

        level="HIGH";


    }


    else if(d1 > 200){


        score +=7;

        status="Prioritas Sedang";

        level="MEDIUM";


    }


    else{


        score +=3;

        status="Prioritas Rendah";

        level="LOW";


    }





    return {


        score:Math.round(score),


        status,


        level,


        d1,


        d2,


        totalKK,


        vulnerablePercent:

        vulnerablePercent.toFixed(2)



    };



}







// =====================================================
// LOAD FIREBASE
// =====================================================


function loadNirbita(){


const q = query(

    collection(
        db,
        "wilayah_desa"
    ),

    orderBy(
        "periode.tahun",
        "desc"
    )

);



onSnapshot(q,(snapshot)=>{


    wilayahData=[];



    snapshot.forEach(doc=>{


        let item = doc.data();



        let analysis =

        calculateNirbita(item);



        wilayahData.push({


            id:doc.id,


            ...item,


            nirbita:analysis


        });



    });



    renderDashboard();



},


(error)=>{


console.error(

"NIRBITA FIREBASE ERROR",

error

);


});



}









// =====================================================
// DASHBOARD STATISTIC
// =====================================================


function renderDashboard(){



if(wilayahData.length===0)

return;




// Total wilayah


document.getElementById(
"totalWilayah"
).innerHTML =

wilayahData.length;






// Average score


let average =

wilayahData.reduce(

(a,b)=>

a+b.nirbita.score,

0

)/wilayahData.length;




document.getElementById(
"avgScore"
).innerHTML =

Math.round(average);








// Prioritas tinggi


let high =

wilayahData.filter(

x=>

x.nirbita.level==="HIGH"

).length;





document.getElementById(
"priority"
).innerHTML=

high;





renderRanking();


renderChart();



}








// =====================================================
// RANKING PRIORITAS
// =====================================================


function renderRanking(){



let table =

document.getElementById(
"rankingTable"
);



if(!table)

return;





let ranking =

[...wilayahData]


.sort(

(a,b)=>

b.nirbita.score -

a.nirbita.score

)


.slice(0,15);





let html="";



ranking.forEach((desa,index)=>{



let badge="bg-success";



if(
desa.nirbita.level==="HIGH"
)

badge="bg-danger";



else if(
desa.nirbita.level==="MEDIUM"
)

badge="bg-warning";




html +=`


<tr>


<td>

${index+1}

</td>



<td>

<strong>

${desa.nama || "Tanpa Nama"}

</strong>


<br>


<small>

D1:
${desa.nirbita.d1}

KK

|

D2:
${desa.nirbita.d2}

KK

</small>


</td>



<td>


<span class="badge ${badge}">

${desa.nirbita.status}

</span>


<br>


Score:

${desa.nirbita.score}



</td>


</tr>


`;



});




table.innerHTML=html;



}










// =====================================================
// RISK CHART
// =====================================================


function renderChart(){



let high =

wilayahData.filter(

x=>x.nirbita.level==="HIGH"

).length;



let medium =

wilayahData.filter(

x=>x.nirbita.level==="MEDIUM"

).length;



let low =

wilayahData.filter(

x=>x.nirbita.level==="LOW"

).length;





const canvas =

document.getElementById(
"riskChart"
);



if(!canvas)

return;




if(riskChart)

{

riskChart.destroy();

}




riskChart = new Chart(

canvas,

{


type:"doughnut",


data:{


labels:[

"Prioritas Tinggi",

"Prioritas Sedang",

"Prioritas Rendah"

],


datasets:[{


data:[

high,

medium,

low

]


}]


},



options:{


responsive:true,


plugins:{


legend:{


position:"bottom"


}


}



}



}



);



}









// =====================================================
// EXPORT DATA GLOBAL
// =====================================================


window.NIRBITA={


getData(){

return wilayahData;

},


calculateNirbita


};







// START ENGINE

loadNirbita();
