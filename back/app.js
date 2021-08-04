const Express = require("express")();
const Http = require("http").Server(Express)
const Socketio = require("socket.io")(Http, {
  cors: {
    origin: '*',
  }
});
// number of frames per second
let framePerSecond = 50;
let startedGame = false;
let loop;
const canvas = {
  width: 640,
  height: 641
}

let listOfUsers = [];

// Ball object
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  velocityX: 2,
  velocityY: 2,
  speed: 2,
  color: "WHITE",
  id: 0
}

// User1 Paddle
let user1 = {
  x: 0, // left side of canvas
  y: (canvas.height - 100) / 2, // -100 the height of paddle
  width: 10,
  height: 100,
  score: 0,
  color: "WHITE",
  id: 0,
  position: 1
}

// user2 Paddle
let user2 = {
  x: canvas.width - 10, // - width of paddle
  y: (canvas.height - 100) / 2, // -100 the height of paddle
  width: 10,
  height: 100,
  score: 0,
  color: "WHITE",
  id: 0,
  position: 2
}

let user3 = {
  x: (canvas.width - 100) / 2, // - width of paddle
  y: canvas.height - 10, //
  width: 100,
  height: 10,
  score: 0,
  color: "WHITE",
  id: 0,
  position :3
}

let user4 = {
  x: (canvas.width - 100) / 2, // - width of paddle
  y: 0,
  width: 100,
  height: 10,
  score: 0,
  color: "WHITE",
  id: 0,
  position : 4
}


// collision detection
function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// when COM or USER scores, we reset the ball
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 2;
  ball.velocityX = -ball.velocityX;
}

function resetUser(userId) {
  switch (userId) {
    case 1:
      user1 = {
        x: 0, // left side of canvas
        y: (canvas.height - 100) / 2, // -100 the height of paddle
        width: 10,
        height: 100,
        score: 0,
        color: "WHITE",
        id: 0,
        position : 1
      }
      break;
    case 2 :
      user2 = {
        x: canvas.width - 10, // - width of paddle
        y: (canvas.height - 100) / 2, // -100 the height of paddle
        width: 10,
        height: 100,
        score: 0,
        color: "WHITE",
        id: 0,
        position : 2
      }
      break;
    case 3 :
      user3 = {
        x: (canvas.width - 100) / 2, // - width of paddle
        y: canvas.height - 10, //
        width: 100,
        height: 10,
        score: 0,
        color: "WHITE",
        id: 0,
        position : 3
      };
      break;
    case 4:
      user4 = {
        x: (canvas.width - 100) / 2, // - width of paddle
        y: 0,
        width: 100,
        height: 10,
        score: 0,
        color: "WHITE",
        id: 0,
        position : 4
      };
      break;
  }
}

// update function, the function that does all calculations
function update() {
  // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user1 win
  if (ball.x - ball.radius < 0) {
    user2.score++;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    user1.score++;
    resetBall();
  }

  // the ball has a velocity
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // we check if the paddle hit the user1 or the com paddle
  let player = (ball.x + ball.radius < canvas.width / 2) ? user1 : user2;
  // when the ball collides with bottom and top walls we inverse the y velocity.

  if (ball.y - ball.radius < 0) {
    if (user4.id === 0) {
      ball.velocityY = -ball.velocityY;
      Socketio.emit("playSound", 'wall')
    }else{
      player = user4;
      if (!collision(ball, player)) {
        resetBall();
      }
    }
  }
  if (ball.y + ball.radius > canvas.height) {
    if (user3.id === 0) {
      ball.velocityY = -ball.velocityY;
      Socketio.emit("playSound", 'wall')
    }else {
      player = user3;
      if (!collision(ball, player)) {
        resetBall();
      }
    }
  }

  // if the ball hits a paddle
  if (collision(ball, player)) {
    // console.log(ball.x);
    // console.log(ball.y);

    Socketio.emit("playSound", 'hit')
    let collidePoint;
    if(player.position === 1 || player.position ===2) {
      // we check where the ball hits the paddle
      collidePoint = (ball.y - (player.y + player.height / 2));
      // normalize the value of collidePoint, we need to get numbers between -1 and 1.
      // -player.height/2 < collide Point < player.height/2
      collidePoint = collidePoint / (player.height / 2);
    }else {
      collidePoint = (ball.x - (player.x + player.width / 2));
      collidePoint = collidePoint / (player.width / 2);
    }

    // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
    // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
    // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
    // Math.PI/4 = 45degrees
    let angleRad = (Math.PI / 4) * collidePoint;

    // change the X and Y velocity direction
    if(player.position === 1 || player.position ===2){
      let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
    }else{
      let direction = (ball.y + ball.radius < canvas.height / 2) ? 1 : -1;
      ball.velocityX = ball.speed * Math.sin(angleRad);
      ball.velocityY = direction * ball.speed * Math.cos(angleRad);
    }


    // speed up the ball everytime a paddle hits it.
    ball.speed += 0.1;
  }
}


