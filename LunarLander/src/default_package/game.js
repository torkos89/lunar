"use strict";
const CVS = document.getElementById("game");
const CTX = CVS.getContext("2d");
const ENTITIES = new Map();
const COUNTER = {asteroids:0, };
var id = 1;

const CONFIG = {velocity:10 , bulletDuration:40, maxAsteroids: 3, asteroidSize: 10, gravity:0, running: true};
//SPACESHIP
ENTITIES.set(0,{id:0, draw: drawSpaceship, update: updateSpaceship, collision: collide,
  data: {
    color: "silver",
    radius: 21,
    position: { x:CVS.width/2 , y:CVS.height/2 },
    angle:0,
    velocity: { x:0, y:0 },
    thrust: -0.1,
    engineOn: false,
    rotationLeft: false,
    rotationRight: false,

  }
});

function drawSpaceship(spaceship){
  CTX.save();
  CTX.beginPath();
  CTX.translate(spaceship.position.x, spaceship.position.y);
  CTX.rotate(spaceship.angle);
  CTX.moveTo(0,-25);
  CTX.lineTo(-8,-5);
  CTX.lineTo(-14,-12);
  CTX.lineTo(-20,-5);
  CTX.lineTo(-20,18);
  CTX.lineTo(-8,18);
  CTX.lineTo(-8,10);
  //right side
  CTX.lineTo(8,10);
  CTX.lineTo(8,18);
  CTX.lineTo(20,18);
  CTX.lineTo(20,-5);
  CTX.lineTo(14,-12);
  CTX.lineTo(8,-5);
  CTX.lineTo(0,-25);

  CTX.fillStyle = spaceship.color;
  CTX.fill();
  /*
  CTX.beginPath();
  CTX.translate(spaceship.position.x, spaceship.position.y);
  CTX.rotate(spaceship.angle);
  CTX.rect(spaceship.width * -0.5, spaceship.height * -0.5, spaceship.width, spaceship.height);
  CTX.fillStyle = spaceship.color;
  CTX.fill();
  CTX.closePath();
  */
  if(spaceship.engineOn){

    CTX.beginPath();
    CTX.moveTo(-4, 10); //bot L
    CTX.lineTo(0, 19 + Math.random()*5);
    CTX.lineTo(4, 10); // bot R
    //CTX.lineTo(spaceship.width * -0.5, spaceship.height * 0.5);
    CTX.closePath();
    CTX.fillStyle = "orange";
    CTX.fill();
  }
  CTX.restore();
}
function updateSpaceship(spaceship){

  if(spaceship.rotationRight){
    spaceship.angle += Math.PI / 180;
  }
  else if(spaceship.rotationLeft){
    spaceship.angle -= Math.PI / 180;
  }
  if(spaceship.engineOn){
    spaceship.velocity.x += spaceship.thrust * Math.sin(-spaceship.angle);
    spaceship.velocity.y += spaceship.thrust * Math.cos(spaceship.angle);
  }
  spaceship.position.x += spaceship.velocity.x;
  spaceship.position.y += spaceship.velocity.y;
  if(spaceship.position.x<0) spaceship.position.x += CVS.width;
  else if(spaceship.position.x>CVS.width) spaceship.position.x -= CVS.width;
  if(spaceship.position.y<0) spaceship.position.y += CVS.height;
  else if(spaceship.position.y>CVS.height) spaceship.position.y -= CVS.height;

}
function collide(data1, data2){
  if(data1.color === data2.color) return false;
  const X = Math.abs(data1.position.x - data2.position.x);
  const Y = Math.abs(data1.position.y - data2.position.y);
  const R = data1.radius+data2.radius;
  if(R < X || R < Y) return false;
  return(Math.sqrt(X*X + Y*Y) < R);
}

function drawBullet(bullet){
    CTX.beginPath();
    CTX.arc(bullet.position.x,bullet.position.y,2,0,2*Math.PI);
    CTX.fillStyle = bullet.color;
    CTX.fill();
}
function updateBullet(bullet){                                // kill me
  if(bullet.age>CONFIG.bulletDuration){
    return 1;
  }
  bullet.age++;
  bullet.position.x+=bullet.velocity.x;
  bullet.position.y+=bullet.velocity.y;
  if(bullet.position.x<0) bullet.position.x += CVS.width;
  else if(bullet.position.x>CVS.width) bullet.position.x -= CVS.width;
  if(bullet.position.y<0) bullet.position.y += CVS.height;
  else if(bullet.position.y>CVS.height) bullet.position.y -= CVS.height;
  return 0;
}

