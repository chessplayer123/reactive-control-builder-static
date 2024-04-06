let canvas
let ctx

let testData = [
    {
        id: 1,
        text_1: "Root",
        father: null,
        selected: true,
        subselected: false, 
    },
    {
        id: 2,
        text_1: "Child1",
        father: 1,
        selected: false,
        subselected: false, 
    },
    {
        id: 3,
        text_1: "Child2",
        father: 1,
        selected: false,
        subselected: false, 
    },
];

function newPoint(x, y) {
    return {x: x, y: y};
}

function build() {
    const output = document.getElementById("output");
    canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    output.appendChild(canvas);
    ctx = canvas.getContext("2d");
    draw(1);
}

function drawLine(from, to, color) {
    ctx.strokeStyle = color

    ctx.moveTo(from.x, from.x);
    ctx.lineTo(to.x, to.y);

    ctx.stroke();
}

function drawRect(left, top, width, height, fill="white", outline="black") {
    ctx.fillStyle = fill;
    ctx.fillRect(left, top, width, height);
    ctx.strokeStyle = outline;
    ctx.strokeRect(left, top, width, height);
}

function drawHorizontalArrow(y, from, to, thickness, outline="black") {
    let dx = to - from;
    ctx.strokeStyle = outline;
    ctx.fillStyle = "white"

    ctx.beginPath();
    ctx.moveTo(from, y - thickness * 0.5);
    ctx.lineTo(from + dx * 0.75, y - thickness * 0.5);
    ctx.lineTo(from + dx * 0.75, y - thickness);
    ctx.lineTo(to, y);
    ctx.lineTo(from + dx * 0.75, y + thickness);
    ctx.lineTo(from + dx * 0.75, y + thickness * 0.5);
    ctx.lineTo(from, y + thickness * 0.5);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();
}

function drawText(text, centerX, centerY) {
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillStyle = "#000000"
    ctx.font = "48px arial"

    ctx.fillText(text, centerX, centerY, 50)
}

function drawVerticalArrow(x, from, to, thickness, outline="black") {
    let dy = to - from;
    ctx.strokeStyle = outline;
    ctx.fillStyle = "white"

    ctx.beginPath()
    ctx.moveTo(x - thickness * 0.5, from)
    ctx.lineTo(x - thickness * 0.5, from + dy * 0.75)
    ctx.lineTo(x - thickness, from + dy * 0.75)
    ctx.lineTo(x, to);
    ctx.lineTo(x + thickness, from + dy * 0.75)
    ctx.lineTo(x + thickness * 0.5, from + dy * 0.75)
    ctx.lineTo(x + thickness * 0.5, from)
    ctx.closePath();

    ctx.stroke()
    ctx.fill();
}

function drawBottomBlock(left, top, width, height) {
    drawRect(left, top, width, height);
    drawVerticalArrow(left+width/10, top+height/2, top-height/2, 10)
    drawVerticalArrow(left+width-width/10, top-height/2, top+height/2, 10)

    drawText("МО", left+width/2, top+height/2)
}

function drawEntireBlock(left, top, width, height) {
    const masterLeft = left + width/4;
    const masterTop = top;
    const masterWidth = width/2;
    const masterHeight = height/2;

    drawRect(masterLeft, masterTop, masterWidth, masterHeight, fill="yellow");
    drawHorizontalArrow(masterTop + masterHeight/2, left, masterLeft, masterHeight*0.14);
    drawHorizontalArrow(masterTop + masterHeight/2, masterLeft+masterWidth, left+width, masterHeight*0.14);
    drawBottomBlock(masterLeft+masterWidth*0.05, masterTop + masterHeight, masterWidth*0.9, masterHeight);
    drawText("МУ", masterLeft+masterWidth/2, masterTop+masterHeight/2);
}


function draw(rootId) {
    drawEntireBlock(50, 50, 500, 500)
}