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
    c = canvas.getContext('2d'),
    b = bestCanvas.getContext('2d'),
    div = document.getElementById('fitness');

function clear() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#fff';
    c.fillRect(0, 0, canvas.width, canvas.height);
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

function init() {
    canvas.width = 200;
    canvas.height = 200;

    var imgRatio = img.width / img.height,
        canvasRatio = canvas.width / canvas.height;


    if (imgRatio > canvasRatio) {
        canvas.height = canvas.width / imgRatio;
    } else {
        canvas.height = canvas.height / imgRatio;
    }

    bestCanvas.width = canvas.width;
    bestCanvas.height = canvas.height;
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

    return sum;
}

function mutate() {
    var i = random(0, polygons.length - 1),
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

    draw(tmp);

    var fitness = calcFitness();

    if (fitness > polygons.fitness) {
        polygons = tmp;
        polygons.fitness = fitness;
        changes++;
    }

    best = polygons.slice();
}

function create() {
    for (var i = 0; i < polygonsNumber; i++) {
        polygons[i] = new Polygon;
    }

    draw(polygons);

    polygons.fitness = calcFitness();
}

function draw(poly) {
    clear();

    for (var i = 0; i < polygonsNumber; i++) {
        var colors = poly[i].color,
            shape = poly[i].shape;

        c.beginPath();
        c.fillStyle = color(colors[0], colors[1], colors[2], colors[3] / 255);
        c.moveTo(shape[0], shape[1]);
        for (var j = 2; j < shape.length; j += 2) {
            c.lineTo(shape[j], shape[j + 1]);
        }
        c.fill();
        c.closePath();
    }
}

function drawBest(poly) {
    b.clearRect(0, 0, bestCanvas.width, bestCanvas.height);
    b.fillStyle = '#fff';
    b.fillRect(0, 0, bestCanvas.width, bestCanvas.height);

    for (var i = 0; i < polygonsNumber; i++) {
        var colors = poly[i].color,
            shape = poly[i].shape;

        b.beginPath();
        b.fillStyle = color(colors[0], colors[1], colors[2], colors[3] / 255);
        b.moveTo(shape[0], shape[1]);
        for (var j = 2; j < shape.length; j += 2) {
            b.lineTo(shape[j], shape[j + 1]);
        }
        b.fill();
        b.closePath();
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

var polygonsNumber = 50,
    vertices = 6,
    polygons = [],
    best = [];

var img = new Image(),
    imgPixels = [];

var changes = 0;

img.onload = function () {

    init();

    c.drawImage(img, 0, 0, canvas.width, canvas.height);
    imgPixels = getPixels(c.getImageData(0, 0, canvas.width, canvas.height).data);

    create();

    setInterval(function () {

        mutate();
        if (best.length != 0) {
            drawBest(best);
            div.innerHTML = (polygons.fitness * 100).toFixed(2) + '%';
        }

    }, 1000 / 60);

};

img.src = 'anton.jpg';