function drawAsteroid(asteroid){
  CTX.beginPath();
  CTX.arc(asteroid.position.x, asteroid.position.y, asteroid.size * CONFIG.asteroidSize, 0,2*Math.PI)
  CTX.fillStyle = asteroid.color;
  CTX.fill();
}
function updateAsteroid(asteroid){
  asteroid.position.x+=asteroid.velocity.x;
  asteroid.position.y+=asteroid.velocity.y;
  if(asteroid.position.x<0) asteroid.position.x += CVS.width;
  else if(asteroid.position.x>CVS.width) asteroid.position.x -= CVS.width;
  if(asteroid.position.y<0) asteroid.position.y += CVS.height;
  else if(asteroid.position.y>CVS.height) asteroid.position.y -= CVS.height;

  return 0;
}
function createAsteroid(SIZE, position){
  if(!SIZE) return;
  var pos;
  if(position){
     pos = {x: position.x, y: position.y}

  }else pos = {x:Math.random()*CVS.width , y:Math.random()*CVS.height }
  ENTITIES.set(id,{id: id++, draw: drawAsteroid, update: updateAsteroid, collision: collide,
    data: { position: pos,
      velocity:{x:Math.random()*(Math.random()<0.5? 1 : -1) , y:Math.random()*(Math.random()<0.5? 1 : -1) },
      size:SIZE, color: "lightgray", radius: 10 * SIZE
    }
  });
  console.log(ENTITIES.get(id-1).data.velocity)
  COUNTER.asteroids++;
}

function draw(){
  CTX.fillStyle = "black";
  CTX.fillRect(0,0, CVS.width, CVS.height);
  if(COUNTER.asteroids<CONFIG.maxAsteroids){
    createAsteroid(Math.ceil(Math.random()*3));
  }
  ENTITIES.forEach(function(val,key){                        // Update Loop
    if(val.update(val.data)){
      ENTITIES.delete(key);
    }
  });
  ENTITIES.forEach(function(val1,key1){
    let hit = false;
    ENTITIES.forEach(function(val2,key2){
      if(!hit && key1 !== key2){
        if(val1.collision(val1.data,val2.data)){            // Collision
          if(key2===0) CONFIG.running = false;
          if(val2.data.size!==undefined){
            COUNTER.asteroids--;
            createAsteroid(val2.data.size-1, val2.data.position);
            createAsteroid(val2.data.size-1, val2.data.position);
          }
          else ENTITIES.set(id,{id: id++,                   // Explosion
            update: function(data){
                return data.age-- <= -1;
            }, draw: function(data){
                CTX.beginPath();
                CTX.arc(data.position.x, data.position.y, 14-data.age*2, 0, 2 * Math.PI);
                switch(data.age){
                  case 0: CTX.strokeStyle = "purple"; break;
                  case 1: CTX.strokeStyle = "red"; break;
                  case 2: CTX.strokeStyle = "orange"; break;
                  case 3: CTX.strokeStyle = "yellow"; break;
                  case 4: CTX.strokeStyle = "white"; break;
                }
                CTX.stroke();
            }  , collision: function(){} , data: {position: {x: val2.data.position.x , y: val2.data.position.y}, age:5} })
          ENTITIES.delete(key2);
          hit = true;
          return;
        }
      }
    })
    if(hit){
      if(key1===0) CONFIG.running = false;
      if(val1.data.size!==undefined){
        COUNTER.asteroids--;
        createAsteroid(val1.data.size-1, val1.data.position);
        createAsteroid(val1.data.size-1, val1.data.position);
      }
      ENTITIES.delete(key1);
      return;
    }
  });
  ENTITIES.forEach(function(val){
    val.draw(val.data)
  });
  if(CONFIG.running) requestAnimationFrame(draw);
}
function keyLetGo(event){
  if(CONFIG.running){
    let spaceship = ENTITIES.get(0).data;
    switch(event.keyCode){
      case 65: spaceship.rotationLeft = false; break; // A
      case 68: spaceship.rotationRight = false; break; // D
      case 87: spaceship.engineOn = false; break; // W
      case 32: spaceship.shooting = false; break; // Space
    }
  }
}
function keyPressed(event){
  if(CONFIG.running){
    let spaceship = ENTITIES.get(0).data;
    switch(event.keyCode){
      case 65: spaceship.rotationLeft = true; break;  //TODO fix me...
      case 68: spaceship.rotationRight = true; break;
      case 87: spaceship.engineOn = true; break;
      case 32: ENTITIES.set(id,{id: id++, draw: drawBullet, update: updateBullet, collision: collide,
        data: { position: {x: spaceship.position.x, y: spaceship.position.y},
          velocity: { x: -CONFIG.velocity*Math.sin(-spaceship.angle), y: -CONFIG.velocity*Math.cos(spaceship.angle) },
          age: 0, color: spaceship.color , radius: 2
        }
      })
    }
  }
}
var mouse = {x:0,y:0};
function mouseMove(event){
	let data = ENTITIES.get(0).data;
	mouse.x = event.clientX;
	mouse.y = event.clientY;
	data.angle = Math.atan2(mouse.x-data.position.x , data.position.y-mouse.y);
	
	console.log(data.angle)
	console.log(data.position.x+' , '+data.position.y)
}
document.addEventListener('mousemove', mouseMove);
document.addEventListener('keyup', keyLetGo);
document.addEventListener('keydown', keyPressed);
draw();
