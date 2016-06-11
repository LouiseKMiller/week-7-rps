// javascript file for UT BootCamp Assignment 7
// RPS app using Firebase for Week 7 - Louise K Miller

$(document).ready(function(){

window.onbeforeunload = function() {
	if (you==1) 
		player1Ref.remove();
	else 	 	
		player2Ref.remove();
	fbTurn.remove();
	player1Choice.remove();
	player2Choice.remove();
	messages.remove();
};

// Link to Firebase
var rpsData = new Firebase("https://lkmrpsgame.firebaseio.com/");
var player1Ref = new Firebase("https://lkmrpsgame.firebaseio.com/players/1");
var player2Ref = new Firebase("https://lkmrpsgame.firebaseio.com/players/2");
var player1Name = new Firebase("https://lkmrpsgame.firebaseio.com/players/1/name");
var player2Name = new Firebase("https://lkmrpsgame.firebaseio.com/players/2/name");
var player1Choice = new Firebase("https://lkmrpsgame.firebaseio.com/players/1/choice");
var player2Choice = new Firebase("https://lkmrpsgame.firebaseio.com/players/2/choice");
var fbTurn = new Firebase("https://lkmrpsgame.firebaseio.com/turn");
var player1Wins = player1Ref.child('/wins');
var player1Losses = player1Ref.child('/losses');
var player2Wins = player2Ref.child('/wins');
var player2Losses = player2Ref.child('/losses');
var messages = rpsData.child('/messages');

var p1Choice = "";
var p2Choice = "";
var p1Wins = 0;
var p1Losses = 0;
var p2Wins = 0;
var p2Losses = 0;
var you = 3;
var playerOneExists = false;
var playerTwoExists = false;
var turn = 0;
var winner;
var	chat = "";
$('#p1choices').hide();
$('#p2choices').hide();

// At the initial load and any change, find out if Player 1 exists
player1Name.on("value", function(snapshot) {
	if (snapshot.exists()) {
		$("#playerOneDiv").find('h2').html(snapshot.val());
		playerOneExists = true;
		if ((playerTwoExists) && you==3) {
			$('#start').hide();
			$("#greetingDiv").html("<h2> Game Full. Please wait! </h2>");
		}
	}
	else {
		$("#playerOneDiv").find('h2').html("WAITING FOR PLAYER ONE");
		playerOneExists = false;
		$('form').show();
		$('#greetingDiv').html("");

	}
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

// At the initial load and any change, find out if Player 2 exists
player2Name.on("value", function(snapshot) {
	if (snapshot.exists()) {
		$("#playerTwoDiv").find('h2').html(snapshot.val());
		playerTwoExists = true;
		if ((playerOneExists) && you == 3) {
			$('form').hide();
			$("#greetingDiv").html("<h2> Game Full. Please wait! </h2>");
		}

	}
	else {
		$("#playerTwoDiv").find('h2').html("WAITING FOR PLAYER TWO");
		playerTwoExists = false;
		$('form').show();
		$('#greetingDiv').html("");
	}
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});


// Whenever a user clicks the start button
$("#start").on("submit", function() {
	event.preventDefault();

	// Find out if someone else is player 1 already
	// If not, user is player 1 
	if (playerOneExists == false) {
		you = 1;
		yourName = $('#userInput').val().trim();

		// Save the new player name in Firebase ref('player' + you).
		player1Ref.set({
			'name': yourName,
			'wins': 0,
			'losses': 0
			});

		// Change the HTML to reflect the new player name
		$("#playerOneDiv").find('h2').html(yourName);
		$("#greetingDiv").append("<h2> Hi " + yourName + "! You are Player 1")
		$("#start").hide();
	}

	// If someone else is player one, but there is not player two
	//  then user is player two
	// If player one and player two already taken, input form is hidden
	//  and user would not be able to submit form
	else if ((playerOneExists == true) && (playerTwoExists == false)) {
		you = 2;
		yourName = $('#userInput').val().trim();

		// Save the new player name in Firebase ref('player' + you).
		player2Ref.set({
			'name': yourName,
			'wins': 0,
			'losses': 0
			});

		// Change the HTML to reflect the new player name
		$("#playerTwoDiv").find('h2').html(yourName);
		$("#greetingDiv").html("<h2> Hi " + yourName + "! You are Player 2")
		$("#start").hide();
	};

	// once we have player one and player two, update FB to indicate start of turn 1
	if (playerOneExists && playerTwoExists) fbTurn.set(1);
});  //end of submit form event handler


function reset() {
	$('#resultHere').empty();
	$('#p1Choice').empty();
	$('#p2Choice').empty();
	fbTurn.set(1);
	player1Choice.remove();
	player2Choice.remove();
}



fbTurn.on("value", function(snapshot) {
//  Turn One Actions
	if (snapshot.val()==1) {
		if (you == 1) {
			$('#p1choices').show();
			$('#statusDiv').html("<h2> It's your turn</h2>");
			};

		if (you == 2) {
			$('#statusDiv').html("<h2> Waiting for Player 1's turn</h2>");
		};
	};	

//	Turn Two Actions
	if (snapshot.val()==2) {
		if (you == 2) {
			$('#p2choices').show();
			$('#statusDiv').html("<h2> It's your turn</h2>");
			};

		if (you == 1) {
			$('#statusDiv').html("<h2> Waiting for Player 2's turn</h2>");
		};
	};	

//	Turn Three Actions

	if (snapshot.val()==3) {
		$('#p1Choice').html(p1Choice);
		$('#p2Choice').html(p2Choice);
		$('#statusDiv').html("");

		switch (p1Choice) {
			case "rock":
				if (p2Choice == "rock") winner = "tie";
				if (p2Choice == "scissors") winner = "p1";
				if (p2Choice == "paper") winner = "p2";
				break;
			case "paper":
				if (p2Choice == "rock") winner = "p1";
				if (p2Choice == "scissors") winner = "p2";
				if (p2Choice == "paper") winner = "tie";
				break;
			case "scissors":
				if (p2Choice == "rock") winner = "p2";
				if (p2Choice == "scissors") winner = "tie";
				if (p2Choice == "paper") winner = "p1";
		};

		switch (winner) {
			case "tie":
				$('#resultHere').html("It's a tie!");
				break;
			case "p1":
				$('#resultHere').html("Player One Wins!");
				if (you==1) {
					p1Wins++;
					p2Losses++;
					player1Wins.set(p1Wins);
					player1Losses.set(p2Losses);
				};
				break;
			case "p2":	
				$('#resultHere').html("Player Two Wins!");
				if (you==2) {
					p2Wins++;
					p1Losses++;
					player2Wins.set(p2Wins);
					player1Losses.set(p1Losses);
				};

				break;
		};
	

//  Timer for show results phase
	setTimeout(function(){reset(); }, 8000)
	};	

}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

// event handler for Player 1 selection
// will occur only if user is Player 1

$('#p1choices').on('click','h3', function(){
	p1Choice = $(this).data("choice");
	player1Ref.update({'choice': p1Choice});
	$('#p1choices').hide();
	$('#p1Choice').append('<h2>' + p1Choice + '</h2>');
	fbTurn.set(2);
});

// event handler for Player 2 selection
// will occur only if user is Player 2

$('#p2choices').on('click','h3', function(){
	p2Choice = $(this).data("choice");
	player2Ref.update({'choice': p2Choice});
	$('#p2choices').hide();
	$('#p2Choice').append('<h2>' + p2Choice + '</h2>');
	fbTurn.set(3);
});


//  firebase listener for updates to player 1 choice
//  if user is player 1, the on click handler took care
//  of things - no need for further action.
//  if user is player 2, then Firebase listener updates player 1 choice.
//
player1Choice.on("value", function(snapshot) {
	if (snapshot.exists() && (you==2)) {
		p1Choice = snapshot.val();
	};
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

//  firebase listener for updates to player 2 choice
//  if user is player 2, the on click handler took care
//  of things - no need for further action.
//  if user is player 1, then Firebase listener updates player 2 choice.
//
player2Choice.on("value", function(snapshot) {
	if (snapshot.exists() && (you==1)) {
		p2Choice = snapshot.val();
	};
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

player1Wins.on("value", function(snapshot) {
	if (snapshot.exists()) {
		p1Wins = snapshot.val();
		$('#p1Wins').html(p1Wins);
	}
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});
player1Losses.on("value", function(snapshot) {
	if (snapshot.exists()) {
		p1Losses = snapshot.val();
		$('#p1Losses').html(p1Losses);
	};
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});
player2Wins.on("value", function(snapshot) {
	if (snapshot.exists()) {
		p2Wins = snapshot.val();
		$('#p2Wins').html(p2Wins);
	};
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});
player2Losses.on("value", function(snapshot) {
	if (snapshot.exists()) {
		p2Losses = snapshot.val();
		$('#p2Losses').html(p2Losses);
	};
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

$("#chat").on("submit", function() {
	event.preventDefault();
	var message = $('#userChat').val();
	messages.push(message);
	$('#userChat').val("");
	});

messages.on("child_added", function(snapshot) {
	console.log (snapshot.val());
	$('#chatBox').prepend(snapshot.val() + '<br>');
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

}) // end of document ready