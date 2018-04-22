var canvas = document.getElementById('canvas'),
    c = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 480;

var CX = canvas.width / 2,
    CY = canvas.height / 2;

function clearCanvas() {
    c.fillStyle = '#fff';
    c.fillRect(0, 0, canvas.width, canvas.height);
}

function random(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

var lifespan = 512,
    genesCount = lifespan;

var particles = [],
    particlesCount = 500,
    particleVelocity = 1,
    particleSize = 16;

var target = {
    x: CX,
    y: 50,
    color: '#3F51B5'
}

var blocks = [
    {
        w: 250,
        h: 20,
        x: 100,
        y: CY - 50,
        color: '#000'
    }, {
        w: 250,
        h: 20,
        x: CX,
        y: CY + 100,
        color: '#000'
    }
];

function Particle(genes, parentsFitness) {
    if (genes) {
        this.genes = genes;
    } else {
        this.genes = [];

        for (var j = 0; j < genesCount; j++) {
            this.genes[j] = new Vector();
        }
    }

    if (parentsFitness) {
        this.parentsFitness = parentsFitness;
    } else {
        this.parentsFitness = 0;
    }

    this.fitness = 0;

    this.x = CX;
    this.y = canvas.height - 50;

    this.vx = 0;
    this.vy = 0;

    this.color = 'rgba(0, 0, 0, 0.1)';

    this.crashed = false;
    this.completed = false;
}

for (var i = 0; i < particlesCount; i++) {
    particles[i] = new Particle();
}

function draw(particle) {
    c.beginPath();
    c.arc(particle.x, particle.y, particleSize, 0, 2 * Math.PI);
    c.closePath();
    c.fillStyle = particle.color;
    c.fill();
}

function drawTarget() {
    c.beginPath();
    c.arc(target.x, target.y, particleSize, 0, 2 * Math.PI);
    c.closePath();
    c.fillStyle = target.color;
    c.fill();
}

function drawBlock(i) {
    c.beginPath();
    c.rect(blocks[i].x, blocks[i].y, blocks[i].w, blocks[i].h);
    c.closePath();
    c.fillStyle = blocks[i].color;
    c.fill();
}

function Vector() {
    this.ax = 0.2 * Math.random() * random(-1, 1);
    this.ay = 0.2 * Math.random() * random(-1, 1);
}

function crossOver(partner1, partner2) {
    var mid = random(1, genesCount - 1);

    if (Math.random() < 0.5) {
        genes1 = partner1.genes.slice(0, mid);
        genes2 = partner2.genes.slice(mid, genesCount);
    } else {
        genes1 = partner1.genes.slice(mid, genesCount);
        genes2 = partner2.genes.slice(0, mid);
    }

    var genes = genes1.concat(genes2);

    if (Math.random() < 0.05) genes = mutation(genes);

    return genes;
}

function mutation(genes) {
    var array = genes;

    for (var i = 0; i < array.length; i++) {
        if (Math.random() < 0.5) {
            array[i] = new Vector(particleVelocity);
        }
    }

    return array;
}

function selection(pool) {
    var array = [];

    for (var i = 0; i < particlesCount; i++) {
        var partner1 = pool[random(0, pool.length - 1)],
            partner2 = pool[random(0, pool.length - 1)],
            genes = crossOver(partner1, partner2),
            parentsFitness = partner1.fitness + partner2.fitness;

        var particle = new Particle(genes, parentsFitness);

        array.push(particle);
    }

    array.sort(function(a, b) { return b.parentsFitness - a.parentsFitness });

    return array;
}

function calcFitness(particle) {
    var dx = target.x - particle.x,
        dy = target.y - particle.y,
        ds = dx * dx + dy * dy,
        distance = Math.sqrt(ds);

    if (distance != 0) {
        var fitness = (1 / distance) * 10;
    } else {
        var fitness = 10;
    }

    if (particle.completed) {
        fitness *= 10;
    } else {
        if (particle.crashed) {
            fitness /= 10;
        }
    }

    return fitness;
}

var genesCounter = 0,
    counter = 0,
    life = 0,
    generation = 0;

setInterval(function () {

    clearCanvas();

    var distanceMin = canvas.height;
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        var dx = target.x - p.x,
            dy = target.y - p.y,
            ds = dx * dx + dy * dy,
            distance = Math.sqrt(ds);

        if (distance < distanceMin) {
            distanceMin = distance;
        }
    }

    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (p.x - particleSize <= 0 || p.x + particleSize >= canvas.width || p.y + particleSize >= canvas.height) {
            p.crashed = true;
        }

        for (var j = 0; j < blocks.length; j++) {
            if ((p.x + particleSize >= blocks[j].x && p.x - particleSize <= blocks[j].x + blocks[j].w) && (p.y + particleSize >= blocks[j].y && p.y - particleSize <= blocks[j].y + blocks[j].h)) {
                p.crashed = true;
            }
        }

        // if (p.crashed) p.color = 'rgba(0, 0, 0, 0)';

        // var dx = target.x - p.x,
        //     dy = target.y - p.y,
        //     ds = dx * dx + dy * dy,
        //     distance = Math.sqrt(ds);
        //
        // if (distance == distanceMin && p.crashed == false) {
        //     c.beginPath();
        //     c.moveTo(target.x, target.y);
        //     c.lineTo(p.x, p.y);
        //     c.closePath();
        //     c.lineWidth = 2;
        //     c.strokeStyle = '#ddd';
        //     c.stroke();
        // }

        if (distance <= 10) {
            p.completed = true;
        }

        if (!p.crashed && p.y - particleSize >= 0) {
            if (p.vx < 4) p.vx += p.genes[genesCounter].ax;
            if (p.vy < 4) p.vy += p.genes[genesCounter].ay;

            p.x += p.vx;
            p.y += p.vy;
        }

        particles[i] = p;
    }

    drawTarget();

    for (var i = 0; i < blocks.length; i++) {
        drawBlock(i);
    }

    for (var i = 0; i < particles.length; i++) {
        if (!particles[i].crashed) draw(particles[i]);
    }

    c.fillStyle = '#000';
    c.font = '14px sans-serif';
    c.fillText('Current generation: ' + generation, 30, 40);
    c.fillText('New generation after: ' + (lifespan - life), 30, 60);

    // for (var i = 0; i < particles.length; i++) {
    //     draw(particles[i]);
    // }

    genesCounter++;

    if (genesCounter >= genesCount) genesCounter = 0;

    life++;

    if (life >= lifespan) {
        var pool = [];

        for (var i = 0; i < particles.length; i++) {
            particles[i].fitness = calcFitness(particles[i]);

            for (var j = 0; j < particles[i].fitness * 100; j++) {
                pool.push(particles[i]);
            }
        }

        // pool.sort(function(a, b) { return b.fitness - a.fitness });

        particles = selection(pool);

        // console.log(pool);

        life = 0;
        genesCounter = 0;
        generation++;
    }

}, 0);
