const data = window.localStorage
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
class Dot{
    constructor(x,y,clicksLeft=2){
        this.x = x
        this.y = y
        this.clicksLeft = clicksLeft
        this.hover = false
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,3+this.clicksLeft*2,0,Math.PI*2,false)
        ctx.fill()
        if (this.hover==true){
            ctx.beginPath()
            ctx.arc(this.x,this.y,8+this.clicksLeft*2,0,Math.PI*2,false)
            ctx.stroke()
        }
    }
    onMove(e,t=puzzle.dotConnecter){
        let x = 0
        let y = 0
        if (e.type == 'mousemove'){
            x = e.pageX-10
            y = e.pageY-10
            t.mouseX = x
            t.mouseY = y
        }
        if (e.type == 'touchmove'){
            x = e.changedTouches[0].pageX-10
            y = e.changedTouches[0].pageY-10
            t.mouseX = x
            t.mouseY = y
        }
        const r = 8+this.clicksLeft*2
        if (this.clicksLeft>0 && x>=this.x-r && x<=this.x+r && y>=this.y-r && y<=this.y+r){
            if (t.startDot.length == 2 && (t.startDot[0] != this.x || t.startDot[1] != this.y) 
            && (t.previousDot[0] != this.x || t.previousDot[1] != this.y)){
                t.connectedDots.push([[t.startDot[0],t.startDot[1]],[this.x,this.y]])
                if (this.clicksLeft==2){
                    t.previousDot = t.startDot
                    t.startDot = [this.x,this.y]
                    this.clicksLeft -= 2
                }
                else{
                    t.startDot = []
                    this.clicksLeft -= 1
                }
            }
            else{
                this.hover = true
            }
        }
        else{
            this.hover = false
        }
    }
    onDown(e,t=puzzle.dotConnecter){
        let x = 0
        let y = 0
        if (e.type == 'mousedown'){
            x = e.pageX-10
            y = e.pageY-10
        }
        if (e.type == 'touchstart'){
            x = e.changedTouches[0].pageX-10
            y = e.changedTouches[0].pageY-10
        }
        const r = 8+this.clicksLeft*2
        if (this.clicksLeft>0 && x>=this.x-r && x<=this.x+r && y>=this.y-r && y<=this.y+r){
            this.clicksLeft -= 1
            t.startDot = [this.x,this.y]
        }
    }
}
class DotConnecter{
    constructor(){
        this.startDot = []
        this.previousDot = []
        this.connectedDots = []
        this.mouseX = 0
        this.mouseY = 0
    }
    drawLines(){
        if (this.startDot != []){
            ctx.beginPath()
            ctx.moveTo(this.startDot[0],this.startDot[1])
            ctx.lineTo(this.mouseX,this.mouseY)
            ctx.stroke()
        }
        for (let i=0; i<this.connectedDots.length; i++){
            ctx.beginPath()
            ctx.moveTo(this.connectedDots[i][0][0],this.connectedDots[i][0][1])
            ctx.lineTo(this.connectedDots[i][1][0],this.connectedDots[i][1][1])
            ctx.stroke()
        }
    }
    onUp(e,t=lvls[lvl]){
        if (this.startDot != [] && (e.type == 'mouseup' || e.type == 'touchend')){
            try{
                t.find(dot => dot.x == this.startDot[0] && dot.y == this.startDot[1]).clicksLeft += 1
                this.startDot = []
            }
            catch{}
        }
    }
}
class Puzzle{
    constructor(){
        this.dots = lvls[lvl]
        this.dotConnecter = new DotConnecter()
        this.solution = new DotConnecter()
        this.time = JSON.parse(data.getItem('time'))
        if(this.time == null){
            this.time = 0
            data.setItem('time',0)
        }
        for (let i=0; i<this.dots.length; i++){
            if (i<this.dots.length-1){
                this.solution.connectedDots.push([[this.dots[i].x+700,this.dots[i].y],[this.dots[i+1].x+700,this.dots[i+1].y]])
            }
            else{
                this.solution.connectedDots.push([[this.dots[i].x+700,this.dots[i].y],[this.dots[0].x+700,this.dots[0].y]])
            }
        }
    }
    drawSolution(){
        this.solution.drawLines()
    }
    drawDots(){
        for (let i=0; i<lvls[lvl].length; i++){
            lvls[lvl][i].draw()
        }
        this.dotConnecter.drawLines()
    }
    checkIfCompleted(){
        let connectedDots = 0
        for (let i=0; i<this.dotConnecter.connectedDots.length; i++){
            let l = this.dotConnecter.connectedDots[i]
            if(this.solution.connectedDots.find(L => L[0][0] == l[0][0]+700 && L[1][0] == l[1][0]+700 && l[0][1] == L[0][1] && L[1][1] == l[1][1])){
                connectedDots += 1
            }
            else if(this.solution.connectedDots.find(L => L[0][0] == l[1][0]+700 && L[1][0] == l[0][0]+700 && L[1][1] == l[0][1] && L[0][1] == l[1][1])){
                connectedDots += 1
            }
        }
        if (connectedDots == this.solution.connectedDots.length){
            const minutes = Math.floor(this.time/60)
            const seconds = Math.floor(this.time-minutes*60)
            if (lvl<lvls.length-1){
                lvl += 1
                data.setItem('lvl',lvl)
            }
            alert('You beat the level!\nTime: '+minutes+' minutes and '+seconds+' seconds')
            this.dots = lvls[lvl]
            this.dotConnecter = new DotConnecter()
            this.solution = new DotConnecter()
            this.time = 0
            data.setItem('time',0)
            for (let i=0; i<this.dots.length; i++){
                if (i<this.dots.length-1){
                    this.solution.connectedDots.push([[this.dots[i].x+700,this.dots[i].y],[this.dots[i+1].x+700,this.dots[i+1].y]])
                }
                else{
                    this.solution.connectedDots.push([[this.dots[i].x+700,this.dots[i].y],[this.dots[0].x+700,this.dots[0].y]])
                }
            }
        }
    }
}
class Button{
    constructor(x,y,text,fn){
        this.x = x
        this.y = y
        this.text = text
        this.fn = fn
        ctx.font = '24px Arial'
        this.txtWidth = ctx.measureText(text).width
        if (this.txtWidth>=115){
            this.width = this.txtWidth+10
        }
        else{
            this.width = 125
        }
    }
    draw(){
        ctx.fillStyle = '#0000ff'
        ctx.fillRect(this.x-(this.width-125)/2,this.y,this.width,40)
        ctx.fillStyle = '#000000'
        ctx.fillText(this.text,this.x+62.5-this.txtWidth/2,this.y+28)
    }
    wasClicked(x,y){
        if (x>=this.x-(this.width-125)/2 && x<=this.x+this.width-(this.width-125)/2 && y>=this.y && y<=this.y+40){
            this.fn()
        }
    }
}
const buttons = [new Button(10,750,'Undo',function(){
    const l = puzzle.dotConnecter.connectedDots
    let dots = puzzle.dots.filter(dot => (dot.x == l[l.length-1][0][0] && dot.y == l[l.length-1][0][1]) || (dot.x == l[l.length-1][1][0] && dot.y == l[l.length-1][1][1]))
    dots[0].clicksLeft += 1
    dots[1].clicksLeft += 1
    l.splice(l.length-1,1)
}), 
new Button(560,750,'Restart',function(){location.reload()}),
new Button(987.5,750,'Make Your Own Puzzle!',function(){
    playing = false
})]
const backButton = new Button(987.5,750,'Back to playing',function(){playing=true})
let lvl = JSON.parse(data.getItem('lvl'))
if (lvl == null){
    lvl = 0
    data.setItem('lvl',0)
}
const lvls = [[new Dot(350,100), new Dot(100,550), new Dot(600,550)], // 0
[new Dot(100,100), new Dot(400,100), new Dot(400,400), new Dot(100,400)], // 1
[new Dot(350,100), new Dot(500,500), new Dot(125,225), new Dot(575,225), new Dot(200,500)], // 2
]
const puzzle = new Puzzle()
function down(e){
    let x = 0
    let y = 0
    if (e.type == 'mousedown'){
        x = e.pageX-10
        y = e.pageY-10
    }
    if (e.type == 'touchstart'){
        x = e.changedTouches[0].pageX-10
        y = e.changedTouches[0].pageY-10
    }
    if(playing==true){
        for (let i=0; i<lvls[lvl].length; i++){
            lvls[lvl][i].onDown(e)
        }
        buttons.find(b => b.wasClicked(x,y))
    }
    else{
        backButton.wasClicked(x,y)
    }
}
function up(e){
    if(playing==true){puzzle.dotConnecter.onUp(e)}
}
function move(e){
    if(playing==true){
        for (let i=0; i<lvls[lvl].length; i++){
            lvls[lvl][i].onMove(e)
        }
    }
}
window.addEventListener('mousedown',function(e){down(e)})
window.addEventListener('mouseup',function(e){up(e)})
window.addEventListener('mousemove',function(e){move(e)})
window.addEventListener('touchstart',function(e){down(e)})
window.addEventListener('touchmove',function(e){move(e)})
window.addEventListener('touchend',function(e){up(e)})
let playing = true
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,1400,800)
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(700,0)
    ctx.lineTo(700,800)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.lineWidth = 2
    if (playing == true){
        puzzle.drawDots()
        puzzle.drawSolution()
        for (let i=0; i<buttons.length; i++){
            buttons[i].draw()
        }
    }
    else{
        backButton.draw()
    }
    requestAnimationFrame(mainLoop)
}
setInterval(() => {
    puzzle.checkIfCompleted()
    puzzle.time += 1
    data.setItem('time',puzzle.time)
},1000)
mainLoop()
export {Button,Dot,DotConnecter,ctx,playing}