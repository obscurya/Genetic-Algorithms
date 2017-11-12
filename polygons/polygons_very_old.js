function random(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function color(r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

var canvas = document.getElementById('canvas'),
    c = canvas.getContext('2d');

function clear() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#fff';
    c.fillRect(0, 0, canvas.width, canvas.height);
}

clear();

function Polygon(genes) {
    if (genes) {
        this.genes = genes;
    } else {
        var color = random(0, 255);

        this.genes = [];

        for (var i = 0; i < 3; i++) {
            this.genes.push(color);
        }

        this.genes.push(Math.random());

        for (var i = 0; i < vertices; i++) {
            this.genes.push(random(0, canvas.width));
            this.genes.push(random(0, canvas.height));
        }
    }
}

function init() {
    canvas.width = img.width / 4;
    canvas.height = img.height / 4;
}

var polygonsNumber = 50,
    vertices = 6,
    fitness = [],
    array = [],
    best = [],
    population = 5;

function calcFitness() {
    var newImgData = c.getImageData(0, 0, canvas.width, canvas.height).data,
        sum = 0,
        k = 0;

    for (var i = 0; i < imgData.length; i += imgData.length / 100) {
        var arr = [imgData[i], newImgData[i]];

        arr.sort(function (a, b) {
            return b - a;
        });

        sum += (1 - (arr[0] - arr[1]) / arr[0]);

        k++;
    }

    sum /= k;

    return sum;
}

function create() {
    for (var j = 0; j < population; j++) {
        var polygons = [];

        for (var i = 0; i < polygonsNumber; i++) {
            polygons[i] = new Polygon;
        }

        draw(polygons);

        polygons.fitness = calcFitness();

        array[j] = polygons;
    }

    array.sort(function (a, b) {
        return b.fitness - a.fitness;
    });

    best = array[0];
}

function crossOver() {
    var pool = [];

    for (var i = 0; i < population; i++) {
        for (var j = 0; j < array[i].fitness * 100; j++) {
            pool.push(array[i]);
        }
    }

    var children = [];

    for (var i = 0; i < population; i++) {
        var parent1 = pool[random(0, pool.length - 1)],
            parent2 = pool[random(0, pool.length - 1)];

        var newPolygons = [];

        for (var j = 0; j < parent1.length; j++) {

            var polygon = {};

            if (Math.random() < 0.2) {
                polygon = new Polygon();
            } else {
                var k = random(0, parent1[j].genes.length - 1);

                var genes1 = [],
                    genes2 = [];

                if (Math.random() < 0.5) {
                    genes1 = parent1[j].genes.slice(0, k);
                    genes2 = parent2[j].genes.slice(k, parent1[j].genes.length);
                } else {
                    genes1 = parent2[j].genes.slice(0, k);
                    genes2 = parent1[j].genes.slice(k, parent1[j].genes.length);
                }

                var genes = genes1.concat(genes2);

                polygon = new Polygon(genes);
            }

            newPolygons.push(polygon);
        }

        draw(newPolygons);

        newPolygons.fitness = calcFitness();

        children.push(newPolygons);
    }

    array = children;

    array.sort(function (a, b) {
        return b.fitness - a.fitness;
    });

    if (array[0].fitness > best.fitness) {
        best = array[0];
    } else {
        array[0] = best;
    }
}

function draw(polygons) {
    clear();

    for (var i = 0; i < polygonsNumber; i++) {
        var genes = polygons[i].genes;

        c.beginPath();
        c.fillStyle = color(genes[0], genes[1], genes[2], genes[3]);
        c.moveTo(genes[4], genes[5]);
        for (var j = 6; j < genes.length; j += 2) {
            c.lineTo(genes[j], genes[j + 1]);
        }
        c.fill();
        c.closePath();
    }
}

var img = new Image(),
    imgData = [];

img.onload = function () {

    init();

    c.drawImage(img, 0, 0, canvas.width, canvas.height);
    imgData = c.getImageData(0, 0, canvas.width, canvas.height).data;

    create();

    setInterval(function () {

        crossOver();
        draw(best);

    }, 1000 / 60);

};

img.src = 'nok.jpg';
