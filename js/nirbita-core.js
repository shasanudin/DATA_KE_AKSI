import {
db
}
from "./firebase.js";


import {

collection,
onSnapshot,
query,
orderBy

}

from

"https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";





let wilayah=[];




// =============================
// NIRBITA SCORE ENGINE
// =============================


function nirbitaScore(data){


let d1 =
data.desil?.[0] || 0;


let d2 =
data.desil?.[1] || 0;


let pengaduan =
data.layanan?.pengaduan || 0;



let konsultasi =
data.konsultasi_bulan_lalu || 0;



let score =

(
(d1*0.45)
+
(d2*0.25)
+
(pengaduan*0.10)
+
((50-konsultasi)*0.20)

);



return Math.min(
100,
Math.round(score)
);


}






// =============================
// LOAD FIREBASE
// =============================


function loadData(){


const q=

query(

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


wilayah=[];



snapshot.forEach(doc=>{


let d=doc.data();


d.score=
nirbitaScore(d);



wilayah.push(d);


});



renderDashboard();



});


}






// =============================
// DASHBOARD
// =============================


function renderDashboard(){



document.getElementById(
"totalWilayah"
).innerHTML=

wilayah.length;




let avg=

Math.round(

wilayah.reduce(
(a,b)=>a+b.score,
0
)
/wilayah.length

);



document.getElementById(
"avgScore"
).innerHTML=

avg;




let priority=

wilayah.filter(

x=>x.score>=70

).length;



document.getElementById(
"priority"
).innerHTML=

priority;



renderRanking();


renderChart();


}







function renderRanking(){



let data=

[...wilayah]

.sort(
(a,b)=>b.score-a.score
)

.slice(0,10);



let html="";



data.forEach(x=>{


html+=`

<tr>

<td>

${x.nama}

</td>


<td>

<span class="badge bg-danger">

${x.score}

</span>


</td>


</tr>

`;


});



document.getElementById(
"rankingTable"
).innerHTML=html;


}







function renderChart(){


let high=

wilayah.filter(
x=>x.score>=70
).length;



let medium=

wilayah.filter(
x=>x.score>=40 &&
x.score<70
).length;



let low=

wilayah.filter(
x=>x.score<40
).length;




new Chart(

document.getElementById(
"riskChart"
),

{


type:"doughnut",


data:{


labels:[

"Tinggi",
"Sedang",
"Rendah"

],


datasets:[{


data:[

high,
medium,
low

]


}]


}



}

);


}







loadData();
