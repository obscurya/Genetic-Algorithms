function rnd(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function selection(array, population) {
    array.sort(function(a, b) { return b.fitness - a.fitness });
    array = array.slice(0, population);
    return array;
}

function createChilds(array, gens, population) {
    for (var i = 0; i < population - 1; i++) {
        var k = rnd(1, gens - 1); // сечениe генетического кода

        for (var j = i + 1; j < population; j++) {
            var part1, part2;

            if (Math.random() <= crossOverRate) {
                part1 = array[i].chromosome.slice(0, k);
                part2 = array[j].chromosome.slice(k, n);
            } else {
                part1 = array[i].chromosome.slice(k, n);
                part2 = array[j].chromosome.slice(0, k);
            }

            var chromosome = part1.concat(part2),
                solution = {};

            solution.chromosome = mutation(chromosome);
            solution.fitness = fitness(solution.chromosome, target);

            array.push(solution);
        }
    }

    return array;
}

function mutation(chromosome) {
    if (Math.random() <= mutationRate) {
        for (var j = 0; j < chromosome.length; j++) {
            if (chromosome[j] == 0) {
                chromosome[j] += rnd(0, 1);
            } else {
                chromosome[j] -= rnd(0, 1);
            }
        }
    }
    return chromosome;
}

function fitness(chromosome, target) {
    var fit = 0;

    for (var i = 0; i < chromosome.length; i++) {
        if (chromosome[i] == target[i]) {
            fit++;
        }
    }

    return fit;
}

var n = 32,
    m = 50,
    generation = 1,
    mutationRate = 0.015,
    crossOverRate = 0.5;

var solutions = [];

var target = [];

document.write('Target = ');
for (var i = 0; i < n; i++) {
    target[i] = rnd(0, 1);
    document.write(target[i]);
}
document.write(' (' + n + ')<br><br>');

for (var i = 0; i < m; i++) {
    var solution = {};
    var chromosome = [];

    for (var j = 0; j < n; j++) {
        chromosome[j] = rnd(0, 1);
    }

    solution.chromosome = chromosome;
    solution.fitness = fitness(chromosome, target);

    solutions[i] = solution;
}

var evolution = true;

while (evolution) {
    solutions = createChilds(solutions, n, m);
    solutions = selection(solutions, m);

    generation++;

    if (generation >= 1000) break;

    for (var i = 0; i < solutions.length; i++) {
        if (solutions[i].fitness == n) evolution = false;
    }
}

if (fitness(solutions[0].chromosome, target) == n) {
    document.write('Correct solution = ');
} else {
    document.write('Wrong solution = ');
}
for (var j = 0; j < n; j++) {
    if (solutions[0].chromosome[j] == target[j]) {
        document.write('<span class="true">' + solutions[0].chromosome[j] + '</span>');
    } else {
        document.write('<span class="false">' + solutions[0].chromosome[j] + '</span>');
    }
}
document.write('<br><br>');
document.write('Generation = ' + generation + '<br>');

// console.log(target);
// console.log(generation);
// console.log(solutions);
