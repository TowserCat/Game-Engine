







const canvas = document.getElementById("canvas");
let context = canvas.getContext("2d"); 


let backroundColor = "#2f2f2f";
let color = colorMixRand();
let assetesLoaded = 0;
let numAssets = 21; 
let playerL1;
let playerL2;
let playerL3;
let playerL4;
let playerL5;
let playerR1;
let playerR2;
let playerR3;
let playerR4;
let playerR5;
let spikeImg;
let keyImg1;
let keyImg2;
let keyImg3;
let doorImg1;
let doorImg2;
let doorImg3;
let platformTopImg;
let platformImg;
let falsePlatformTopImg;
let falsePlatformImg;
let framerate = null;
let tickSpeed = null;
let walkingState = null;
let player;
let platforms = [];
let falsePlatforms = [];
let spike = [];
let keys = {}
let doors = {};
let gravity = 1;
let playerDead = false;
let initWorldlyShift = 0;
let worldlyShift = 0;
let invisBarrier = 2400;
let animation;
let nextLevel = true;
let currentLevel = 0;
let deathState = false;



class Platform {
    constructor(tempX, tempY, type){
        this.x = tempX;
        this.y = tempY;
        this.type = type;
    }
    checkWorldlyShift(){
        this.x += worldlyShift;
    }
    draw(context){
        context.drawImage(this.type, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
    }
}

class FalsePlatform {
    constructor(tempX, tempY, type){
        this.x = tempX;
        this.y = tempY;
        this.type = type;
    }
    checkWorldlyShift(){
        this.x += worldlyShift;
    }
    draw(context){
        context.drawImage(this.type, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
    }
}

class Door {
    constructor(tempX,tempY,tempDoorVarient,tempState){
        this.x = tempX;
        this.y = tempY;
        this.doorVarient = tempDoorVarient;
        this.unlocked = tempState;
        this.opened = tempState;
    }
    checkWorldlyShift(){
        this.x += worldlyShift;
    }
    draw(context){
        if(this.opened === false){
            context.drawImage(this.doorVarient, this.x, this.y, (scaleOfPlayer/13)*19, (scaleOfPlayer/14)*28);
        }else{
            context.save();
            context.translate(this.x, this.y);
            context.scale(-0.7, 1);
            context.drawImage(this.doorVarient, 0, 0, (scaleOfPlayer / 13) * 19, (scaleOfPlayer / 14) * 28);
            context.restore();
            context.fillStyle = "#000000";
            context.fillRect(this.x, this.y,(scaleOfPlayer / 13) * 19, (scaleOfPlayer / 14) * 28);
            context.fillStyle = "#101010";
            context.fillRect(this.x + (scaleOfPlayer / 13)*20 - (scaleOfPlayer / 13) * 19, this.y + (scaleOfPlayer / 13) * 20 - (scaleOfPlayer / 13) * 19,((scaleOfPlayer / 13) * 17), (scaleOfPlayer / 14) * 26);
        }
    }
}

class Key {
    constructor(tempX, tempY, tempKeyVarient){
        this.x = tempX;
        this.y = tempY;
        this.state = 1;
        this.keyVarient = tempKeyVarient;
        this.gained = false;
    }
    bounce(){
        if(this.state === 1){
            this.state = 0;
        }else{
            this.state = 1;
        }
    }
    checkWorldlyShift(){
        this.x += worldlyShift;
    }
    draw(context){
        if(this.gained === false){
            context.drawImage(this.keyVarient, this.x, this.y + (scaleOfPlayer/13) * this.state - scaleOfPlayer/3.5, (scaleOfPlayer/13)*19, (scaleOfPlayer/14)*28);
        }
    }
}

class Spike {
    constructor(tempX,tempY){
        this.x = tempX;
        this.y = tempY;
    }
    checkWorldlyShift(){
        this.x += worldlyShift;
    }
    draw(context){
        context.drawImage(spikeImg, this.x, this.y, ((scaleOfPlayer*(3/4))/13)*12, (scaleOfPlayer*(3/4)));
    }
}

class Player {
    constructor(tempX,tempY) {
        this.x = tempX;
        this.y = tempY;
        this.initX = tempX;
        this.initY = tempY;
        this.yAccel = 0;
        this.direction = "r";
        this.state = 1;
        this.onGround = false;
        this.bufferx = this.x - positionOnScreenX;
        this.initPositionOnScreenX = positionOnScreenX;
        this.onPlatformTop = false;
        this.onPlatformLeft = false;
        this.onPlatformRight = false;
        this.onPlatformBottom = false;
    }
    jump(){
        if(this.onGround === true){
            this.yAccel = -(scaleOfPlayer/10)*2;
            this.onGround = false;
        } 
    }
    pickUp(){
        this.state = 5;
    }
    left(){
        if(this.onPlatformLeft === false){
            positionOnScreenX -= scaleOfPlayer/5;
            this.x -= scaleOfPlayer/5;
        }
    }
    right(){
        if(this.onPlatformRight === false){
            positionOnScreenX += scaleOfPlayer/5;
            this.x += scaleOfPlayer/5;
        }
    }
    changeDir(dir){
        this.direction = dir;
    }
    changeState(state){
        this.state = state;
    }
    gravity(){
        if(this.onGround === false){
            this.y += this.yAccel;
            this.yAccel += gravity;
        }else{
            if(this.yAccel > 0){
                this.yAccel = 0;
            }
        }
    }
    getOnGround(){
        this.onGround = true;
    }
    getOffGround(){
        this.onGround = false;
    }
    checkSpikes(tempX,tempY){
        if(this.x - scaleOfPlayer*2/3 < tempX && this.x + scaleOfPlayer*3/4 > tempX && this.y > tempY*0.9){
            deathState = true;
            alert("You died!  Better luck next time!");
            this.y = -10000;
        }
    }
    checkKeys(tempX,tempY,key){
        if(this.x < tempX + scaleOfPlayer && this.x > tempX - scaleOfPlayer && this.y >= tempY && this.y <= tempY + scaleOfPlayer){
            if(this.state === 5){
                key.gained = true;
            }
        }
    }
    checkDoors(tempX,tempY,door){
        if(this.x - scaleOfPlayer < tempX && this.x + scaleOfPlayer*0.7 > tempX && this.y > tempY*0.9){
            if(this.state === 5 && keys.key1.gained === true){
                door.unlocked = true;
                door.opened = true;
                animation.animateState = animation.pi * 1/1000;
            }
        }
    }
    checkRightWall(){
        if(this.x > widthOfScreen - edgeBuffer * 2.5 && positionOnScreenX < invisBarrier - edgeBuffer * 2.5){
            let dx = this.x - (widthOfScreen - edgeBuffer * 2.5);
            this.x = widthOfScreen - edgeBuffer * 2.5;
            worldlyShift -= dx;
            initWorldlyShift -= dx;
        } else if(positionOnScreenX > invisBarrier - scaleOfPlayer){
            positionOnScreenX = invisBarrier - scaleOfPlayer;
            this.x = widthOfScreen - scaleOfPlayer;
        }
    }
    checkLeftWall(){
        if(this.x < edgeBuffer * 2.5 && positionOnScreenX > edgeBuffer * 2.5){
            let dx = edgeBuffer * 2.5 - this.x;
            this.x = edgeBuffer * 2.5;
            worldlyShift += dx;
            initWorldlyShift += dx;
        }else if(positionOnScreenX < 0){
            positionOnScreenX = 0;
            this.x = 0;
        }
    }
    checkPlatforms(tempX,tempY){
        if(this.y + scaleOfPlayer >= tempY && this.x > tempX - scaleOfPlayer && this.x < tempX + scaleOfPlayer && this.y + scaleOfPlayer - 50 <= tempY && this.onGround === false){
            this.getOnGround();
            this.y = tempY - scaleOfPlayer;
            this.onPlatformTop = true;
        }
        if(!this.onPlatformTop){
            this.getOffGround();
        }
        if(this.x >= tempX - scaleOfPlayer && this.y >= tempY - scaleOfPlayer  + 10 && this.y <= tempY + scaleOfPlayer - 10 && this.x <= tempX + 50){
            this.onPlatformRight = true;
            let dx = this.x - (tempX - scaleOfPlayer);
            this.x -= dx;
            positionOnScreenX -= dx;
        }
        if(this.x <= tempX + scaleOfPlayer && this.y >= tempY - scaleOfPlayer  + 10 && this.y <= tempY + scaleOfPlayer - 10 && this.x >= tempX + scaleOfPlayer - 50){
            this.onPlatformLeft = true;
            let dx = this.x - (tempX + scaleOfPlayer);
            this.x -= dx;
            positionOnScreenX -= dx;        
        }
    }
    checkFalsePlatforms(tempX,tempY){
        if(this.y + scaleOfPlayer >= tempY && this.x > tempX - scaleOfPlayer && this.x < tempX + scaleOfPlayer && this.y + scaleOfPlayer - 30 <= tempY && this.onGround === false){
            this.getOnGround();
            this.y = tempY - scaleOfPlayer;
            this.onPlatformTop = true;
        }
        if(!this.onPlatformTop){
            this.getOffGround();
        }
    }
    checkPit(){
        if(this.y >= heightOfScreen - scaleOfPlayer){
            deathState = true;
            alert("You died!  Better luck next time!");
            this.y = -10000;
        }
    }
    draw(context){
        if(this.direction === "r"){
            if(this.state === 1){
                context.drawImage(playerR1, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else if(this.state === 2){
                context.drawImage(playerR2, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else if(this.state === 3){
                context.drawImage(playerR3, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else if(this.state === 4){
                context.drawImage(playerR4, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else{
                context.drawImage(playerR5, this.x, this.y + scaleOfPlayer - (scaleOfPlayer/13)*12, scaleOfPlayer, (scaleOfPlayer/13)*12);
            }
        }else if(this.direction === "l"){
            if(this.state === 1){
                context.drawImage(playerL1, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else if(this.state === 2){
                context.drawImage(playerL2, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else if(this.state === 3){
                context.drawImage(playerL3, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else if(this.state === 4){
                context.drawImage(playerL4, this.x, this.y, scaleOfPlayer, scaleOfPlayer);
            }else{
                context.drawImage(playerL5, this.x, this.y + scaleOfPlayer - (scaleOfPlayer/13)*12, scaleOfPlayer, (scaleOfPlayer/13)*12);
            }
        }else{
            console.log("something went wrong at line 322?")
        }
    }
}

class AnimateNextLevel{
    constructor(){
        this.x = player.x;
        this.y = player.y;
        this.pi = Math.PI;
        this.animateState = 0;
        this.occupier = false;
    }
    draw(context){
        if(this.animateState >= 0 && this.occupier === true){
            this.animateState = 0;
            this.occupier = false;
        }
        if(this.animateState !== 0){
            if(this.animateState < this.pi * 1/8 && this.animateState > 0){
                this.x = player.x + scaleOfPlayer / 2;
                this.y = player.y + scaleOfPlayer / 2;
                context.fillStyle = "#000000";
                context.strokeStyle = "#000000";
                drawArc1(this.pi * (-7/8));
                drawArc1(this.pi * (-3/4));
                drawArc1(this.pi * (-5/8));
                drawArc1(this.pi * (-1/2));
                drawArc1(this.pi * (-3/8));
                drawArc1(this.pi * (-1/4));
                drawArc1(this.pi * (-1/8));
                drawArc1(this.pi * (0));
                drawArc1(this.pi * (1/8));
                drawArc1(this.pi * (1/4));
                drawArc1(this.pi * (3/8));
                drawArc1(this.pi * (1/2));
                drawArc1(this.pi * (5/8));
                drawArc1(this.pi * (3/4));
                drawArc1(this.pi * (7/8));
                drawArc1(this.pi * (1));
                this.animateState += this.pi / 1000;
            }else if(this.animateState >= this.pi * 1/8 || this.animateState <= 0){
                if(this.occupier === false){
                    this.animateState = -this.animateState;
                    this.occupier = true;
                    nextLevel = true;
                }
                this.x = player.x + scaleOfPlayer / 2;
                this.y = player.y + scaleOfPlayer / 2;
                context.fillStyle = "#000000";
                context.strokeStyle = "#000000";
                drawArc2(this.pi * (-7/8));
                drawArc2(this.pi * (-3/4));
                drawArc2(this.pi * (-5/8));
                drawArc2(this.pi * (-1/2));
                drawArc2(this.pi * (-3/8));
                drawArc2(this.pi * (-1/4));
                drawArc2(this.pi * (-1/8));
                drawArc2(this.pi * (0));
                drawArc2(this.pi * (1/8));
                drawArc2(this.pi * (1/4));
                drawArc2(this.pi * (3/8));
                drawArc2(this.pi * (1/2));
                drawArc2(this.pi * (5/8));
                drawArc2(this.pi * (3/4));
                drawArc2(this.pi * (7/8));
                drawArc2(this.pi * (1));
                this.animateState += this.pi / 1000;
            }else{
                console.log("ehw")
            }
        }
    }
}
function drawArc1(start){
    context.beginPath();
    context.arc(animation.x, animation.y, 5000, start, start + animation.animateState); 
    context.lineTo(animation.x, animation.y);
    context.closePath();
    context.fill();
    context.stroke();
}
function drawArc2(start){
    context.beginPath();
    context.arc(animation.x, animation.y, 5000, start + animation.animateState, start); 
    context.lineTo(animation.x, animation.y);
    context.closePath();
    context.fill();
    context.stroke();
}

let isPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
}




let scaleOfPlayer = 100;

let edgeBuffer = 150;





let positionOnScreenX = scaleOfPlayer/2;


function loaded(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    widthOfScreen = window.innerWidth;
    heightOfScreen = window.innerHeight;
    context.fillStyle = backroundColor;
    context.fillRect(0,0,widthOfScreen,heightOfScreen);
    if(assetesLoaded === numAssets){
        player = new Player(50,heightOfScreen - scaleOfPlayer * 3);
        tickSpeed = setInterval(tickStep, 20);
        framerate = setInterval(frame, 1);
        walkingState = setInterval(walk, 100);
        bounceSpeed1 = setInterval(() => keys.key1.bounce(), 750);
        bounceSpeed2 = setInterval(() => keys.key2.bounce(), 850);
        //bounceSpeed3 = setInterval(() => keys.key3.bounce(), 600);
    }
}

canvas.tabIndex = 1;
canvas.focus();


function frame() {
    context.fillStyle = backroundColor;
    context.fillRect(0,0,widthOfScreen,heightOfScreen);
    for(let i = 0;i < platforms.length;i++){
        platforms[i].draw(context);
    }
    for(let i = 0;i < falsePlatforms.length;i++){
        falsePlatforms[i].draw(context);
    }
    for(let i = 0;i < spike.length;i++){
        spike[i].draw(context);
    }
    doors.door1.draw(context);
    doors.door2.draw(context);
    keys.key1.draw(context);
    keys.key2.draw(context);
    player.draw(context);
    animation.draw(context);
}

function tickStep(){
    if(nextLevel === true){
        loadNextLevel();
        nextLevel = false;
    }
    if(deathState === false){
        if(isPressed.s === true){
            player.pickUp();
        }else{
            if(isPressed.w === true){
                player.jump();
            }
            if(isPressed.a === true){
                player.changeDir("l")
                player.left();
            }
            if(isPressed.d === true){
                player.changeDir("r")
                player.right();
            }
        }
        player.gravity();
        if(player.y >= heightOfScreen - scaleOfPlayer){
            player.getOnGround();
            player.y = heightOfScreen - scaleOfPlayer;
        }
    
        for(let i = 0;i < spike.length;i++){
            player.checkSpikes(spike[i].x,spike[i].y);
        }
        player.checkLeftWall();
        
        player.checkRightWall();
    
        for(let i = 0;i < spike.length;i++){
            spike[i].checkWorldlyShift();
        }
        for(let i = 0;i < platforms.length;i++){
            platforms[i].checkWorldlyShift();
        }
        for(let i = 0;i < falsePlatforms.length;i++){
            falsePlatforms[i].checkWorldlyShift();
        }
        doors.door1.checkWorldlyShift();
        doors.door2.checkWorldlyShift();
        keys.key1.checkWorldlyShift();
        keys.key2.checkWorldlyShift();
        worldlyShift = 0;
    
        if(keys.key1.gained === false){
            player.checkKeys(keys.key1.x,keys.key1.y,keys.key1);
        }
        if(keys.key2.gained === false){
            player.checkKeys(keys.key2.x,keys.key2.y,keys.key2);
        }
        if(doors.door1.unlocked === false){
            player.checkDoors(doors.door1.x,doors.door1.y,doors.door1);
        }
        if(doors.door2.unlocked === false){
            player.checkDoors(doors.door2.x,doors.door2.y,doors.door2);
        }
    
        player.onPlatformTop = false;
        player.onPlatformLeft = false;
        player.onPlatformRight = false;
        player.onPlatformBottom = false;
    
        for(let i = 0;i < platforms.length;i++){
            player.checkPlatforms(platforms[i].x, platforms[i].y)
        }
        for(let i = 0;i < falsePlatforms.length;i++){
            player.checkFalsePlatforms(falsePlatforms[i].x, falsePlatforms[i].y)
        }
    
        player.checkPit();
    }
}

function walk(){
    if(deathState === false){
        if(isPressed.s !== true){
            if(isPressed.a === true && isPressed.d === true){
                player.changeState(1);
            }else{
                if(isPressed.a === true||isPressed.d === true){
                    if(player.state === 1){
                        player.changeState(2);
                    }else if(player.state === 2){
                        player.changeState(3);
                    }else if(player.state === 3){
                        player.changeState(4);
                    }else if(player.state === 4){
                        player.changeState(1);
                    }
                }else{
                    player.changeState(1);
                }
            }
        }
    }
}

function loadNextLevel(){
    if(currentLevel === 0){
        for(let i = 0;i < 24;i++){
            platforms.push(new Platform(i * scaleOfPlayer,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
            platforms.push(new Platform(i * scaleOfPlayer,heightOfScreen - scaleOfPlayer, platformImg));
        }
        spike.push(new Spike(700,heightOfScreen - scaleOfPlayer * 3/4 - scaleOfPlayer * 2));
        spike.push(new Spike(900,heightOfScreen - scaleOfPlayer * 3/4 - scaleOfPlayer * 2));
        keys.key1 = new Key(1700,heightOfScreen - 200 - scaleOfPlayer * 2,keyImg1);
        keys.key2 = new Key(2 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 9,keyImg2);
        //keys.key3 = new Key(-900,-900,keyImg3);
        doors.door1 = new Door(2100,heightOfScreen - 200 - scaleOfPlayer * 2,doorImg1,false);
        doors.door2 = new Door(10250,heightOfScreen - 200 - scaleOfPlayer * 2,doorImg1,true);
        animation = new AnimateNextLevel();
        context.imageSmoothingEnabled = false;
    }else if(currentLevel === 1){
        for(let i = 0;i < spike.length;i++){
            spike.splice(i,1);
        }
        worldlyShift = -initWorldlyShift;
        worldlyShift -= 10000;
        initWorldlyShift = 0;
        nextLevel = false;
        player.x = 275;
        positionOnScreenX = 275;
        player.initPositionOnScreenX = 275;
        player.state = 1;
        player.direction = "r";
        invisBarrier = 3500;
        for(let i = 0;i < 24;i++){
            platforms.pop;
            platforms.pop;
        }
        for(let i = 0;i < 25;i++){
            platforms.push(new Platform(i * scaleOfPlayer + 10000 + scaleOfPlayer * 5,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
            platforms.push(new Platform(i * scaleOfPlayer + 10000 - scaleOfPlayer * 5 + scaleOfPlayer * 5 + scaleOfPlayer * 5,heightOfScreen - scaleOfPlayer, platformImg));
        }
        for(let i = 0;i < 15;i++){
            platforms.push(new Platform(10000 - scaleOfPlayer * 5,heightOfScreen - scaleOfPlayer * i, platformImg));
        }
        platforms.push(new Platform(-1 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
        platforms.push(new Platform(-2 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
        platforms.push(new Platform(-3 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
        platforms.push(new Platform(-4 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
        platforms.push(new Platform(-4 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2, platformTopImg));
        platforms.push(new Platform(-1 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer, platformImg));
        platforms.push(new Platform(-2 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer, platformImg));
        platforms.push(new Platform(-3 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer, platformImg));
        platforms.push(new Platform(-4 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer, platformImg));
        platforms.push(new Platform(-4 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer, platformImg));
        platforms.push(new Platform(0 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer, platformImg));
        platforms.push(new Platform(0 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2, platformImg));
        platforms.push(new Platform(0 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 3, platformTopImg));
        falsePlatforms.push(new FalsePlatform(8 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 4,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(5 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 6,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(1 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 7,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(-3.5 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 7,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(-2.5 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 7,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(-1.5 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 7,falsePlatformTopImg));
        for(let i = 0;i < 25;i++){
            spike.push(new Spike((i + 12) * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 2.75));
        }
        falsePlatforms.push(new FalsePlatform(16 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 4,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(24 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 5,falsePlatformTopImg));
        falsePlatforms.push(new FalsePlatform(20 * scaleOfPlayer + 10000,heightOfScreen - scaleOfPlayer * 7,falsePlatformTopImg));
    }
    currentLevel++;
}

function resetScreen(){
    context.fillStyle = backroundColor;
    context.fillRect(0,0,widthOfScreen,heightOfScreen);
    clearInterval(framerate);
    framerate = null;
    clearInterval(tickSpeed);
    tickSpeed = null;
}



function mousemove(event){
    
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colorMixRand(){
    let thisRandColor = Math.floor(Math.random() * 16777215).toString(16);
        for(let i = 0;i < 6;i++){
            let length = thisRandColor.length;
        if(length < 6){
            thisRandColor = "0" + thisRandColor;
        }else{
            break;
        }
    }
    return "#" + thisRandColor;
}

function mousedown(event){

}

function mouseup(event){

}

function handleKeyDown(event){
    if(event.key === "w"|| event.key === " "||event.key === "W"){
        isPressed.w = true;
    }
    if(event.key === "a"||event.key === "A"){
        isPressed.a = true;
    }
    if(event.key === "s"||event.key === "S"){
        isPressed.s = true;
    }
    if(event.key === "d"||event.key === "D"){
        isPressed.d = true;
    }
}

function handleKeyUp(event){
    if(event.key === "w"|| event.key === " "||event.key === "W"){
        isPressed.w = false;
    }
    if(event.key === "a"||event.key === "A"){
        isPressed.a = false;
    }
    if(event.key === "s"||event.key === "S"){
        isPressed.s = false;
    }
    if(event.key === "d"||event.key === "D"){
        isPressed.d = false;
    }
}

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

playerL1 = new Image();
playerL2 = new Image();
playerL3 = new Image();
playerL4 = new Image();
playerL5 = new Image();
playerR1 = new Image();
playerR2 = new Image();
playerR3 = new Image();
playerR4 = new Image();
playerR5 = new Image();
spikeImg = new Image();
keyImg1 = new Image();
keyImg2 = new Image();
keyImg3 = new Image();
doorImg1 = new Image();
doorImg2 = new Image();
doorImg3 = new Image();
platformTopImg = new Image();
platformImg = new Image();
falsePlatformTopImg = new Image();;
falsePlatformImg = new Image();;
playerL1.src = "images/playerL1.png";
playerL2.src = "images/playerL2.png";
playerL3.src = "images/playerL3.png";
playerL4.src = "images/playerL4.png";
playerL5.src = "images/playerL5.png";
playerR1.src = "images/playerR1.png";
playerR2.src = "images/playerR2.png";
playerR3.src = "images/playerR3.png";
playerR4.src = "images/playerR4.png";
playerR5.src = "images/playerR5.png";
spikeImg.src = "images/spike.png"
keyImg1.src = "images/keyImg1.png";
keyImg2.src = "images/keyImg2.png";
keyImg3.src = "images/keyImg3.png";
doorImg1.src = "images/doorImg1.png";
doorImg2.src = "images/doorImg2.png";
doorImg3.src = "images/doorImg3.png";
platformTopImg.src = "images/platformTop.png";
platformImg.src = "images/platform.png";
falsePlatformTopImg.src = "images/falsePlatformTop.png";
falsePlatformImg.src = "images/falsePlatform.png";
playerL1.onload = () => {
    assetesLoaded++;
    loaded();
}
playerL2.onload = () => {
    assetesLoaded++;
    loaded();
}
playerL3.onload = () => {
    assetesLoaded++;
    loaded();
}
playerL4.onload = () => {
    assetesLoaded++;
    loaded();
}
playerL5.onload = () => {
    assetesLoaded++;
    loaded();
}
playerR1.onload = () => {
    assetesLoaded++;
    loaded();
}
playerR2.onload = () => {
    assetesLoaded++;
    loaded();
}
playerR3.onload = () => {
    assetesLoaded++;
    loaded();
}
playerR4.onload = () => {
    assetesLoaded++;
    loaded();
}
playerR5.onload = () => {
    assetesLoaded++;
    loaded();
}
spikeImg.onload = () => {
    assetesLoaded++;
    loaded();
}
keyImg1.onload = () => {
    assetesLoaded++;
    loaded();
}
keyImg2.onload = () => {
    assetesLoaded++;
    loaded();
}
keyImg3.onload = () => {
    assetesLoaded++;
    loaded();
}
doorImg1.onload = () => {
    assetesLoaded++;
    loaded();
}
doorImg2.onload = () => {
    assetesLoaded++;
    loaded();
}
doorImg3.onload = () => {
    assetesLoaded++;
    loaded();
}
platformTopImg.onload = () => {
    assetesLoaded++;
    loaded();
}
platformImg.onload = () => {
    assetesLoaded++;
    loaded();
}
falsePlatformTopImg.onload = () => {
    assetesLoaded++;
    loaded();
};
falsePlatformImg.onload = () => {
    assetesLoaded++;
    loaded();
};











