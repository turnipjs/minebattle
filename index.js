var shared = require(__dirname + '/public/shared.js')

var games = {}

class Game {
  constructor(id) {
    // boardElement: {open: true|false, flagged: true|false, mine: true|false}
    this.players = {
      0: {
        ready: false,
        board: shared.makeArray(shared.CONST.defaultRows, shared.CONST.defaultCols, {open: false, flagged: false, mine: false, surrounding: 0})
      },
      1: {
        ready: false,
        board: shared.makeArray(shared.CONST.defaultRows, shared.CONST.defaultCols, {open: false, flagged: false, mine: false, surrounding: 0})
      }
    }
    this.full = false
    this.observers = 0
    this.id = id
  }
  
  addPlayer1() {
    
  }
  
  addPlayer2() {
    
  }
  
  clientView(end = -1) {
    // in: [[[{open: true|false, flagged: true|false, mine: true|false, surrounding: 0-8}]]]
    // out: [[[{open: true|false, flagged: true|false, mine(some hidden): true|false, surrounding(some hidden): 0-8}]]]
    boards = [this.players[0].board, this.player[1].board]
    for (var board in boards) { // 2
      for (var row in board) { // rows
        for (var tile in row) { // cols
          if (boards[board][row][tile].closed) { // if tile is closed, hide the things
            boards[board][row][tile].mine = false // tile aka col
            boards[board][row][tile].surr = 0 // tile aka col
          }
        }
      }
    }
    boards.end = end
    return boards
  }
  
  addMine(fromPlayer) { // fromPlayer is the player that added the mine, make the 
    // add a random mine to !fromPlayer
    row = Math.random() * this.players[0].board.length
    col = Math.random() * this.players[0].board[0].length
    if (this.players[fromPlayer?0:1].board[row][col].open || this.players[fromPlayer?0:1].board[row][col].mine) { return addMine(fromPlayer) } // not a recursive result, im just lazy
    this.players[fromPlayer?0:1].board[row][col].mine = true
    
    // increment the .surr in the surr fields
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++){
        if (!(j||i)) {continue} // i==j==0
        this.players[fromPlayer?0:1].board[i][j].surr++
      }
    }
  } // NEVER USE THE RETURN VALUE OF THIS FUNCTION, IT IS USELESS
  
  updateBoard(action) {
    // action: {person: 0|1, type: "open|flag", row: 0-max, col: 0-max}
    
    // flagging a closed tile toggles the flagged state
    // flagging an open tile does nothing
    // opening a flagged does nothing
    // opening an open tile does nothing
    // opening a mine tile calls endgame
    if (action.type == "flag") {
        if (!players[action.person].board[action.row][action.col].open) { // if closed
          players[action.person].board[action.row][action.col].flagged = !players[action.person].board[action.row][action.col].flagged // toggle flagged state
        }
    } else {
        if (!players[action.person].board[action.row][action.col].flagged && !players[action.person].board[action.row][action.col].open) { // if not open and not flagged
          players[action.person].board[action.row][action.col].open = true
          if (players[action.person].board[action.row][action.col].mine) {
            return this.clientView(person)
          }
        }
    }
    
    addMine(action.person)
    
    return this.clientView() // gets [board1, board2]
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

app.post('/createGame', function (req, res) {
  let gameID = shares.makeToken(shared.CONST.gameIDLength, games)
  games[gameID] = new Game(gameID)
  res.redirect('/game/' + gameID)
});

app.get('/game/*', function(req, res){
  res.sendFile(__dirname + '/public/game.html')
});

http.listen(3000, function(){
  console.log('listening on *:3000')
});
