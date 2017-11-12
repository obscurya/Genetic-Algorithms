function random(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function color(r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

var canvas = document.getElementById('canvas'),
    bestCanvas = document.getElementById('best'),
    original = document.getElementById('original'),
    c = canvas.getContext('2d'),
    b = bestCanvas.getContext('2d'),
    o = original.getContext('2d'),
    div = document.getElementById('fitness');

function clear(canv, ctx) {
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function Polygon(genes) {
    var color = random(0, 255);

    this.color = [];
    this.shape = [];

    for (var i = 0; i < 4; i++) {
        this.color.push(color);
    }

    for (var i = 0; i < vertices; i++) {
        this.shape.push(random(0, canvas.width));
        this.shape.push(random(0, canvas.height));
    }
}

function calcFitness() {
    var newImgPixels = getPixels(c.getImageData(0, 0, canvas.width, canvas.height).data),
        sum = 0;

    for (var i = 0; i < imgPixels.length; i++) {
        var pixel = imgPixels[i],
            newPixel = newImgPixels[i],
            newSum = 0;

        for (var j = 0; j < pixel.length; j++) {
            var arr = [pixel[j], newPixel[j]];

            arr.sort(function (a, b) {
                return b - a;
            });

            newSum += (1 - (arr[0] - arr[1]) / arr[0]);
        }

        newSum /= pixel.length;

        sum += newSum;
    }

    sum /= imgPixels.length;

    newImgPixels = null;

    return sum;
}

function mutate() {
    var i = index,
        j = random(0, 1),
        k = 0;

    var tmp = [];

    for (var n = 0; n < polygons.length; n++) {
        tmp[n] = {};

        tmp[n].color = polygons[n].color.slice();
        tmp[n].shape = polygons[n].shape.slice();
    }

    if (j == 0) {
        k = random(0, tmp[i].color.length - 1);

        tmp[i].color[k] = random(0, 255);
    } else {
        k = random(0, tmp[i].shape.length - 1);

        if (k % 2 == 0) {
            tmp[i].shape[k] = random(0, canvas.width);
        } else {
            tmp[i].shape[k] = random(0, canvas.height);
        }
    }

    draw(canvas, c, tmp);

    var fitness = calcFitness();

    if (fitness > polygons.fitness) {
        polygons = tmp;
        polygons.fitness = fitness;
        changes++;
    } else {
        index++;

        if (index >= polygons.length) index = 0;
    }

    mutations++;
}

function create() {
    for (var i = 0; i < polygonsNumber; i++) {
        polygons[i] = new Polygon;
    }

    draw(canvas, c, polygons);

    polygons.fitness = calcFitness();
}

function draw(canv, ctx, poly, sc) {
    if (!sc) sc = 1;

    clear(canv, ctx);

    for (var i = 0; i < polygonsNumber; i++) {
        var colors = poly[i].color,
            shape = poly[i].shape;

        ctx.beginPath();
        ctx.fillStyle = color(colors[0], colors[1], colors[2], colors[3] / 255);
        ctx.moveTo(shape[0] * sc, shape[1] * sc);
        for (var j = 2; j < shape.length; j += 2) {
            ctx.lineTo(shape[j] * sc, shape[j + 1] * sc);
        }
        ctx.fill();
        ctx.closePath();
    }
}

function getPixels(array) {
    var pixels = [];

    for (var i = 0; i < array.length; i += 4) {
        var pixel = [];

        pixel.push(array[i]);
        pixel.push(array[i + 1]);
        pixel.push(array[i + 2]);
        pixel.push(array[i + 3]);

        pixels.push(pixel);
    }

    return pixels;
}

function init(scale) {
    canvas.width = 100;
    canvas.height = 100;

    var imgRatio = img.width / img.height,
        canvasRatio = canvas.width / canvas.height;


    if (imgRatio > canvasRatio) {
        canvas.height = canvas.width / imgRatio;
    } else {
        canvas.height = canvas.height / imgRatio;
    }

    bestCanvas.width = canvas.width * scale;
    bestCanvas.height = canvas.height * scale;

    original.width = canvas.width;
    original.height = canvas.height;
}

var scale = 5;

var polygonsNumber = 128,
    vertices = 8,
    polygons = [];

var img = new Image(),
    imgPixels = [];

var changes = 0,
    mutations = 0,
    index = 0,
    startTime = new Date();

img.onload = function () {

    init(scale);

    o.drawImage(img, 0, 0, original.width, original.height);
    imgPixels = getPixels(o.getImageData(0, 0, canvas.width, canvas.height).data);

    create();

    setInterval(function () {

        mutate();

        draw(bestCanvas, b, polygons, scale);

        var now = new Date().getTime(),
            distance = now - startTime,
            days = Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var string = '';

        string += 'Fitness: ' + (polygons.fitness * 100).toFixed(2) + '%' + '<br>';
        string += 'Changes: ' + changes + '<br>';
        string += 'Mutations: ' + mutations + '<br>';
        string += 'Polygons: ' + polygonsNumber + '<br>';
        string += 'Vertices: ' + vertices + '<br>';
        string += 'Current polygon index: ' + index + '<br>';
        string += 'Time: ' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';

        div.innerHTML = string;

    }, 0);

};

img.src = 'pearl.jpg';
