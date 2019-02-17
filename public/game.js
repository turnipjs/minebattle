var socket = io();
var me = {
  which: null,
  id: "",
  game: "",
};

console.log("socket opening");

socket.on('whatGame', function(playerID) {
  console.log("whatGame recieved: " + playerID);
  me.id = playerID;
  console.log(me.id);
  me.game = ((window.location.pathname.slice(-1)!='/') ? (window.location.pathname.slice(-(shared.CONST.gameIDLength))) : (window.location.pathname.slice(-(shared.CONST.gameIDLength + 1), -1)));
  console.log("sending `myGame`: " + me.game);
  socket.emit('myGame', me.game); // take the correct 5 characters depending on trailing /
});

socket.on('update', function(game) {
  console.log("recieved `update`");
  render(game);
});

socket.on('whichAmI', function(data) {
  me.which = data.which;
  console.log("recieved `whichAmI`: " + me.which);
  render(data.game);
});

socket.on('lose', function(which) {
  console.log("recieved `lose`");
  if (which == me.which) {
    $("#gameID").html("<span style='color:red;'>You Lost!!!!!!</span>")
  } else {
    $("#gameID").html("<span style='color:red;'>You Won!!!!!!</span>")
  }
});


function render(game) { // game: [board0, board1]
  console.log("rendering:");
  console.log(game);
  let mine, other; // isMine: will it explode? mine: does it belong to me?
  if (me.which) {
    mine = game[1]; // isMine: will it explode? mine: does it belong to me?
    other = game[0];
  } else {
    mine = game[0]; // isMine: will it explode? mine: does it belong to me?
    other = game[1];
  }
  
  let output = "";
  for (var i = 0; i < mine.length; i++) {
    output += `<tr class="mine row" row="${i}">`
    for (var j = 0; j < mine[0].length; j++) {
      let tile = mine[i][j]; // tile: {open: true|false, flagged: true|false, isMine: true|false, surrounding: 0-8}
      output += `<td class="mine tile ${tile.open?"open":""} ${tile.flagged?"flagged":""} ${tile.isMine?"isMine":""}" ${tile.open?('surrounding="' + tile.surrounding + '"'):''} row="${i}" col="${j}">${tile.flagged?"F":(tile.isMine?"*":tile.surrounding)}</td>`; // isMine: will it explode? mine: does it belong to me?
    }
    output += `</tr>`;
  }
  $("#myBoard").html(output);
  
  output = "";
  for (var i = 0; i < other.length; i++) {
    output += `<tr class="other row" row="${i}">`
    for (var j = 0; j < other[0].length; j++) {
      let tile = other[i][j]; // tile: {open: true|false, flagged: true|false, isMine: true|false, surrounding: 0-8}
      output += `<td class="other tile ${tile.open?"open":""} ${tile.flagged?"flagged":""} ${tile.isMine?"isMine":""}" ${tile.open?('surrounding="' + tile.surrounding + '"'):''} row="${i}" col="${j}">${tile.flagged?"F":(tile.isMine?"*":tile.surrounding)}</td>`; // isMine: will it explode? mine: does it belong to me?
    }
    output += `</tr>`;
  }
  $("#otherBoard").html(output);
  
  // listeners
  if (me.which != 2) {
      $(".tile").click(function(e) { // action is of format {person: 0|1, type: "open|flag", row: 0-max, col: 0-max}
      let erow = $(e.target).attr("row");
      let ecol = $(e.target).attr("col");
      console.log(erow + " " + ecol + " clicked");
      console.log("sending `action`:");
      console.log({person: me.which, type: "open", row: erow, col: ecol});
      socket.emit("action", {person: me.which, type: "open", row: erow, col: ecol})
    });

    $(".tile").contextmenu(function(e) { // action is of format {person: 0|1, type: "open|flag", row: 0-max, col: 0-max}
      e.preventDefault();

      let erow = $(e.target).attr("row");
      let ecol = $(e.target).attr("col");
      console.log(erow + " " + ecol + " clicked");
      console.log("sending `action`:");
      console.log({person: me.which, type: "flag", row: erow, col: ecol});
      socket.emit("action", {person: me.which, type: "flag", row: erow, col: ecol})
    });
  }

}

$("#readyButton").click(function() {
  console.log("readyButton clicked");
  console.log("sending `ready`");
  socket.emit('ready', [me.game, me.id]);
});

$("#gameID").html(window.location.pathname.slice(-(shared.CONST.gameIDLength)))
