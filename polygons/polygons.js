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
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function Polygon(genes) {
    var color = random(0, 255);

    this.color = [];
    this.alpha = color;
    this.shape = [];

    for (var i = 0; i < 3; i++) {
        this.color.push(color);
    }

    for (var i = 0; i < vertices; i++) {
        this.shape.push(random(0, canvas.width));
        this.shape.push(random(0, canvas.height));
        // this.shape.push(random(canvas.width / 2 - 10, canvas.width / 2 + 10));
        // this.shape.push(random(canvas.height / 2 - 10, canvas.height / 2 + 10));
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
            var arr = [pixel[j], newPixel[j]],
                res = 0;

            arr.sort(function (a, b) {
                return b - a;
            });


            if (arr[0] == 0 && arr[1] == 0) {
                res = 0;
            } else {
                res = 1 - (arr[0] - arr[1]) / arr[0];
            }

            newSum += res;
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
        j = random(0, 2),
        k = 0;

    var tmp = [];

    for (var n = 0; n < polygons.length; n++) {
        tmp[n] = {};

        tmp[n].color = polygons[n].color.slice();
        tmp[n].alpha = polygons[n].alpha;
        tmp[n].shape = polygons[n].shape.slice();
    }

    if (j == 0) {
        tmp[i].color = colors[random(0, colors.length - 1)].slice();
    } else if (j == 1) {
        k = random(0, tmp[i].shape.length - 1);

        if (k % 2 == 0) {
            tmp[i].shape[k] = random(0, canvas.width);
        } else {
            tmp[i].shape[k] = random(0, canvas.height);
        }
    } else if (j == 2) {
        tmp[i].alpha = random(0, 255);
    }

    draw(false, canvas, c, tmp);

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

    draw(false, canvas, c, polygons);

    polygons.fitness = calcFitness();
}

function draw(debug, canv, ctx, poly, sc) {
    if (!sc) sc = 1;

    clear(canv, ctx);

    for (var i = 0; i < polygonsNumber; i++) {
        var rgbs = poly[i].color,
            alpha = poly[i].alpha,
            shape = poly[i].shape;

        ctx.beginPath();
        ctx.fillStyle = color(rgbs[0], rgbs[1], rgbs[2], alpha / 255);
        if (debug) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
        }
        ctx.moveTo(shape[0] * sc, shape[1] * sc);
        for (var j = 2; j < shape.length; j += 2) {
            ctx.lineTo(shape[j] * sc, shape[j + 1] * sc);
        }
        ctx.closePath();
        ctx.fill();
        if (debug) ctx.stroke();
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

function getColors(array) {
    var rgb = [],
        k = 3;

    for (var i = 0; i < array.length; i += 4) {
        var color = [];

        color.push(array[i]);
        color.push(array[i + 1]);
        color.push(array[i + 2]);

        if (rgb.length) {
            var add = true;

            for (var j = 0; j < rgb.length; j++) {
                if (rgb[j][0] == color[0] && rgb[j][1] == color[1] && rgb[j][2] == color[2]) {
                    add = false;
                }
            }

            if (add) {
                rgb.push(color);
            }
        } else {
            rgb.push(color);
        }
    }

    return rgb;
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
    imgPixels = [],
    colors = [];

var changes = 0,
    mutations = 0,
    index = 0,
    startTime = new Date();

img.onload = function () {

    init(scale);

    o.drawImage(img, 0, 0, original.width, original.height);
    imgPixels = getPixels(o.getImageData(0, 0, canvas.width, canvas.height).data);
    colors = getColors(o.getImageData(0, 0, canvas.width, canvas.height).data);

    create();

    setInterval(function () {

        if (polygons.fitness != 1) {
            mutate();

            draw(false, bestCanvas, b, polygons, scale);

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
        }

    }, 0);

};

img.src = 'pearl.jpg';
