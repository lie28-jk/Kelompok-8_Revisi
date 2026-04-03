const h = 6.626e-34
const scaleFactor = 200

const massSlider = document.getElementById("massSlider")
const velocitySlider = document.getElementById("velocitySlider")
const massInput = document.getElementById("massInput")

const massValue = document.getElementById("massValue")
const velocityValue = document.getElementById("velocityValue")

const momentumValue = document.getElementById("momentumValue")
const lambdaValue = document.getElementById("lambdaValue")

const particleSelect = document.getElementById("particleSelect")

const playBtn = document.getElementById("playBtn")
const pauseBtn = document.getElementById("pauseBtn")
const resetBtn = document.getElementById("resetBtn")
const compareBtn = document.getElementById("compareBtn")

const canvas = document.getElementById("waveCanvas")
const ctx = canvas.getContext("2d")

function resizeCanvas(){
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
}

window.addEventListener("resize",resizeCanvas)
resizeCanvas()

let animationRunning = true
let phase = 0

let particleX = 0
let compareMode = false

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

function playClick(){
const osc = audioCtx.createOscillator()
const gain = audioCtx.createGain()

osc.connect(gain)
gain.connect(audioCtx.destination)

osc.frequency.value = 600
gain.gain.value = 0.05

osc.start()
osc.stop(audioCtx.currentTime + 0.05)
}

const chartCtx = document.getElementById("lambdaChart").getContext("2d")

const lambdaChart = new Chart(chartCtx,{
type:"line",
data:{
labels:[],
datasets:[
{
label:"Kurva λ = h/p",
data:[],
borderWidth:2,
pointRadius:0,
tension:0.35
},
{
label:"Momentum saat ini",
data:[],
pointRadius:6,
showLine:false
}
]
},
options:{
animation:false,
responsive:true,
plugins:{
legend:{position:"top"}
},
scales:{
x:{title:{display:true,text:"Momentum (p)"}},
y:{title:{display:true,text:"Panjang Gelombang"}}
}
}
})

function calculate(){

let m = parseFloat(massSlider.value)
let v = parseFloat(velocitySlider.value)

let p = m * v
if(p === 0) p = 0.0001

let lambda = h / p
let lambdaVisual = scaleFactor / p

massValue.textContent = m.toFixed(2)
velocityValue.textContent = v
momentumValue.textContent = p.toExponential(3)
lambdaValue.textContent = lambda.toExponential(3)

updateChart(p,lambdaVisual)

return lambdaVisual
}

function updateChart(currentP,currentLambda){

let labels=[]
let curveData=[]

for(let p=0.1;p<=100;p+=1){
labels.push(p.toFixed(1))
curveData.push(scaleFactor/p)
}

lambdaChart.data.labels = labels
lambdaChart.data.datasets[0].data = curveData

lambdaChart.data.datasets[1].data = [{
x:currentP,
y:currentLambda
}]

lambdaChart.update()
}

function drawGrid(){

let gridSize = 40

ctx.strokeStyle = "#e2e8f0"
ctx.lineWidth = 1

for(let x=0;x<canvas.width;x+=gridSize){
ctx.beginPath()
ctx.moveTo(x,0)
ctx.lineTo(x,canvas.height)
ctx.stroke()
}

for(let y=0;y<canvas.height;y+=gridSize){
ctx.beginPath()
ctx.moveTo(0,y)
ctx.lineTo(canvas.width,y)
ctx.stroke()
}
}

function drawWave(lambdaVisual){

ctx.clearRect(0,0,canvas.width,canvas.height)
drawGrid()

let amplitude = 50

ctx.beginPath()
ctx.strokeStyle = "#000"

for(let x=0;x<canvas.width;x++){
let y = canvas.height/2 + Math.sin((x*0.02/lambdaVisual)+phase)*amplitude
ctx.lineTo(x,y)
}

ctx.stroke()

particleX += 2

let particleY = canvas.height/2 + Math.sin((particleX*0.02/lambdaVisual)+phase)*amplitude

ctx.beginPath()
ctx.fillStyle = "black"
ctx.arc(particleX,particleY,8,0,Math.PI*2)
ctx.fill()

if(compareMode){
drawCompareWaves()
}
}

function drawCompareWaves(){

let v = parseFloat(velocitySlider.value)

// MASSA REALISTIS
let electronMass = 9.11e-31
let protonMass = 1.67e-27

let pE = electronMass * v
let pP = protonMass * v

// SUPAYA TERLIHAT (DINORMALISASI)
let lambdaE = 200 / pE
let lambdaP = 200 / pP

// AMPLITUDO
let ampE = 40
let ampP = 20

// KECEPATAN GERAK
let speedE = 1
let speedP = 4

// ELEKTRON (BIRU - GELOMBANG PANJANG)
ctx.strokeStyle = "#3b82f6"
ctx.beginPath()

for(let x=0;x<canvas.width;x++){
let y = canvas.height*0.3 + Math.sin((x*0.002/lambdaE)+phase)*ampE
ctx.lineTo(x,y)
}
ctx.stroke()

// PROTON (MERAH - GELOMBANG RAPAT)
ctx.strokeStyle = "#ef4444"
ctx.beginPath()

for(let x=0;x<canvas.width;x++){
let y = canvas.height*0.7 + Math.sin((x*0.02/lambdaP)+phase)*ampP
ctx.lineTo(x,y)
}
ctx.stroke()

// PARTIKEL ELEKTRON
let xE = (particleX * speedE) % canvas.width
let yE = canvas.height*0.3 + Math.sin((xE*0.002/lambdaE)+phase)*ampE

ctx.beginPath()
ctx.fillStyle = "#3b82f6"
ctx.arc(xE,yE,6,0,Math.PI*2)
ctx.fill()

// PARTIKEL PROTON
let xP = (particleX * speedP) % canvas.width
let yP = canvas.height*0.7 + Math.sin((xP*0.02/lambdaP)+phase)*ampP

ctx.beginPath()
ctx.fillStyle = "#ef4444"
ctx.arc(xP,yP,8,0,Math.PI*2)
ctx.fill()

// LABEL
ctx.fillStyle = "#3b82f6"
ctx.fillText("Elektron (λ besar)",10,20)

ctx.fillStyle = "#ef4444"
ctx.fillText("Proton (λ kecil)",10,canvas.height-10)
}

function animate(){

if(animationRunning){

let lambdaVisual = calculate()
drawWave(lambdaVisual)
phase += 0.05

}

requestAnimationFrame(animate)
}

particleSelect.addEventListener("change",function(){

if(this.value==="electron"){
massSlider.value = 0.000000000000000000000000000000911
}
else if(this.value==="proton"){
massSlider.value = 0.00000000000000000000000167
}
else if(this.value==="neutron"){
massSlider.value = 0.00000000000000000000000167
}

massInput.value = massSlider.value
calculate()

})

playBtn.addEventListener("click",()=>{
playClick()
animationRunning = true
})

pauseBtn.addEventListener("click",()=>{
playClick()
animationRunning = false
})

resetBtn.addEventListener("click",()=>{

playClick()

massSlider.value = 1
velocitySlider.value = 10
massInput.value = 1

particleSelect.value = "custom"

phase = 0
particleX = 0

calculate()

})

compareBtn.addEventListener("click",()=>{
playClick()
compareMode = !compareMode
})

calculate()
animate()
