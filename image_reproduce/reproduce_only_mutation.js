function clear(canv, ctx) {
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function random(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function color(r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

var canvas = [],
    c = [],
    width = 100,
    height = 100,
    scale = 6;

var img = new Image(),
    imgData = [],
    imgPixels = [];

var polygonsNumber = 50,
    vertices = 6,
    polygons = [],
    startTime;

function Polygon(dna) {
    if (dna) {
        this.dna = dna;
    } else {
        var color = random(0, 255);
        this.dna = [];

        for (var i = 0; i < 4; i++) {
            this.dna.push(color);
        }

        for (var i = 0; i < vertices; i++) {
            this.dna.push(random(0, width));
            this.dna.push(random(0, height));
        }
    }
}

function draw(canv, ctx, array, sc) {
    clear(canv, ctx);

    if (sc) {
        sc = scale;
    } else {
        sc = 1;
    }

    for (var i = 0; i < array.length; i++) {
        var dna = array[i].dna;

        ctx.beginPath();
        ctx.fillStyle = color(dna[0], dna[1], dna[2], dna[3] / 255);
        ctx.moveTo(dna[4] * sc, dna[5] * sc);
        for (var j = 6; j < dna.length; j += 2) {
            ctx.lineTo(dna[j] * sc, dna[j + 1] * sc);
        }
        ctx.closePath();
        ctx.fill();
    }
}

function getPixels(array) {
    var pixels = [];

    var x = 0,
        y = 0;

    for (var i = 0; i < array.length; i += 4) {
        var pixel = {};

        pixel.x = x;
        pixel.y = y;
        pixel.r = array[i];
        pixel.g = array[i + 1];
        pixel.b = array[i + 2];
        pixel.alpha = array[i + 3];
        pixel.average = (pixel.r + pixel.g + pixel.b) / 3;

        pixels.push(pixel);

        x++;

        if (x >= width) {
            x = 0;
            y++;
        }
    }

    return pixels;
}

function getFitness(canv, ctx, array) {
    draw(canv, ctx, array, false);

    var data = c[1].getImageData(0, 0, width, height).data,
        pixels = getPixels(data),
        sum = 0;

    for (var i = 0; i < pixels.length; i++) {
        var p1 = pixels[i],
            p2 = imgPixels[i],
            s = 0;

        if (p1.r > p2.r) {
            s += (p1.r == 0) ? 0 : (1 - (p1.r - p2.r) / p1.r);
        } else {
            s += (p2.r == 0) ? 0 : (1 - (p2.r - p1.r) / p2.r);
        }

        if (p1.g > p2.g) {
            s += (p1.g == 0) ? 0 : (1 - (p1.g - p2.g) / p1.g);
        } else {
            s += (p2.g == 0) ? 0 : (1 - (p2.g - p1.g) / p2.g);
        }

        if (p1.b > p2.b) {
            s += (p1.b == 0) ? 0 : (1 - (p1.b - p2.b) / p1.b);
        } else {
            s += (p2.b == 0) ? 0 : (1 - (p2.b - p1.b) / p2.b);
        }

        sum += s / 3;

        // if (pixels[i].average > imgPixels[i].average) {
        //     sum += (pixels[i].average == 0) ? 0 : (1 - (pixels[i].average - imgPixels[i].average) / pixels[i].average);
        // } else {
        //     sum += (imgPixels[i].average == 0) ? 0 : (1 - (imgPixels[i].average - pixels[i].average) / imgPixels[i].average);
        // }
    }

    sum /= pixels.length;

    delete data;
    return sum;
}

function create() {
    for (var i = 0; i < polygonsNumber; i++) {
        polygons.push(new Polygon);
    }

    polygons.fitness = getFitness(canvas[1], c[1], polygons);
    fit.push(polygons.fitness);
}

function mutate() {
    var i = random(0, polygons.length - 1);

    var tmp = [];

    for (var n = 0; n < polygons.length; n++) {
        var dna = polygons[n].dna.slice();

        tmp.push(new Polygon(dna));
    }

    var j = random(0, tmp[0].dna.length - 1);

    if (j < 4) {
        tmp[i].dna[j] = random(0, 255);
    } else {
        if (j % 2 == 0) {
            tmp[i].dna[j] = random(0, width);
        } else {
            tmp[i].dna[j] = random(0, height);
        }
    }

    tmp.fitness = getFitness(canvas[1], c[1], tmp);

    if (tmp.fitness > polygons.fitness) {
        polygons = tmp;
        fit.push(polygons.fitness);
        improvements++;
    }

    mutations++;
}

var improvements = 0,
    mutations = 0,
    div = document.getElementById('stats');

var graph = document.getElementById('graph'),
    g = graph.getContext('2d'),
    fit = [];

function clearGraph() {
    g.clearRect(0, 0, graph.width, graph.height);
    g.fillStyle = '#fff';
    g.fillRect(0, 0, graph.width, graph.height);
}

function drawGraph() {
    clearGraph();

    var now = new Date().getTime(),
        distance = now - startTime,
        days = Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var step = graph.width / fit.length,
        i = 0;

    g.beginPath();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    g.moveTo(-100, graph.height);
    for (var x = 0; x < graph.width; x += step) {
        var y = graph.height - graph.height * fit[i];
        g.lineTo(x, y);
        i++;
    }
    g.stroke();
    g.closePath();

    g.beginPath();
    g.fillStyle = '#000';
    g.font = '16px sans-serif';
    g.fillText('Fitness: ' + (polygons.fitness * 100).toFixed(2) + '%', 10, 20);
    g.fillText('Improvements: ' + improvements, 10, 40);
    g.fillText('Mutations: ' + mutations, 10, 60);
    g.fillText('Polygons: ' + polygonsNumber, 10, 80);
    g.fillText('Vertices: ' + vertices, 10, 100);
    g.fillText('Time: ' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's', 10, 120);
    g.closePath();
}

img.onload = function () {

    var imgRatio = img.width / img.height,
        canvasRatio = width / height;

    if (imgRatio > canvasRatio) {
        height = width / imgRatio;
    } else {
        height = height / imgRatio;
    }

    for (var i = 0; i < 3; i++) {
        canvas[i] = document.getElementById('canvas' + i);
        c[i] = canvas[i].getContext('2d');

        canvas[i].width = width;
        canvas[i].height = height;

        if (i == 2) {
            canvas[i].width = width * scale;
            canvas[i].height = height * scale;
        }

        clear(canvas[i], c[i]);
    }

    graph.width = 500;
    graph.height = 300;

    c[0].drawImage(img, 0, 0, width, height);
    imgData = c[0].getImageData(0, 0, width, height).data;
    imgPixels = getPixels(imgData);

    startTime = new Date();

    create();

    setInterval(function () {

        mutate();
        draw(canvas[2], c[2], polygons, true);
        drawGraph();

    }, 0);

}

img.src = 'stone.jpg';
