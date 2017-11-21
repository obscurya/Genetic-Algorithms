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
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function Polygon(genes) {
    var color = random(0, 255);

    this.color = [];
    this.alpha = color;
    this.shape = [];

    for (var i = 0; i < 3; i++) {
        this.color.push(255);
    }

    for (var i = 0; i < vertices; i++) {
        var edge = edges[random(0, edges.length - 1)];

        this.shape.push(edge.x);
        this.shape.push(edge.y);

        // this.shape.push(random(0, canvas.width));
        // this.shape.push(random(0, canvas.height));

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
    var j = random(0, 2),
        k = 0;

    index = random(0, polygons.length - 1);

    var tmp = [];

    for (var n = 0; n < polygons.length; n++) {
        tmp[n] = {};

        tmp[n].color = polygons[n].color.slice();
        tmp[n].alpha = polygons[n].alpha;
        tmp[n].shape = polygons[n].shape.slice();
    }

    if (j == 0) {
        tmp[index].color = colors[random(0, colors.length - 1)].slice();
    } else if (j == 1) {
        k = random(0, tmp[index].shape.length - 1);

        if (k % 2 == 0) {
            tmp[index].shape[k] = edges[random(0, edges.length - 1)].x;
            // tmp[i].shape[k] = random(0, canvas.width);
        } else {
            tmp[index].shape[k] = edges[random(0, edges.length - 1)].y;
            // tmp[i].shape[k] = random(0, canvas.height);
        }
    } else if (j == 2) {
        tmp[index].alpha = random(0, 255);
    }

    draw(false, canvas, c, tmp);

    var fitness = calcFitness();

    if (fitness > polygons.fitness) {
        polygons = tmp;
        polygons.fitness = fitness;
        changes++;
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

function debug(canv, ctx, poly, edges, sc) {
    for (var i = 0; i < poly.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.moveTo(poly[i].shape[0] * sc, poly[i].shape[1] * sc);
        for (var j = 2; j < poly[i].shape.length; j += 2) {
            ctx.lineTo(poly[i].shape[j] * sc, poly[i].shape[j + 1] * sc);
        }
        ctx.closePath();
        ctx.stroke();
    }

    for (var i = 0; i < edges.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.arc(edges[i].x * sc, edges[i].y * sc, 1, 0, Math.PI * 2);
        ctx.fill();
        // ctx.fillRect(edges[i].x * sc, edges[i].y * sc, 2, 2);
        ctx.closePath();
    }
}

function getPixels(array) {
    var pixels = [],
        n = 0,
        m = 0;

    for (var i = 0; i < array.length; i += 4) {
        var pixel = [];

        pixel.push(array[i]);
        pixel.push(array[i + 1]);
        pixel.push(array[i + 2]);
        pixel.push(array[i + 3]);
        pixel.x = n;
        pixel.y = m;

        pixels.push(pixel);

        n++;

        if (n >= canvas.width) {
            n = 0;
            m++;
        }
    }

    return pixels;
}

function getColors(array) {
    var rgb = [],
        k = 3,
        white = 0,
        black = 0;

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

                if (rgb[j][0] >= 200 && rgb[j][1] >= 200 && rgb[j][2] >= 200) {
                    white++;
                }

                if (rgb[j][0] <= 55 && rgb[j][1] <= 55 && rgb[j][2] <= 55) {
                    black++;
                }
            }

            if (add) {
                rgb.push(color);
            }
        } else {
            rgb.push(color);
        }
    }

    if (black > white) {
        background = '#000';
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

var polygonsNumber = 50,
    vertices = 6,
    polygons = [],
    edges = [];

var img = new Image(),
    imgPixels = [],
    colors = [],
    background = '#fff';

var changes = 0,
    mutations = 0,
    index = 0,
    startTime = new Date(),
    showDebug = false;

img.onload = function () {

    init(scale);

    o.drawImage(img, 0, 0, original.width, original.height);
    imgPixels = getPixels(o.getImageData(0, 0, canvas.width, canvas.height).data);
    colors = getColors(o.getImageData(0, 0, canvas.width, canvas.height).data);

    for (var i = 2; i < imgPixels.length; i++) {
        var pixel1 = imgPixels[i],
            pixel2 = imgPixels[i - 1];

        var d1 = Math.abs(pixel1[0] - pixel2[0]),
            d2 = Math.abs(pixel1[1] - pixel2[1]),
            d3 = Math.abs(pixel1[2] - pixel2[2]),
            d = (pixel1[0] + pixel1[1] + pixel1[2]) / 10;

        if ((d1 + d2 + d3) > d) edges.push(pixel1);
    }

    if (canvas.width > canvas.height) {
        var step = Math.floor(canvas.width / canvas.height) * 4;
    } else {
        var step = Math.floor(canvas.height / canvas.width) * 4;
    }

    for (var j = 0; j <= canvas.height; j += step) {
        for (var i = 0; i <= canvas.width; i += step) {
            var edge = {};

            edge.x = i;
            edge.y = j;

            edges.push(edge);
        }
    }

    create();

    setInterval(function () {

        if (polygons.fitness != 1) {
            mutate();

            draw(false, bestCanvas, b, polygons, scale);
            if (showDebug) {
                debug(bestCanvas, b, polygons, edges, scale);
            }

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
            // string += 'Current polygon index: ' + index + '<br>';
            string += 'Time: ' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';

            div.innerHTML = string;
        }

    }, 0);

};

img.src = 'mono.png';
