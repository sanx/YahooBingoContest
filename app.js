var libsocket = require('socket.io-client'),
    util = require('util');

var payload = {
	name: 'Gerardo Moad',
	email: 'germoad@yahoo-inc.com',
	url: 'https://github.com/sanx/YahooBingoContest'
	},
    activeCard = undefined;
    activeMarks = undefined;
    client = libsocket.connect('ws://yahoobingo.herokuapp.com');

client.on('connect', function () {
    client.emit('register', payload);
});

client.on('card', function (card) {
    activeCard = card;
    activeMarks = card;
	console.log("got new card!");
	prettyPrintCard(activeMarks);
});

var markCard = function (number, card) {
    var numberComponents = number.match(/(\w)(\d+)/),
        nLetter = numberComponents[1],
        nNumber = numberComponents[2];
	console.log(util.format("checking %s %d", nLetter, nNumber));
    card.slots[nLetter].forEach(function (number, idx) {
        if (parseInt(number, 10) === parseInt(nNumber, 10)) {
            card.slots[nLetter][idx] = 'X';
			console.log("marked it!");
        }
    });
};

var checkWin = function (card) {
    var width = 5,
        height = 5;
    // let's check horizontals
    for (letter in card.slots) {
        if (!card.slots.hasOwnProperty(letter)) {
            continue;
        }
        var row = card.slots[letter],
            won = true;
        row.forEach(function (number) {
            if ('X' !== number) {
                won = false;
                return;
            }
        });
        if (true === won) {
            return true;
        }
    }
    // let's check verticals
    for (var i = 0; i < 5; i += 1) {
        var won = true;
        for (letter in card.slots) {
            if (!card.slots.hasOwnProperty(letter)) {
                continue;
            }
            var number = card.slots[letter][i];
            if ('X' !== number) {
                won = false;
                break;
            }
        }
        if (true === won) {
            return true;
        }
    }
    // let's check top left -> bottom right
    if ('X' === card.slots.B[0] &&
        'X' === card.slots.I[1] &&
        'X' === card.slots.N[2] &&
        'X' === card.slots.G[3] &&
        'X' === card.slots.O[4]) {
        return true;
    }
    // let's check bottom left -> top right
    if ('X' === card.slots.B[4] &&
        'X' === card.slots.I[3] &&
        'X' === card.slots.N[2] &&
        'X' === card.slots.G[1] &&
        'X' === card.slots.O[0]) {
        return true;
    }

    return false
};

var prettyPrintCard = function (card) {
    var out = "{ ";
    for (letter in card.slots) {
        out += " " + letter + ":";
        if (!card.slots.hasOwnProperty(letter)) {
            continue;
        }
        var row = card.slots[letter];
        out += row.join(',') + ",\n";
    }
    out += " }";
    console.log(util.format("{ slots:\n %s }", out));
};

client.on('number', function (number) {
    console.log(number);
    markCard(number, activeMarks);
    prettyPrintCard(activeMarks);
    if (checkWin(activeMarks)) {
        console.log("we're claiming bingo!");
        client.emit('bingo');
    }
});

client.on('win', function (msg) {
    console.log('got a win from the server with message: ' + msg);
});

client.on('lose', function (msg) {
    console.log('got a lose from the server with message: ' + msg);
});

client.on('disconnect', function () {
    console.log("disconnected from server!");
    process.exit(0);
});


/* vim: set ai expandtab tabstop=4 shiftwidth=4 softtabstop=4 filetype=javascript : */
