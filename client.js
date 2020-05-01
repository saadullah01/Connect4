// Page 2 Text
var text = "";
for (var i = 1; i <= 7; i++) {
	text += `<div id='uppercol${i}' class='uppercol' v-on:mouseover='colorCheckIn(${i-1})' v-on:mouseout='colorCheckOut(${i-1})'><div id='ball${i}' class='ball' v-bind:style="{'background-color' : ballcolor[${i-1}]}"></div><div v-on:click='columnClicked(${i-1})' id='col${i}' class='col' v-bind:style="{'background-color' : colColor[${i-1}]}">`;
	for (var j = 1; j <= 6; j++) {
		var temp = (i*10) + j;
		text += `<div id='row${j}' class='row'><div id='rowinside${temp}' class='rowinside' v-bind:style="{'background-color' : rowcolor[${i-1}][${j-1}]}"></div></div>`;
	}
	text += `</div></div>`;
}
// Framework
new Vue({
	template: `
		<div v-if="page == 1" class="root1">
			<div class="subroot1">
				<div class="header">
					<div class="round"><p>C4</p></div>
					<p class="heading">Connect 4</p>
				</div>
				<div class="design">
					<div class="b1"><p class="b1p">1</p></div>
					<div class="b2"><p class="b2p">2</p></div>
					<div class="b3"><p class="b3p">4</p></div>
					<div class="b4"><p class="b4p">3</p></div>
				</div>
			</div>
			<div class="subroot2">
				<div class="des">
					<div class="description">
						<p>Come & Show the World Your Skills</p>
					</div>
					<div class="options">
						<button v-on:click='newGame' class="bt1">New Game</button>
						<button class="bt2">Watch Other Games</button>
					</div>
				</div>
				<div class="login">
					<p class="loginP">Log In</p>
					<div class="in">
						<p class="userP">Username</p>
						<input class="username" type="text" v-model="username" placeholder="Enter Username Here..." />
						<p class="passP">Password</p>
						<input class="password" type="password" v-model="password" placeholder="Enter Password Here..." />
						<button class="btn">Log In</button>
					</div>
				</div>
			</div>
		</div>
		<div v-else-if="page == 2" class='root2' v-bind:style="{'pointer-events' : access}">
			<div class="player1" v-bind:style="{'background-color' : mycolor, 'border-color' : mycolor, 'opacity' : myopacity}"><img src="profile.png" width="125px" height="125px"/><p>You</p></div>
			<div id="container">${text}</div>
			<div class="player2" v-bind:style="{'background-color' : opcolor, 'border-color' : opcolor, 'opacity' : opopacity}"><img src="profile.png" width="125px" height="125px"/><p>Opponent</p></div>
			<div class="scoreBoard" v-bind:style="{'background-color' : mycolor}"><p>{{wins}} &nbsp&nbsp&nbsp - &nbsp&nbsp&nbsp {{opwins}}</p></div>
			<div v-if="end == 1" class="winlose" v-bind:style="{'background-color' : mycolor}"><p>{{message}}</p></div>
		</div>
	`,
	data: {
		ballcolor: new Array(7).fill('rgba(0,0,0,0)'),
		rowcolor: new Array(7).fill('white').map(() => new Array(6).fill('white')),
		colColor: new Array(7).fill('#E5FBF9'),
		message: 'You Win',
		mycolor: '',
		opcolor: '',
		myopacity: 1,
		opopacity: 1,
		access: 'none',
		page: 1,
		username: '',
		password: '',
		turn: 0,
		char: '',
		wins: 0,
		opwins: 0,
		end: 0,
		number: undefined,
		matrix: new Array(7).fill('*').map(() => new Array(6).fill('*')),
		ws: new WebSocket('ws://localhost:8000')
	},
	methods: {
		newGame(){
			alert('Waiting for your opponent...');
			this.ws.send(JSON.stringify({
				type: 'New Game Request'
			}));
		},
		columnClicked(x) {
			if(this.turn == 1){
				let row = 0;
				for(var i = 5; i >= 0; i--){
					if(this.matrix[x][i] == '*'){
						this.matrix[x][i] = this.char;
						row = i;
						break;
					}
				}
				this.ws.send(JSON.stringify({
					type: 'Click Request',
					col: x,
					row: row,
					matrix: this.matrix,
					turn: this.turn,
					number: this.number
				}));
			}
		},
		updateMatrix(col, row) {
			// Traverse down in (col) through (0 - row).....
			if(this.turn == 1){
				this.rowcolor[col].splice(row,1,this.mycolor);
			}else{
				this.rowcolor[col].splice(row,1,this.opcolor);
			}
			if(this.turn == 1){
				this.checkWin(col,row);
			}
		},
		colHover(col) {
			let row = 0;
			for(var i = 5; i >= 0; i--){
				if(this.matrix[col][i] == '*'){
					row = i;
					break;
				}
			}
			if (this.char == 'X') {
				this.matrix[col][row] = 'X';
			}else{
				this.matrix[col][row] = 'O';
			}
			// Player Check
			let counter_P = 0;
			if(this.horizontalCheck(col,row) == true){
				this.matrix[col][row] = '*';
				counter_P++;
			}if(this.verticalCheck(col, row) == true){
				this.matrix[col][row] = '*';
				counter_P++;
			}if(this.rightDiagonalCheck(col, row) == true){
				this.matrix[col][row] = '*';
				counter_P++;
			}if(this.leftDiagonalCheck(col, row) == true){
				this.matrix[col][row] = '*';
				counter_P++;
			}
			if(counter_P > 0){
				return 'green';
			}else{
				this.matrix[col][row] = '*';
			}
			// Opponent Check
			let counter_O = 0;
			for (var j = 0; j < 7; j++) {
				if(j == col){
					continue;
				}
				row = 0;
				for(var i = 5; i >= 0; i--){
					if(this.matrix[j][i] == '*'){
						row = i;
						break;
					}
				}
				let opponent = 'O', me = 'X';
				if (this.char == 'O') {
					opponent = 'X';
					me = 'O';
				}
				this.char = opponent;
				this.matrix[j][row] = this.char;
				if(this.horizontalCheck(j,row) == true){
					this.char = me;
					this.matrix[j][row] = '*';
					counter_O++;
				}if(this.verticalCheck(j, row) == true){
					this.char = me;
					this.matrix[j][row] = '*';
					counter_O++;
				}if(this.rightDiagonalCheck(j, row) == true){
					this.char = me;
					this.matrix[j][row] = '*';
					counter_O++;
				}if(this.leftDiagonalCheck(j, row) == true){
					this.char = me;
					this.matrix[j][row] = '*';
					counter_O++;
				}
				if (counter_O > 0) {
					return 'red';
				}else{
					this.char = me;
					this.matrix[j][row] = '*';
				}
			}
			// None
			if (this.char == 'X') {
				return 'lightgrey';
			}else{
				return 'MEDIUMAQUAMARINE';
			}
		},
		colorCheckIn(x) {
			// Col Color
			let result;
			if(this.char == 'X'){
				result = 'lightgrey';
			}else{
				result = 'MEDIUMAQUAMARINE';
			}
			if (this.turn == 1) {
				result = this.colHover(x);
			}
			this.colColor.splice(x,1,result);
			// Balls Color
			if(this.char == 'X'){
				this.ballcolor.splice(x,1,'grey');
			}else{
				this.ballcolor.splice(x,1,'#048A89');
			}
		},
		colorCheckOut(x) {
			this.ballcolor.splice(x,1,'rgba(0,0,0,0)');
			this.colColor.splice(x,1,'#E5FBF9');
		},
		checkWin(col,row) {
			if(this.horizontalCheck(col,row) == true){
				this.gameEnd();
			}else if(this.verticalCheck(col, row) == true){
				this.gameEnd();
			}else if(this.rightDiagonalCheck(col, row) == true){
				this.gameEnd();
			}else if(this.leftDiagonalCheck(col, row) == true){
				this.gameEnd();
			}
		},
		horizontalCheck(col,row) {
			let counter = 0;
			for (var i = 0; i < 7; i++) {
				if(this.matrix[i][row] == this.char){
					counter++;
					if (counter == 4) {
						return true;
						break;
					}
				}else{
					counter = 0;
				}
			}
			return false;
		},
		verticalCheck(col, row) {
			let counter = 0;
			for (var i = 0; i < 6; i++) {
				if(this.matrix[col][i] == this.char){
					counter++;
					if (counter == 4) {
						return true;
						break;
					}
				}else{
					counter = 0;
				}
			}
			return false;
		},
		rightDiagonalCheck(col, row) {
			let counter = 0;
			while(col > 0 && row < 6){
				col--;
				row++;
			}
			while(col < 7 && row >= 0){
				if(this.matrix[col][row] == this.char){
					counter++;
					if(counter == 4){
						return true;
						break;
					}
				}else{
					counter = 0;
				}
				col++;
				row--;
			}
			return false;
		},
		leftDiagonalCheck(col, row) {
			let counter = 0;
			while(col > 0 && row > 0){
				col--;
				row--;
			}
			while(col < 7 && row < 6){
				if(this.matrix[col][row] == this.char){
					counter++;
					if(counter == 4){
						return true;
						break;
					}
				}else{
					counter = 0;
				}
				col++;
				row++;
			}
			return false;
		},
		gameEnd() {
			console.log('Game Finish')
			this.ws.send(JSON.stringify({
				type: 'Game Finish',
				player: this.number,
				wins: this.wins,
				opwins: this.opwins
			}));
		}
	},
	mounted() {
		//this.page = 2;
		//this.end = 1;
		this.ws.onmessage = response => {
			response = JSON.parse(response.data);
			// Start New Game
			if(response.type == 'Start New Game'){
				this.page = 2;
				this.turn = response.turn;
				if (this.turn == 1) {
					this.opopacity = 0.5;
					this.access = 'auto';
				}else{
					this.myopacity = 0.5;
					this.access = 'none';
				}
				this.char = response.char;
				this.number = response.number;
				this.mycolor = response.mycolor;
				this.opcolor = response.opcolor;
			}
			// On Click
			else if(response.type == 'Click'){
				this.matrix = response.data;
				this.updateMatrix(response.col,response.row);
				this.turn = response.turn;
				if (this.turn == 1) {
					this.opopacity = 0.5;
					this.myopacity = 1;
					this.access = 'auto';
				}else{
					this.myopacity = 0.5;
					this.opopacity = 1;
					this.access = 'none';
				}
			}
			// Game End
			else if(response.type == 'Game Finish'){
				this.message = response.message;
				this.wins = response.wins;
				this.opwins = response.opwins;
				this.access = 'none';
				this.end = 1;
				this.myopacity = 1;
				this.opopacity = 1;
			}
		}
	}
}).$mount('#root')