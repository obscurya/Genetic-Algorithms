function random(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function sum(array) {
    var sum = 0;

    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }

    return sum;
}

function coloring(array) {
    var colors = [
        '#D1C4E9',
        '#B39DDB',
        '#9575CD',
        '#7E57C2',
        '#673AB7',
        '#5E35B1'
    ];

    var s = 0;

    for (var i = 0; i < colors.length - 1; i++) {
        s += array[i];
    }

    var color = colors[s];

    return color;
}

function create(genes, parent1, parent2) {
    var creature = {};
    var speedRation = 0.5;

    creature.id = creaturesCounter;
    creature.genes = genes;
    creature.parents = [parent1, parent2];
    creature.size = sum(genes) * 3;
    creature.color = coloring(genes);
    creature.partners = [];
    creature.mutant = false;
    creature.x = canvas.width / 2;
    creature.vx = random(-sum(genes) / 10, sum(genes) / 10);
    creature.y = canvas.height / 2;
    creature.vy = random(-sum(genes) / 10, sum(genes) / 10);

    creaturesCounter++;

    return creature;
}

function crossOver(creatures) {
    var childs = [];

    for (var i = 0; i < creatures.length; i++) {
        for (var j = 0; j < creatures[i].partners.length; j++) {
            for (var l = 0; l < creatures.length; l++) {
                var mutant = false;

                if (creatures[l].id == creatures[i].partners[j]) {
                    var genes1, genes2;
                    var k = random(1, genesCount - 1);

                    if (Math.random() <= crossOverRate) {
                        genes1 = creatures[i].genes.slice(0, k);
                        genes2 = creatures[l].genes.slice(k, genesCount);
                    } else {
                        genes1 = creatures[i].genes.slice(k, genesCount);
                        genes2 = creatures[l].genes.slice(0, k);
                    }

                    var genes = genes1.concat(genes2);

                    if (Math.random() <= mutationRate) {
                        genes = mutation(genes);
                        mutant = true;
                    }

                    var creature = create(genes, creatures[i].id, creatures[l].id);

                    if (mutant == true) {
                        creature.mutant = true;
                        creature.color = '#F44336';
                        mutants.push(creature);
                    }

                    childs.push(creature);
                }
            }
        }
    }

    return childs;
}

function mutation(genes) {
    var array = genes;

    for (var i = 0; i < array.length; i++) {
        if (array[i] == 0) {
            array[i] += random(0, 1);
        } else {
            array[i] -= random(0, 1);
        }
    }

    return array;
}

function findPartners(creatures) {
    var array = creatures;

    for (var i = 0; i < array.length; i++) {
        var partners = [];

        for (var j = 0; j < array.length; j++) {
            if (i != j && array[i].size == array[j].size) {
                partners.push(array[j].id);
            }
        }

        array[i].partners = partners;
    }

    return array;
}

function die(creatures) {
    var array = [];

    for (var i = 0; i < creatures.length; i++) {
        if (creatures[i].partners.length != 0) {
            array.push(creatures[i]);
        }
    }

    return array;
}

function selection(creatures) {
    var array = creatures;
    array.sort(function(a, b) {
        return b.size - a.size
    });
    array = array.slice(0, population);
    return array;
}

var canvas = document.getElementById('canvas'),
    c = canvas.getContext('2d'),
    fontSize = 12;

canvas.width = 640;
canvas.height = 480;

c.clearRect(0, 0, canvas.width, canvas.height);
c.fillStyle = '#fff';
c.fillRect(0, 0, canvas.width, canvas.height);
c.font = fontSize + 'px monospace';

var genesCount = 16,
    population = 8,
    generation = 0,
    evolution = true;

var mutationRate = 0.1,
    crossOverRate = 0.5,
    sexRate = 0.5;

var creatures = [],
    creaturesCounter = 0,
    pos = 0;

var mutants = [];

var timer = 500;

for (var i = 0; i < population; i++) {
    var genes = [];

    for (var j = 0; j < genesCount; j++) {
        genes[j] = random(0, 1);
    }

    var creature = create(genes, -1, -1);

    pos = creature.x;

    creatures[i] = creature;
}

console.log(creatures);

var time = timer;

