const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const row = 50;
const column = 50;

let maze;
let framerates =  60;
function init(){

  setupCanvas();

 
  maze = new Maze(row, column);
}

function setupCanvas(){
  canvas.width = 800;
  canvas.height = 800;
}

function clearCanvas(){
  context.clearRect(0, 0, canvas.width, canvas.height);

}

function start(){
  maze.generate();
}

function restart(){
  maze.setup();
  //maze.generate();
}

class Cell {
  constructor(rowNumber, columnNumber, cellWidth, cellHeigth) {
    this.rowNumber = rowNumber;
    this.columnNumber = columnNumber;
    this.width = cellWidth;
    this.height = cellHeigth;
    this.x = columnNumber * cellWidth;
    this.y = rowNumber * cellHeigth;
    this.visited = false;
    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
  }

  get getRowNumber(){
    if(this.rowNumber >=0){
      return this.rowNumber;
    }
  }

  get getColumnNumber(){
    if(this.columnNumber >=0){
      return this.columnNumber;
    }
  }

  show(){
    if (this.walls.top) {
      this.drawTopWall();
    }

    if (this.walls.right) {
      this.drawRightWall();
    }
    if (this.walls.bottom) {
      this.drawBottomWall();
    }
    if (this.walls.left) {
      this.drawLeftWall();
    }
    context.lineWidth = 1;

    context.strokeStyle = 'black'
  }

  drawTopWall(){

    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.width, this.y);
    context.stroke();
  }

  drawRightWall(){
    context.beginPath();
    context.moveTo(this.x + this.width, this.y);
    context.lineTo(this.x + this.width, this.y + this.height);
    context.stroke();
  }

  drawBottomWall(){
    context.beginPath();
    context.moveTo(this.x + this.width, this.y + this.height);
    context.lineTo(this.x, this.y + this.height);
    context.stroke();
  }

  drawLeftWall(){
    context.beginPath();
    context.moveTo(this.x, this.y + this.height);
    context.lineTo(this.x,this.y);
    context.stroke();
  }

  highlight(){
    let scaleW = this.width/10;
    let scaleH = this.height/10;
    
    context.fillStyle = 'red';
    context.fillRect(this.x + scaleW, this.y + scaleH,this.width - scaleW*2,this.height - scaleH*2);
  }


  destroy(){
    context.fillStyle = 'pink';
    context.fillRect(this.x,this.y, this.width + 1, this.height+1);
  }
  
  
}

class Grid {
  constructor(row, column){
    this.row = row;
    this.column = column;
    this.cells = undefined;
  }

  generateCells() {
    let cells = [];
    let cellWidth = context.canvas.width / this.column;
    let cellHeigth = context.canvas.height / this.row;
    for(let r = 0; r < this.row; r++){
      for(let c = 0; c < this.column; c++){
        let cell = new Cell(r,c, cellWidth, cellHeigth);
        cells.push(cell);
      }
    }
    this.cells = cells;
  }

  show(){

    clearCanvas();
    setupCanvas();
    for(let i = 0; i < this.cells.length; i++){
      this.cells[i].show();
    }
    
  }

  

  selectRandomCell(){
    let randomIndex = (Math.floor(Math.random() * this.cells.length));
    return this.cells[randomIndex];
  }

  selectCellByIndex(index){
    return this.cells[index];
  }

}

class Maze{
  constructor(row, column){
    this.grid = new Grid(row, column);
    this.current = undefined;
    this.stack = [];

  }

  setup(){
    this.grid.generateCells();
    this.grid.show();
    this.current = this.grid.selectRandomCell();
    this.current.visited = true;
    this.stack.push(this.current);

  }

  generate(){
    this.current.destroy();
    this.current.show();

    if(this.stack.length > 0){

      this.current = this.stack.pop();
      let neighbours = this.getNeighbours( this.current);
     
      if(neighbours.length > 0){
        this.stack.push(this.current);
        let chosenNeighbour = this.getRandomNeighbour(neighbours);
        this.removeWalls( this.current, chosenNeighbour);
        chosenNeighbour.visited = true;
        this.stack.push(chosenNeighbour);
        this.current.highlight();
      }
    }
    else if(this.stack.length === 0) { return; }

    setTimeout(() => this.generate(), 1000/framerates);

  }

  getRandomNeighbour(neighbours){
    if(neighbours.length > 0){
      return neighbours[Math.floor(Math.random() * neighbours.length)];
    }
  }

  getNeighbours(current){
    let neighbours = [];
    if(current == undefined) { return neighbours;}

    let top = this.getTopNeighbour(current);
    let rigth = this.getRightNeighbour(current);
    let bottom = this.getBottomNeighbour(current);
    let left = this.getLeftNeighbour(current);

    if(top && !top.visited){
      neighbours.push(top);
    }

    if(rigth && !rigth.visited){
      neighbours.push(rigth);
    }

    if(bottom && !bottom.visited){
      neighbours.push(bottom);
    }

    if(left && !left.visited){
      neighbours.push(left);
    }

    return neighbours;
  }

  getTopNeighbour(current){
    let index = this.getCellIndex(current.getColumnNumber, current.getRowNumber - 1);
    return this.grid.selectCellByIndex(index);
  }

  getRightNeighbour(current){
    let index = this.getCellIndex(current.getColumnNumber + 1, current.getRowNumber);
    return this.grid.selectCellByIndex(index);
  }

  getBottomNeighbour(current){
    let index = this.getCellIndex(current.getColumnNumber,current.getRowNumber + 1);
    return this.grid.selectCellByIndex(index);
  }

  getLeftNeighbour(current){
    let index = this.getCellIndex(current.getColumnNumber - 1, current.getRowNumber);
    return this.grid.selectCellByIndex(index);
  }



  getCellIndex(column, row){
    if (column < 0 || row < 0 || column > this.grid.column - 1 || row > this.grid.row - 1) {
      return -1;
    }
    return column + row * this.grid.column;
  }

  removeWalls(current, neighbour){
    if(!current || !neighbour){
      return;
    }

    let x = current.getColumnNumber - neighbour.getColumnNumber;

    if(x == 1){
      current.walls.left = false;
      neighbour.walls.right = false;
    }
    else if(x == -1){
      current.walls.right = false;
      neighbour.walls.left = false;
    }

    let y = current.getRowNumber - neighbour.getRowNumber;

    if(y== 1){
      current.walls.top = false;
      neighbour.walls.bottom = false;
    }
    else if(y == -1){
      current.walls.bottom = false;
      neighbour.walls.top = false;
    }
  }


}

init();
maze.setup();