Socketio.on("connection", socket => {
  socket.on("move", data => {

    let rect = data.clientRect

    if (user1.id === data.userId) {
      user1.y = data.mousePosition.clientY - rect.top - user1.height / 2;
    }
    if (user2.id === data.userId) {
      user2.y = data.mousePosition.clientY - rect.top - user2.height / 2;
    }
    if (user3.id === data.userId) {
      user3.x = data.mousePosition.clientX - rect.top - user3.width / 2;
    }
    if (user4.id === data.userId) {
      user4.x = data.mousePosition.clientX - rect.top - user4.width / 2;
    }
  })

  socket.on("deleteUser", data => {

    if (listOfUsers.length > 0) {
      let userIndex;
      for (const [index, value] of listOfUsers.entries()) {
        if (value.userId === data.userId) {
          userIndex = index;
        }
      }
      if (userIndex) {
        resetUser(userIndex + 1);
        listOfUsers.splice(userIndex, 1);
      }

    }
    Socketio.emit("listOfUsers", listOfUsers)
  })


  socket.on("registerUser", data => {
    if (listOfUsers.length > 0) {
      if (listOfUsers.length === 4) {
        const position = {
          err: 'Game is full. Wait please for empty space'
        }
        // Socketio.emit("position", position)
      } else {
        let alreadyLoggedIn = false;
        listOfUsers.forEach(oneUser => {
          if (oneUser.userId === data.userId) {
            alreadyLoggedIn = true;
          }
        })
        if (!alreadyLoggedIn) {
          listOfUsers.push({userId: data.userId, slot: null});
        }
      }
    } else {
      listOfUsers.push({userId: data.userId, slot: null});
    }
    Socketio.emit("listOfUsers", listOfUsers)
  })

  socket.on("start", data => {
    startedGame = true;
    listOfUsers.forEach(oneUser => {
      let foundSlot = false;
      if (user1.id === 0) {
        user1.id = oneUser.userId;
        oneUser.slot = 1;
        foundSlot = true
      }
      if (foundSlot === false) {
        if (user2.id === 0) {
          user2.id = oneUser.userId;
          oneUser.slot = 2;
          foundSlot = true
        }
      }
      if (foundSlot === false) {
        if (user3.id === 0) {
          user3.id = oneUser.userId;
          oneUser.slot = 3;
          foundSlot = true
        }
      }
      if (foundSlot === false) {
        if (user4.id === 0) {
          user4.id = oneUser.userId;
          oneUser.slot = 4;
          foundSlot = true
        }
      }
    })

    loop = setInterval(() => {
      update();
      const position = {
        ball: ball,
        user1: user1,
        user2: user2,
        user3: user3.id ? user3 : null,
        user4: user4.id ? user4 : null,
      }
      Socketio.emit("position", position)
    }, 1000 / framePerSecond);
  })

  socket.on("end", data => {
    listOfUsers = [];
    startedGame = false;
    clearInterval(loop);
    resetBall();
    for (let i = 1; i <= 4; i++) {
      resetUser(i);
    }
  })


})

Http.listen(3000, () => {
  console.log("Listening on 3000 ...");
})
