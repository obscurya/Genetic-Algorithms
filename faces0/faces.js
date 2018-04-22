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

canvas.width = 800;
canvas.height = 400;

function clear() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#fff';
    c.fillRect(0, 0, canvas.width, canvas.height);
}

function init() {
    for (var i = ratio; i < canvas.width; i += ratio) {
        chunks.push(i);
    }

    for (var i = 0; i < population; i++) {
        var input = document.createElement('input');

        input.setAttribute('id', 'face' + i);
        input.setAttribute('value', 0);

        document.body.appendChild(input);
    }

    var button = document.createElement('button');

    button.innerHTML = 'New generation';
    button.setAttribute('onclick', 'generate();');

    document.body.appendChild(button);
}

function DNA() {
    var face = [],
        faceMinRad = 30,
        faceMaxRad = 60,
        eyeMinRad = 2,
        eyeMaxRad = 10;

    var genes = [];

    genes[0] = random(faceMinRad, faceMaxRad); // форма лица
    genes[1] = random(0, 255); // цвет лица (R)
    genes[2] = random(0, 255); // цвет лица (G)
    genes[3] = random(0, 255); // цвет лица (B)
    genes[4] = random(-faceMaxRad, 0); // x левого глаза
    genes[5] = random(-faceMinRad, 0); // y левого глаза
    genes[6] = random(eyeMinRad, eyeMaxRad); // радиус левого глаза
    genes[7] = random(0, faceMaxRad); // x правого глаза
    genes[8] = random(-faceMinRad, 0); // y правого глаза
    genes[9] = random(eyeMinRad, eyeMaxRad); // радиус правого глаза
    genes[10] = random(0, 255); // цвет глаз (R)
    genes[11] = random(0, 255); // цвет глаз (G)
    genes[12] = random(0, 255); // цвет глаз (B)
    genes[13] = random(-faceMaxRad, 0); // x рта
    genes[14] = random(0, faceMinRad); // y рта
    genes[15] = random(faceMinRad, faceMaxRad); // ширина рта
    genes[16] = random(2, faceMinRad); // высота рта
    genes[17] = random(0, 255); // цвет рта (R)
    genes[18] = random(0, 255); // цвет рта (G)
    genes[19] = random(0, 255); // цвет рта (B)

    for (var i = 0; i < genes.length; i++) {
        face.push(genes[i]);
    }

    return face;
}

function createPopulation() {
    for (var i = 0; i < chunks.length; i++) {
        faces[i] = new DNA();
    }
}

function generate() {
    for (var i = 0; i < chunks.length; i++) {
        faces[i] = new DNA();
    }

    draw();
}

function draw() {
    clear();

    for (var i = 0; i < chunks.length; i++) {
        var face = faces[i];

        // форма лица
        c.beginPath();
        c.fillStyle = color(face[1], face[2], face[3]);
        c.arc(chunks[i], cy, face[0], 0, Math.PI * 2);
        c.fill();
        c.closePath();

        // левый глаз
        c.beginPath();
        c.fillStyle = color(face[10], face[11], face[12]);
        c.arc(chunks[i] + face[4], cy + face[5], face[6], 0, Math.PI * 2);
        c.fill();
        c.closePath();

        // правый глаз
        c.beginPath();
        c.fillStyle = color(face[10], face[11], face[12]);
        c.arc(chunks[i] + face[7], cy + face[8], face[9], 0, Math.PI * 2);
        c.fill();
        c.closePath();

        // рот
        c.beginPath();
        c.fillStyle = color(face[17], face[18], face[19]);
        c.fillRect(chunks[i] + face[13], cy + face[14], face[15], face[16]);
        c.closePath();
    }
}

var chunks = [],
    population = 5,
    ratio = canvas.width / (population + 1),
    cy = canvas.height / 2;

var faces = [];

init();
createPopulation();
draw();
