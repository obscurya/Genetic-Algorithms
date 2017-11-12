function random(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function color(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

var canvas = document.getElementById('canvas'),
    c = canvas.getContext('2d');

function clear() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#f5f5f5';
    c.fillRect(0, 0, canvas.width, canvas.height);
}

function init() {
    for (var i = ratio; i < canvas.width; i += ratio) {
        chunks.push(i);
    }

    // var button = document.createElement('button');
    //
    // button.innerHTML = 'New generation';
    // button.setAttribute('onclick', 'generate();');
    //
    // document.body.appendChild(button);
}

function DNA(targetGenes) {
    var face = {},
        faceMinRad = Math.floor(ratio / 4),
        faceMaxRad = Math.floor(ratio / 2),
        eyeMinRad = Math.floor(ratio / 16),
        eyeMaxRad = Math.floor(ratio / 8);

    var genes = [];

    genes[0] = random(faceMinRad, faceMaxRad); // форма лица
    genes[1] = random(0, 255); // цвет лица (R)
    genes[2] = random(0, 255); // цвет лица (G)
    genes[3] = random(0, 255); // цвет лица (B)
    genes[4] = random(-genes[0], 0); // x левого глаза
    genes[5] = random(-genes[0], 0); // y левого глаза
    genes[6] = random(eyeMinRad, eyeMaxRad); // радиус левого глаза
    genes[7] = random(0, genes[0]); // x правого глаза
    genes[8] = random(-genes[0], 0); // y правого глаза
    genes[9] = random(eyeMinRad, eyeMaxRad); // радиус правого глаза
    genes[10] = random(0, 255); // цвет глаз (R)
    genes[11] = random(0, 255); // цвет глаз (G)
    genes[12] = random(0, 255); // цвет глаз (B)
    genes[13] = random(-genes[0], 0); // x рта
    genes[14] = random(0, genes[0]); // y рта
    genes[15] = random(faceMinRad, genes[0]); // ширина рта
    genes[16] = random(faceMinRad / 10, faceMinRad); // высота рта
    genes[17] = random(0, 255); // цвет рта (R)
    genes[18] = random(0, 255); // цвет рта (G)
    genes[19] = random(0, 255); // цвет рта (B)

    for (var i = 0; i < genes.length; i++) {
        genes[i] = Math.floor(genes[i]);
    }

    face.genes = genes;

    if (targetGenes) {
        face.fitness = 1;
    } else {
        face.fitness = calcFitness(genes);
    }

    return face;
}

function createPopulation() {
    for (var i = 0; i < chunks.length; i++) {
        faces[i] = new DNA(false);
    }

    faces.sort(function (a, b) {
        return b - a;
    });

    best = faces[0];
}

function calcFitness(genes) {
    var sum = 0;

    for (var i = 0; i < genes.length; i++) {
        var array = [Math.abs(target.genes[i]), Math.abs(genes[i])];

        array.sort(function (a, b) {
            return b - a;
        });

        sum += (1 - Math.abs(array[0] - array[1]) / array[0]);
    }

    sum /= genes.length;

    return sum;
}


function generate() {
    var pool = [];

    for (var i = 0; i < faces.length; i++) {
        for (var j = 0; j < faces[i].fitness * 100; j++) {
            pool.push(faces[i]);
        }
    }

    var children = [];

    for (var i = 0; i < population; i++) {
        var parent1 = {}, parent2 = {};
        var w = 0;

        while (w < pool.length) {
            var diff = true, k = 0;

            parent1 = pool[random(0, pool.length - 1)];
            parent2 = pool[random(0, pool.length - 1)];

            for (var j = 0; j < parent1.genes.length; j++) {
                if (parent1.genes[j] == parent2.genes[j]) k++;
            }

            if (k != parent1.genes.length) break;

            w++;
        }

        var genesAmount = parent1.genes.length,
            k = random(1, genesAmount - 1),
            genes1 = parent1.genes.slice(0, k),
            genes2 = parent2.genes.slice(k, genesAmount);

        var face = {};

        face.genes = genes1.concat(genes2);
        face.fitness = calcFitness(face.genes);

        if (Math.random() < 0.1) {
            face = new DNA(false);
        }

        children.push(face);
    }

    faces = children.slice(0, population);

    faces.sort(function (a, b) {
        return b.fitness - a.fitness;
    });

    if (faces[0].fitness > best.fitness) {
        best = faces[0];
    } else {
        faces[0] = best;
    }
}

function draw() {
    clear();

    for (var i = 0; i < population; i++) {
        var face = faces[i];

        // форма лица
        c.beginPath();
        c.fillStyle = color(face.genes[1], face.genes[2], face.genes[3]);
        c.arc(chunks[i], cy, face.genes[0], 0, Math.PI * 2);
        c.fill();
        c.closePath();

        // левый глаз
        c.beginPath();
        c.fillStyle = color(face.genes[10], face.genes[11], face.genes[12]);
        c.arc(chunks[i] + face.genes[4], cy + face.genes[5], face.genes[6], 0, Math.PI * 2);
        c.fill();
        c.closePath();

        // правый глаз
        c.beginPath();
        c.fillStyle = color(face.genes[10], face.genes[11], face.genes[12]);
        c.arc(chunks[i] + face.genes[7], cy + face.genes[8], face.genes[9], 0, Math.PI * 2);
        c.fill();
        c.closePath();

        // рот
        c.beginPath();
        c.fillStyle = color(face.genes[17], face.genes[18], face.genes[19]);
        c.fillRect(chunks[i] + face.genes[13], cy + face.genes[14], face.genes[15], face.genes[16]);
        c.closePath();

        c.beginPath();
        c.fillStyle = '#000';
        c.font = '14px sans-serif';
        c.fillText((face.fitness * 100).toFixed(2) + '%', chunks[i], canvas.height - 20);
        c.closePath();
    }

    c.beginPath();
    c.fillStyle = '#000';
    c.font = '14px sans-serif';
    c.fillText('Generation: ' + generation, chunks[1], ratio - 40);
    c.closePath();

    c.beginPath();
    c.fillStyle = '#000';
    c.font = '14px sans-serif';
    c.fillText('Target genes: ' + target.genes, chunks[1], ratio - 20);
    c.closePath();

    c.beginPath();
    c.fillStyle = '#000';
    c.font = '14px sans-serif';
    c.fillText('Best genes: ' + best.genes, chunks[1], ratio);
    c.closePath();
}

function drawTarget() {
    var face = target,
        x = chunks[0],
        y = ratio;

    // форма лица
    c.beginPath();
    c.fillStyle = color(face.genes[1], face.genes[2], face.genes[3]);
    c.arc(x, y, face.genes[0], 0, Math.PI * 2);
    c.fill();
    c.closePath();

    // левый глаз
    c.beginPath();
    c.fillStyle = color(face.genes[10], face.genes[11], face.genes[12]);
    c.arc(x + face.genes[4], y + face.genes[5], face.genes[6], 0, Math.PI * 2);
    c.fill();
    c.closePath();

    // правый глаз
    c.beginPath();
    c.fillStyle = color(face.genes[10], face.genes[11], face.genes[12]);
    c.arc(x + face.genes[7], y + face.genes[8], face.genes[9], 0, Math.PI * 2);
    c.fill();
    c.closePath();

    // рот
    c.beginPath();
    c.fillStyle = color(face.genes[17], face.genes[18], face.genes[19]);
    c.fillRect(x + face.genes[13], y + face.genes[14], face.genes[15], face.genes[16]);
    c.closePath();
}

canvas.width = Math.floor(window.innerWidth / 2);

var chunks = [],
    population = 9,
    ratio = canvas.width / (population + 1);

canvas.height = ratio * 3;

var cx = canvas.width / 2,
    cy = canvas.height / 2 + ratio / 2;

var target = new DNA(true),
    best = {},
    faces = [];

var generation = 0,
    finish = false;

init();
createPopulation();
draw();
drawTarget();

setInterval(function () {
    if (!finish) {
        generate();

        generation++;

        if (generation % 10 == 0) {
            draw();
            drawTarget();
        }

        for (var i = 0; i < population; i++) {
            if (faces[i].fitness == 1) finish = true;
        }

        if (finish) {
            draw();
            drawTarget();
        }
    }
});
