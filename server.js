const http = require('http')
const WebSocket = require('ws')

const delay = time => new Promise(resolve => setTimeout(resolve,time))

const server = new WebSocket.Server({ port: 8000 })
console.log('Game Server Started...')
let counter = 0;
let clientArray = [];
server.on('connection', client => {
	clientArray.push(client);
	client.on('message', async msg => {
		msg = JSON.parse(msg);
		if(msg.type == 'New Game Request'){
			counter += 1;
			if(counter == 2){
				clientArray[0].send(JSON.stringify({
					type: 'Start New Game',
					number: 0,
					turn: 1,
					char: 'O',
					mycolor: '#048A89',
					opcolor: 'grey'
				}));
				clientArray[1].send(JSON.stringify({
					type: 'Start New Game',
					number: 1,
					turn: 0,
					char: 'X',
					mycolor: 'grey',
					opcolor: '#048A89'
				}));
			}
		}else if(msg.type == 'Click Request'){
			clientArray[msg.number].send(JSON.stringify({
				type: 'Click',
				data: msg.matrix,
				col: msg.col,
				row: msg.row,
				turn: 0
			}));
			let otherPlayer = 0;
			if(msg.number == 0){
				otherPlayer = 1;
			}
			clientArray[otherPlayer].send(JSON.stringify({
				type: 'Click',
				data: msg.matrix,
				col: msg.col,
				row: msg.row,
				turn: 1
			}));
		}else if(msg.type == 'Game Finish'){
			clientArray[msg.player].send(JSON.stringify({
				type: 'Game Finish',
				message: 'You Win',
				wins: msg.wins+1,
				opwins: msg.opwins,
			}));
			let otherPlayer = 0;
			if(msg.player == 0){
				otherPlayer = 1;
			}
			clientArray[otherPlayer].send(JSON.stringify({
				type: 'Game Finish',
				message: 'Opponent Wins',
				wins: msg.wins,
				opwins: msg.opwins+1
			}));
		}
	})
	console.log('A client connected...');
})