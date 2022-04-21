import {Button,Dot,DotConnecter,ctx,playing} from './puzzleSolver.js'
const buttons = [new Button(1265,10,'Undo Dot',function(){
    dots.splice(dots.length-1,1)
}),
new Button(1265,110,'Undo Line',function(){
    let l = dotConnecter.connectedDots
    let Dots = dots.filter(dot => (dot.x == l[l.length-1][0][0] && dot.y == l[l.length-1][0][1]) || (dot.x == l[l.length-1][1][0] && dot.y == l[l.length-1][1][1]))
    Dots[0].clicksLeft += 1
    Dots[1].clicksLeft += 1
    dotConnecter.connectedDots.splice(dotConnecter.connectedDots.length-1,1)
})
, new Button(1265,210,'Clear',function(){
    dots.splice(0,dots.length)
    dotConnecter.connectedDots = []
}),
new Button(987.5,650,'Submit puzzle!',function(){
    let finished = true
    for (let i=0; i<dots.length; i++){
        if (dots[i].clicksLeft != 0){
            finished = false
        }
    }
    if (finished == true){
        let st = dotConnecter.connectedDots[0][0]
        let dotText = 'dots = ['+'new Dot('+st[0]+','+st[1]+',2),'
        st = dotConnecter.connectedDots[0][1]
        dotText += 'new Dot('+st[0]+','+st[1]+',2),'
        console.log(st)
        for (let i=0; i<dotConnecter.connectedDots.length-1; i++){
            let dot = dotConnecter.connectedDots.find(d => d[0][0] == st[0] && d[0][1] == st[1])
            console.log(dot)
            if (dot != undefined){
                dotText += 'new Dot('+dot[0][0]+','+dot[0][1]+',2),'
                st = dot[1]
            }   
        }
        dotText = dotText.slice(0,dotText.length-1)
        dotText += ']'
        Email.send({
            Host: "smtp.gmail.com",
            Username: "aidan@pincin.com",
            Password: "mynewcomputer",
            To: 'aidan@pincin.com',
            From: "aidanpincin@gmail.com",
            Subject: "Puzzle Submission",
            Body: ""+dotText,
        })
        .then(function (message) {
            alert("Puzzle submitted successfully!")
        });
    }
    else{
        alert('You did not connect all your dots!\nLook for dots that are slightly bigger than others')
    }
})]
let equipped = undefined
class EquipButton{
    constructor(x,y,txt,fn){
        this.x = x
        this.width = 200
        this.height = 200
        this.y = y
        this.txt = txt
        ctx.font = '36px Arial'
        this.txtWidth = ctx.measureText(txt).width
        ctx.font = '24px Arial'
        this.equipped = false
        this.fn = fn
    }
    draw(){
        if (this.equipped == true){
            ctx.fillStyle = '#90ee90'
            ctx.fillRect(this.x,this.y,this.width,this.height)
            ctx.fillStyle = '#000000'
        }
        ctx.lineWidth = 5
        ctx.strokeRect(this.x,this.y,this.width,this.height)
        ctx.lineWidth = 2
        ctx.font = '36px Arial'
        ctx.fillText(this.txt,this.x+this.width/2-this.txtWidth/2,this.y+36)
        ctx.font = '24px Arial'
        this.fn()
    }
    wasClicked(x,y){
        if(x>=this.x && x<=this.x+this.width && y>=this.y && y<this.y+this.height){
            let old = equipButtons.find(b => b.equipped == true)
            if(old!=undefined){
                old.equipped = false
            }
            this.equipped = true
            equipped = this.txt
        }
    }
}
const equipButtons = [new EquipButton(710,10,'Dot',function(){
    ctx.beginPath()
    ctx.arc(810,110,10,0,Math.PI*2,false)
    ctx.fill()
}), new EquipButton(710,220,'Line',function(){
    ctx.beginPath()
    ctx.arc(730,400,5,0,Math.PI*2,false)
    ctx.arc(890,240,5,0,Math.PI*2,false)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(730,400)
    ctx.lineTo(890,240)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.lineWidth = 2
})]
const dots = []
const dotConnecter = new DotConnecter()
function mainLoop(){
    if (playing == false){
        for (let i=0; i<buttons.length; i++){
            buttons[i].draw()
        }
        for (let i=0; i<equipButtons.length; i++){
            equipButtons[i].draw()
        }
        for (let i=0; i<dots.length; i++){
            dots[i].draw()
        }
        dotConnecter.drawLines()
    }
    requestAnimationFrame(mainLoop)
}
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
    if (playing == false){
        buttons.find(b => b.wasClicked(x,y))
        equipButtons.find(b => b.wasClicked(x,y))
        if (x<700){
            if(equipped == 'Dot'){
                let toClose = dots.find(d => x>=d.x-15 && x<=d.x+15 && y>=d.y-15 && y<=d.y+15)
                if (toClose == undefined){
                    dots.push(new Dot(Math.round(x),Math.round(y),2))
                }
            }
            if (equipped == 'Line'){
                dots.find(d => d.onDown(e,dotConnecter))
            }
        }
    }
}
function move(e){
    let x = 0
    let y = 0
    if (e.type == 'mousemove'){
        x = e.pageX-10
        y = e.pageY-10
    }
    if (e.type == 'touchmove'){
        x = e.changedTouches[0].pageX-10
        y = e.changedTouches[0].pageY-10
    }
    if (playing == false && equipped == 'Line'){
        dots.find(d => d.onMove(e,dotConnecter))
        dotConnecter.mouseX = x
        dotConnecter.mouseY = y
    }
}
function up(e){
    if (playing == false && equipped == 'Line'){
        dotConnecter.onUp(e,dots)
    }
}
window.addEventListener('mousedown',function(e){down(e)})
window.addEventListener('mouseup',function(e){up(e)})
window.addEventListener('mousemove',function(e){move(e)})
window.addEventListener('touchstart',function(e){down(e)})
window.addEventListener('touchmove',function(e){move(e)})
window.addEventListener('touchend',function(e){up(e)})
mainLoop()