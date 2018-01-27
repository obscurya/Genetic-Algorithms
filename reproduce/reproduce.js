function color(rgba) {
    return 'rgba(' + rgba[0] + ', ' + rgba[1] + ', ' + rgba[2] + ', ' + rgba[3] / 255 + ')';
}

function random(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

function randomColor(alpha, min) {
    var rgba = [];

    for (var i = 0; i < 3; i++) {
        rgba[i] = (min) ? random(min, 255) : random(0, 255);
    }

    rgba.push(alpha);

    return color(rgba);
}

function clear(canvas, ctx) {
    ctx.fillStyle = color([255, 255, 255, 255]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Polygon {
    constructor(dna) {
        if (dna) {
            this.dna = dna;
        } else {
            this.dna = [];

            for (var i = 0; i < 3; i++) {
                this.dna.push(255);
            }

            this.dna.push(0);
            // this.dna.push(255);

            for (var i = 0; i < vertices; i++) {
                this.dna.push(random(0, width), random(0, height));
            }
        }
    }

    draw(ctx, scale) {
        ctx.fillStyle = color([this.dna[0], this.dna[1], this.dna[2], this.dna[3]]);

        ctx.beginPath();
        ctx.moveTo(this.dna[4] * scale, this.dna[5] * scale);
        for (var j = 6; j < this.dna.length; j += 2) {
            ctx.lineTo(this.dna[j] * scale, this.dna[j + 1] * scale);
        }
        ctx.closePath();
        ctx.fill();
    }

    getDna() {
        return this.dna.slice();
    }
}

function create() {
    for (var i = 0; i < polygonsCount; i++) {
        polygons.push(new Polygon);
    }
    polygons.fitness = 0;
}

function mutate() {
    var tmp = [],
        index = random(0, polygons.length - 1),
        dnaIndex = random(0, polygons[0].dna.length - 1);

    for (var i = 0; i < polygons.length; i++) {
        tmp.push(new Polygon(polygons[i].getDna()));
    }

    if (dnaIndex < 4) {
        tmp[index].dna[dnaIndex] = random(0, 255);
    } else {
        if (dnaIndex % 2 == 0) {
            tmp[index].dna[dnaIndex] = random(0, width);
        } else {
            tmp[index].dna[dnaIndex] = random(0, height);
        }
    }

    for (var i = 0; i < tmp.length; i++) {
        tmp[i].draw(mutationCtx, 1);
    }

    tmp.fitness = getFitness(tmp);

    if (tmp.fitness >= polygons.fitness) {
        if (tmp.fitness > polygons.fitness) {
            fitnesses.push(tmp.fitness);
        }
        polygons = tmp;
    }

    mutations++;
}

function getFitness(array) {
    var data = mutationCtx.getImageData(0, 0, width, height).data,
        sum = 0;

    for (var i = 0; i < imgData.length; i++) {
        if (imgData[i] == data[i]) {
            sum += 1;
        } else {
            sum += (imgData[i] > data[i]) ? (data[i] / imgData[i]) : (imgData[i] / data[i]);
        }
    }

    sum /= imgData.length;

    return sum;
}

function drawGraph(ctx) {
    var step = graphCanvas.width / fitnesses.length,
        index = 0;

    ctx.lineWidth = 4;
    ctx.strokeStyle = color([0, 0, 255, 255 / 4]);

    ctx.beginPath();
    ctx.moveTo(-100, graphCanvas.height);
    for (var i = 0; i < graphCanvas.width; i += step) {
        ctx.lineTo(i, graphCanvas.height * (1 - fitnesses[index]));
        index++;
    }
    ctx.stroke();
    ctx.closePath();

    var time = mutations / 60 * 1000,
        days = Math.floor(time / (1000 * 60 * 60 * 24)),
        hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)),
        seconds = Math.floor((time % (1000 * 60)) / 1000);

    var text = [];

    text.push('Fitness: ' + (polygons.fitness * 100).toFixed(2) + '%');
    text.push('Improvements: ' + fitnesses.length);
    text.push('Mutations: ' + mutations);
    text.push('Polygons: ' + polygonsCount);
    text.push('Vertices: ' + vertices);
    text.push('Time: ' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's');

    ctx.fillStyle = color([0, 0, 0, 255]);
    ctx.font = '16px sans-serif';

    var y = 30;

    for (var i = 0; i < text.length; i++) {
        ctx.fillText(text[i], 10, y);
        y += 20;
    }
}

function draw() {
    animation = undefined;

    clear(mutationCanvas, mutationCtx);
    clear(resultCanvas, resultCtx);
    clear(graphCanvas, graphCtx);

    mutate();

    for (var i = 0; i < polygons.length; i++) {
        polygons[i].draw(resultCtx, scale);
    }

    drawGraph(graphCtx);

    if (polygons.fitness < 1) animation = requestAnimationFrame(draw);
}

var originalCanvas = document.getElementById('original'),
    mutationCanvas = document.getElementById('mutation'),
    resultCanvas = document.getElementById('result'),
    graphCanvas = document.getElementById('graph');

var originalCtx = originalCanvas.getContext('2d'),
    mutationCtx = mutationCanvas.getContext('2d'),
    resultCtx = resultCanvas.getContext('2d'),
    graphCtx = graphCanvas.getContext('2d');

var animation;

var width,
    height,
    scale;

var img,
    imgData;

var polygons,
    polygonsCount,
    vertices;

var fitnesses,
    mutations;

function start() {
    if (animation) {
        cancelAnimationFrame(animation);
    }

    img = new Image();

    img.onload = function () {
        width = 100;
        height = 100;
        scale = Number(document.getElementById('scale').value);
        imgData = [];
        polygons = [];
        polygonsCount = Number(document.getElementById('polygonsCount').value);
        vertices = Number(document.getElementById('vertices').value);
        fitnesses = [];
        mutations = 0;

        var imgRatio = img.width / img.height;

        if (imgRatio > 1) {
            height = width / imgRatio;
        } else {
            height = height / imgRatio;
        }

        originalCanvas.width = mutationCanvas.width = width;
        originalCanvas.height = mutationCanvas.height = height;
        resultCanvas.width = width * scale;
        resultCanvas.height = height * scale;
        graphCanvas.width = 500;
        graphCanvas.height = 200;

        clear(originalCanvas, originalCtx);

        originalCtx.drawImage(img, 0, 0, width, height);
        imgData = originalCtx.getImageData(0, 0, width, height).data;

        create();

        animation = requestAnimationFrame(draw);
    };

    var file = document.getElementById('imgLoad').files[0],
        reader = new FileReader();

    reader.onloadend = function () {
        img.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        img.src = String(document.getElementById('imgURL').value);
    }
}
