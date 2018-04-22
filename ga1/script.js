function rnd(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function sum(array) {
    var result = 0;
    for (var i = 0; i < array.length; i++) result += array[i];
    return result;
}

function selection(array, population) {
    array.sort(function(a, b) { return b.sum - a.sum });
    array = array.slice(0, population);
    return array;
}

function createChilds(array, cells, population) {
    for (var i = 0; i < population - 1; i++) {
        var k = rnd(1, cells - 1); // сечениe генетического кода

        for (var j = i + 1; j < population; j++) {
            var part1, part2;

            if (Math.random() <= crossOverRate) {
                part1 = array[i].brain.slice(0, k);
                part2 = array[j].brain.slice(k, n);
            } else {
                part1 = array[i].brain.slice(k, n);
                part2 = array[j].brain.slice(0, k);
            }

            var brain = part1.concat(part2),
                human = {};

            human.id = humansCounter;
            human.brain = mutation(brain);
            human.sum = sum(human.brain);
            human.parents = [array[i].id, array[j].id];

            array.push(human);

            humansCounter++;
        }
    }

    return array;
}

function mutation(b) {
    if (Math.random() <= mutationRate) {
        for (var j = 0; j < b.length; j++) {
            if (b[j] == 0) {
                b[j] += rnd(0, 1);
            } else {
                b[j] -= rnd(0, 1);
            }
        }
    }
    return b;
}

function log(generation, array) {
    document.write('Generation: ' + generation + '<br>');
    for (var i = 0; i < array.length; i++) {
        document.write('Human: ' + array[i].id + '; ');
        if (array[i].parents !== undefined) document.write('parents: ' + array[i].parents[0] + ', ' + array[i].parents[1] + '; ');
        document.write('brain = [ ');
        for (var j = 0; j < array[i].brain.length; j++) {
            if (array[i].brain[j] == 0) {
                document.write('<span class="zero">' + array[i].brain[j] + '</span> ');
            } else {
                document.write('<span class="one">' + array[i].brain[j] + '</span> ');
            }
        }
        document.write('] (' + array[i].sum + ')<br>');
    }
    document.write('<br>');
}

var n = 64,                 // максимальное число клеток в мозгу
    m = 8,                  // популяция
    humans = [],            // массив всех людей
    humansCounter = 0,      // счетчик всех людей
    generation = 1;         // поколение

var mutationRate = 0.015,   // вероятность мутации
    crossOverRate = 0.5;    // вероятность скрещивания

// создание первых людей

for (var i = 0; i < m; i++) {
    var human = {};
    var brain = [];

    for (var j = 0; j < n; j++) {
        brain[j] = rnd(0, 1);
    }

    human.id = humansCounter;
    human.brain = brain;
    human.sum = sum(brain);

    humans[i] = human;

    humansCounter++;
}

// эволюция

var evolution = true;

while (evolution) {
    // log(generation, humans);

    humans = createChilds(humans, n, m);
    humans = selection(humans, m);

    generation++;

    for (var i = 0; i < humans.length; i++) {
        if (humans[i].sum == n) evolution = false;
    }
}

log(generation, humans);
