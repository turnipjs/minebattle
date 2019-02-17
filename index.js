var shared = require(__dirname + '/public/shared.js')

var games = {}

class Game {
  // static methods
  static addUser(userID, gameID) { // add userID to gameID
    for (var game in games) {
      if (game == gameID) {
        if (this.full) {
          games[gameID].addSpectator(userID)
          return 2
        } else {
          this.full = true;
          games[gameID].addPlayer2(userID)
        }
        
        return 1 // will not create new game
      }
    }
    
    games[gameID] = new Game(gameID, userID) // this will not execute due to the return if the game was found
    return 0
  }
  
  // constructor
  constructor(id, player1ID) {
    // tile: {open: true|false, flagged: true|false, isMine: true|false, surrounding: 0-8} // isMine: will it explode? mine: does it belong to me?
    this.players = {
      0: {
        id: player1ID,
        ready: false,
        board: shared.makeArray(shared.CONST.defaultRows, shared.CONST.defaultCols) // isMine: will it explode? mine: does it belong to me?
      },
      1: {
        id: "",
        ready: false,
        board: shared.makeArray(shared.CONST.defaultRows, shared.CONST.defaultCols) // isMine: will it explode? mine: does it belong to me?
      }
    }
    this.full = false
    this.spectators = []
    this.id = id
    this.ready = false
  }
  
  // instance methods
  startGame() {
    if (this.players[0].ready && this.players[1].ready) {
      this.ready = true
    }
  }
  
  playerReady(playerID) {
    if (this.players[0].id == playerID) {
      this.players[0].ready = true
    }
    
    if (this.players[1].id == playerID) {
      this.players[1].ready = true
    }
    
    this.startGame()
  }
  
  addPlayer2(playerID) {
    this.players[1].id = playerID
  }
  
  addSpectator(spectatorID) {
    this.spectators.push(spectatorID)
    // TODO
  }
  
  clientView(end = null) {
    // in: [[[{open: true|false, flagged: true|false, isMine: true|false, surrounding: 0-8}]]]
    // out: [[[{open: true|false, flagged: true|false, isMine(some hidden): true|false, surrounding(some hidden): 0-8}]]]
    let boards = [this.players[0].board, this.players[1].board]
    console.log("7: " + this.players[0].board[1][1].open);
    for (var board in boards) { // 2
      for (var row in board) { // rows
        for (var tile in row) { // cols
          if (!boards[board][row][tile].open) { // if tile is closed, hide the things
            boards[board][row][tile].isMine = false // tile aka col // isMine: will it explode? mine: does it belong to me?
            boards[board][row][tile].surrounding = 0 // tile aka col
          }
        }
      }
    }
    console.log("8: " + this.players[0].board[1][1].open);
    boards.end = end
    return boards
  }
  
  addMine(fromPlayer) { // fromPlayer is the player that added the mine, make the 
    // add a random mine to !fromPlayer
    let row = shared.randRange(this.players[0].board.length)
    let col = shared.randRange(this.players[0].board[0].length)
    if (this.players[fromPlayer?0:1].board[row][col].open || this.players[fromPlayer?0:1].board[row][col].isMine) { return this.addMine(fromPlayer) } // not a recursive result, im just lazy // isMine: will it explode? mine: does it belong to me?
    this.players[fromPlayer?0:1].board[row][col].isMine = true // isMine: will it explode? mine: does it belong to me?
    
    // increment the .surr in the surr fields
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++){
        if ((j==0 && i==0) || (row + i)<0 || (col + j)<0 || ((row + i) > 29) || ((col + j) > 15)) {continue;} // i==j==0
        console.log(""+row+" "+i+" "+col+" "+j);
        console.log(this.players[fromPlayer?0:1].board[i + row]);
        console.log(++this.players[fromPlayer?0:1].board[i + row][j + col].surrounding);
        // this.players[fromPlayer?0:1].board[i + row][j + col].surrounding++
      }
    }
  } // NEVER USE THE RETURN VALUE OF THIS FUNCTION, IT IS USELESS
  
  updateBoard(action) {
    // action: {person: 0|1, type: "open|flag", row: 0-max, col: 0-max}
    if (this.ready) {
      // flagging a closed tile toggles the flagged state
      // flagging an open tile does nothing
      // opening a flagged does nothing
      // opening an open tile does nothing
      // opening a mine tile calls endgame
      if (action.type == "flag") {
          if (!this.players[action.person].board[action.row][action.col].open) { // if closed
            this.players[action.person].board[action.row][action.col].flagged = !this.players[action.person].board[action.row][action.col].flagged // toggle flagged state
            
          }
      } else {
          if (!this.players[action.person].board[action.row][action.col].flagged && !this.players[action.person].board[action.row][action.col].open) { // if not open and not flagged
            ((this.players[action.person]).board[action.row][action.col]).open = true;
            if (this.players[action.person].board[action.row][action.col].isMine) { // isMine: will it explode? mine: does it belong to me?
              console.log("emitting `lose`: " + action.person);
              io.to(this.id).emit('lose', action.person);
            this.ready = false;
              return this.clientView(action.person)
            }
          }
      }
      
      this.addMine(action.person)
    }
    
    return this.clientView() // gets [board1, board2, end:true|false]
  }
}