setInterval(function() {
    c.fillStyle = '#fff';
    c.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < creatures.length - 1; i++) {
        for (var j = i + 1; j < creatures.length; j++) {
            if (creatures[i].size == creatures[j].size) {
                c.beginPath();
                c.strokeStyle = '#eee';
                c.lineWidth = creatures[i].size * 2;
                c.moveTo(creatures[i].x, creatures[i].y);
                c.lineTo(creatures[j].x, creatures[j].y);
                c.stroke();
            }
        }
    }

    for (var i = 0; i < creatures.length; i++) {
        if (creatures[i].size != 0) {
            c.fillStyle = creatures[i].color;
            c.beginPath();
            c.arc(creatures[i].x, creatures[i].y, creatures[i].size, 0, 2 * Math.PI);
            c.fill();
            // c.fillStyle = '#fff';
            // c.fillText(creatures[i].size, creatures[i].x - fontSize / 2, creatures[i].y + fontSize / 3);
        }
    }

    if (time > 0) {
        for (var i = 0; i < creatures.length; i++) {
            if (creatures[i].x - creatures[i].size <= 0) {
                creatures[i].x = creatures[i].size;
            }
            if (creatures[i].x + creatures[i].size >= canvas.width) {
                creatures[i].x = canvas.width - creatures[i].size;
            }
            if (creatures[i].y - creatures[i].size <= 0) {
                creatures[i].y = creatures[i].size;
            }
            if (creatures[i].y + creatures[i].size >= canvas.height) {
                creatures[i].y = canvas.height - creatures[i].size;
            }
            if (creatures[i].x - creatures[i].size <= 0 || creatures[i].x + creatures[i].size >= canvas.width) creatures[i].vx = -creatures[i].vx;
            if (creatures[i].y - creatures[i].size <= 0 || creatures[i].y + creatures[i].size >= canvas.height) creatures[i].vy = -creatures[i].vy;

            creatures[i].x += creatures[i].vx;
            creatures[i].y += creatures[i].vy;

            for (var j = 0; j < creatures.length; j++) {
                if (i != j) {
                    var dx = creatures[j].x - creatures[i].x,
                        dy = creatures[j].y - creatures[i].y,
                        ds = dx * dx + dy * dy,
                        distance = Math.sqrt(ds);

                    if (distance <= creatures[i].size + creatures[j].size) {
                        var angle = Math.atan2(dy, dx),
                            spread = creatures[i].size + creatures[j].size - distance,
                            ax = spread * Math.cos(angle),
                            ay = spread * Math.sin(angle),
                            punch;

                        if (creatures[i].size != creatures[j].size) {
                            punch = 2;
                        } else {
                            punch = 0;
                        }

                        creatures[i].x -= ax;
                        creatures[i].y -= ay;

                        creatures[i].vx -= punch * Math.cos(angle);
                        creatures[i].vy -= punch * Math.sin(angle);
                        creatures[j].vx += punch * Math.cos(angle);
                        creatures[j].vy += punch * Math.sin(angle);

                        if (creatures[i].size == creatures[j].size) {
                            var tempX = (creatures[i].vx + creatures[j].vx) / 2,
                                tempY = (creatures[i].vy + creatures[j].vy) / 2;

                            creatures[i].vx = tempX;
                            creatures[i].vy = tempY;
                            creatures[j].vx = tempX;
                            creatures[j].vy = tempY;
                        }
                    } else {
                        if (creatures[i].size == creatures[j].size) {
                            var totalForce = canvas.width * 2 / ds;
                            creatures[i].vx += totalForce * dx / distance;
                            creatures[i].vy += totalForce * dy / distance;
                        }
                    }
                }
            }
        }
    } else {
        if (evolution) {
            creatures = findPartners(creatures);
            creatures = die(creatures);
            creatures = creatures.concat(crossOver(creatures));
            creatures = selection(creatures);

            var e = 0;

            for (var i = 0; i < creatures.length; i++) {
                if (creatures[i].size / 3 == genesCount) e++;
                creatures[i].x = canvas.width / 2;
                creatures[i].y = canvas.height / 2;
            }

            if (e == creatures.length) {
                evolution = false;
            }

            time = timer;

            generation++;
        }
    }

    c.fillStyle = '#000';
    c.fillText('Generation ' + generation, 30, 30);

    if (evolution) {
        c.fillText('New generation after ' + time, 30, 50);
        time--;
    }
}, 1000 / 60);