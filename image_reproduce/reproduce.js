function clear(canv, ctx) {
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = '#000';
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
    scale = 5;

var img = new Image(),
    imgData = [],
    imgPixels = [];

var polygonsNumber = 50,
    vertices = 6,
    populationNumber = 10,
    population = [],
    best = [];

function Polygon(dna) {
    if (dna) {
        this.dna = dna;
    } else {
        this.dna = [];

        for (var i = 0; i < 4; i++) {
            this.dna.push(random(0, 255));
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
        if (pixels[i].average > imgPixels[i].average) {
            if (pixels[i].average == 0) {
                sum += 0;
            } else {
                sum += 1 - (pixels[i].average - imgPixels[i].average) / pixels[i].average;
            }
        } else {
            if (imgPixels[i].average == 0) {
                sum += 0;
            } else {
                sum += 1 - (imgPixels[i].average - pixels[i].average) / imgPixels[i].average;
            }
        }
    }

    sum /= pixels.length;

    return sum;
}

function createPopulation() {
    for (var j = 0; j < populationNumber; j++) {
        var polygons = [];

        for (var i = 0; i < polygonsNumber; i++) {
            polygons.push(new Polygon);
        }

        polygons.fitness = getFitness(canvas[1], c[1], polygons);

        population.push(polygons);
    }

    population.sort(function (a, b) {
        return b.fitness - a.fitness;
    });

    best = population[0];
}

function crossOver() {
    var pool = [];

    for (var i = 0; i < population.length; i++) {
        for (var j = 0; j < population[i].fitness * 100; j++) {
            pool.push(population[i]);
        }
    }

    var children = [];

    for (var i = 0; i < populationNumber; i++) {
        var dna = [];

        if (Math.random() > 0.3) {
            var parent1 = pool[random(0, pool.length - 1)],
                parent2 = pool[random(0, pool.length - 1)],
                polygons = [],
                k = random(1, polygonsNumber - 1),
                dna = [];

            if (Math.random() > 0.5) {
                genes1 = parent1.slice(0, k);
                genes2 = parent2.slice(k, polygonsNumber);
            } else {
                genes1 = parent2.slice(0, k);
                genes2 = parent1.slice(k, polygonsNumber);
            }

            dna = genes1.concat(genes2);
        } else {
            for (var j = 0; j < polygonsNumber; j++) {
                dna.push(new Polygon);
            }
        }

        polygons = dna;

        polygons.fitness = getFitness(canvas[1], c[1], polygons);

        children.push(polygons);
    }

    // for (var i = 0; i < populationNumber; i++) {
    //     var parent1 = pool[random(0, pool.length - 1)],
    //         parent2 = pool[random(0, pool.length - 1)],
    //         polygons = [];
    //
    //     for (var j = 0; j < polygonsNumber; j++) {
    //         if (Math.random() > 0.3) {
    //             var dna = [];
    //
    //             var p1 = parent1[j].dna,
    //                 p2 = parent2[j].dna,
    //                 k = random(1, p1.length - 1);
    //
    //             var genes1 = [],
    //                 genes2 = [],
    //                 numb = p1.length;
    //
    //             if (Math.random() > 0.5) {
    //                 genes1 = p1.slice(0, k);
    //                 genes2 = p2.slice(k, numb);
    //             } else {
    //                 genes1 = p2.slice(0, k);
    //                 genes2 = p1.slice(k, numb);
    //             }
    //
    //             dna = genes1.concat(genes2);
    //
    //             polygons.push(new Polygon(dna));
    //         } else {
    //             polygons.push(new Polygon);
    //         }
    //     }
    //
    //     polygons.fitness = getFitness(canvas[1], c[1], polygons);
    //
    //     children.push(polygons);
    // }

    population = children;

    population.sort(function (a, b) {
        return b.fitness - a.fitness;
    });

    if (population[0].fitness > best.fitness) {
        best = population[0];
    } else {
        population[0] = best;
    }
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

    c[0].drawImage(img, 0, 0, width, height);
    imgData = c[0].getImageData(0, 0, width, height).data;
    imgPixels = getPixels(imgData);

    createPopulation();

    setInterval(function () {

        crossOver();
        draw(canvas[2], c[2], best, true);

    }, 1000 / 60);

}

img.src = 'judith.png';