//  ▄         ▄    ▄▄▄▄▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄▄▄▄     ▄▄▄▄▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄▄▄▄▄    ▄               ▄
// ▐░▌       ▐░▌  ▐░░░░░░░░░░░▌  ▐░░░░░░░░░░▌   ▐░░░░░░░░░░░▌  ▐░░░░░░░░░░░▌  ▐░▌             ▐░▌
// ▐░▌       ▐░▌  ▐░█▀▀▀▀▀▀▀▀▀   ▐░█▀▀▀▀▀▀▀█░▌  ▐░█▀▀▀▀▀▀▀▀▀   ▐░█▀▀▀▀▀▀▀█░▌   ▐░▌           ▐░▌
// ▐░▌       ▐░▌  ▐░▌            ▐░▌       ▐░▌  ▐░▌            ▐░▌       ▐░▌    ▐░▌         ▐░▌
// ▐░▌   ▄   ▐░▌  ▐░█▄▄▄▄▄▄▄▄▄   ▐░█▄▄▄▄▄▄▄█░▌  ▐░█▄▄▄▄▄▄▄▄▄   ▐░█▄▄▄▄▄▄▄█░▌     ▐░▌       ▐░▌
// ▐░▌  ▐░▌  ▐░▌  ▐░░░░░░░░░░░▌  ▐░░░░░░░░░░▌   ▐░░░░░░░░░░░▌  ▐░░░░░░░░░░░▌      ▐░▌     ▐░▌
// ▐░▌ ▐░▌░▌ ▐░▌  ▐░█▀▀▀▀▀▀▀▀▀   ▐░█▀▀▀▀▀▀▀█░▌   ▀▀▀▀▀▀▀▀▀█░▌  ▐░█▀▀▀▀█░█▀▀        ▐░▌   ▐░▌
// ▐░▌▐░▌ ▐░▌▐░▌  ▐░▌            ▐░▌       ▐░▌            ▐░▌  ▐░▌     ▐░▌          ▐░▌ ▐░▌
// ▐░▌░▌   ▐░▐░▌  ▐░█▄▄▄▄▄▄▄▄▄   ▐░█▄▄▄▄▄▄▄█░▌   ▄▄▄▄▄▄▄▄▄█░▌  ▐░▌      ▐░▌          ▐░▐░▌
// ▐░░▌     ▐░░▌  ▐░░░░░░░░░░░▌  ▐░░░░░░░░░░▌   ▐░░░░░░░░░░░▌  ▐░▌       ▐░▌          ▐░▌
//  ▀▀       ▀▀    ▀▀▀▀▀▀▀▀▀▀▀    ▀▀▀▀▀▀▀▀▀▀     ▀▀▀▀▀▀▀▀▀▀▀    ▀         ▀            ▀

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static('public'))

app.get('/createGame/', function (req, res) {
  console.log("request for /createGame/")
  res.redirect('/game/' + shared.makeToken(shared.CONST.gameIDLength, games))
});

app.get('/game/*', function(req, res){
  console.log("GET /game/x: x unknown")
  res.sendFile(__dirname + '/public/game.html')
})

io.on('connection', function(socket) {
  let thisGame = ""
  
  console.log("socket user " + socket.id + " connected")
  socket.emit('whatGame', socket.id)
  
  socket.on('myGame', function(myGame) {
    console.log("recieved `myGame`: " + myGame)
    thisGame = myGame
    socket.join(thisGame)
    let whichAmI = Game.addUser(socket.id, thisGame) // this is a static method to account for new games
    
    console.log("sending `whichAmI`: " + whichAmI);
    socket.emit('whichAmI', {which: whichAmI, game: games[thisGame].clientView()})
  })
  
  socket.on('ready', function(ready) {
    console.log("recieved `ready`: " + ready[0] + " " + ready[1])
    games[ready[0]].playerReady(ready[1])
  }) // ready: [gameID, playerID]
  
  socket.on('action', function(action) { // action is of format {person: 0|1, type: "open|flag", row: 0-max, col: 0-max}
    console.log("recieved `action`: " + action)
    console.log("sending `update`: " + thisGame)
    io.to(thisGame).emit('update', games[thisGame].updateBoard(action))
  })
  
  socket.on('disconnect', function(data){
    console.log("recieved `disconnect`: " + data)
    // TODO
  })
})

http.listen(8974, function(){
  console.log('listening on *:8974')
})
