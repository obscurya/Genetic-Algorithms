var canvas = document.createElement('canvas'),
    c = canvas.getContext('2d');

document.body.appendChild(canvas);

var width = canvas.width = 800,
    height = canvas.height = 500;

function clear() {
    c.clearRect(0, 0, width, height);
    c.fillStyle = '#000';
    c.fillRect(0, 0, width, height);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

class Cell {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(direction) * speed;
        this.vy = Math.sin(direction) * speed;
        this.r = 10;
    }

    angleTo(cell) {
        return Math.atan2(cell.y - this.y, cell.x - this.x);
    }

    distanceTo(cell) {
        var dx = cell.x - this.x,
            dy = cell.y - this.y,
            distance = Math.sqrt(dx * dx + dy * dy);
        distance = (distance === 0) ? 1 : distance;
        return distance;
    }

    render() {
        c.strokeStyle = '#0af';
        c.lineWidth = 1;

        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        c.stroke();
        c.closePath();
    }

    update(index) {
        this.x += this.vx;
        this.y += this.vy;

        if (cells.length > 1) {
            for (var i = 0; i < cells.length; i++) {
                if (i !== index) {
                    var angle1 = this.angleTo(cells[i]),
                        angle2 = cells[i].angleTo(this),
                        force = (springs.length === 0) ? 1 : 0.01;

                    if (this.distanceTo(cells[i]) < this.r + cells[i].r) {
                        this.vx -= force * Math.cos(angle1);
                        this.vy -= force * Math.sin(angle1);
                        cells[i].vx -= force * Math.cos(angle2);
                        cells[i].vy -= force * Math.sin(angle2);
                    } else {
                        if (springs.length === 0) {
                            this.vx = 0;
                            this.vy = 0;
                        }
                    }
                }
            }
        }
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setAngle(angle) {
        var length = this.getLength();
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    }

    setLength(length) {
        var angle = this.getAngle();
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    }
}

class Spring {
    constructor(cell1, cell2, offset) {
        this.cell1 = cell1;
        this.cell2 = cell2;
        this.offset = offset;
        this.k = 0.01;
    }

    render() {
        c.strokeStyle = '#fff';
        c.lineWidth = 1;

        c.beginPath();
        c.moveTo(this.cell1.x, this.cell1.y);
        c.lineTo(this.cell2.x, this.cell2.y);
        c.stroke();
        c.closePath();
    }

    update() {
        var distance = new Vector(this.cell1.x - this.cell2.x, this.cell1.y - this.cell2.y);
        distance.setLength(distance.getLength() - this.offset);

        var springForce = new Vector(distance.x * this.k, distance.y * this.k);

        this.cell2.vx += springForce.x;
        this.cell2.vy += springForce.y;

        this.cell1.vx -= springForce.x;
        this.cell1.vy -= springForce.y;
    }
}

var cells = [],
    cellsNumber = randomInt(25, 100);

cells.push(new Cell(width / 2, height / 2, 0, 0));

var springs = [];

function render() {
    clear();

    if (cells.length < cellsNumber) {
        if (cells[cells.length - 1].vx === 0 && cells[cells.length - 1].vy === 0) {
            var cell = cells[randomInt(0, cells.length - 1)],
                speed = randomFloat(-0.5, 0.5),
                direction = randomFloat(-Math.PI * 2, Math.PI * 2);

            cells.push(new Cell(cell.x, cell.y, speed, direction));
        }
    } else {
        if (springs.length === 0) {
            var stop = true;
            for (var i = 0; i < cells.length; i++) {
                if (cells[i].vx !== 0 && cells[i].vy !== 0) {
                    stop = false;
                    break;
                }
            }
            if (stop) {
                for (var i = 0; i < cells.length - 1; i++) {
                    for (var j = i + 1; j < cells.length; j++) {
                        var d = cells[i].distanceTo(cells[j]),
                            connect = true;
                        for (var k = 0; k < cells.length; k++) {
                            if (i !== k && j !== k) {
                                var d1 = cells[k].distanceTo(cells[i]),
                                    d2 = cells[k].distanceTo(cells[j]);

                                if (d * d > d1 * d1 + d2 * d2) {
                                    connect = false;
                                    break;
                                }
                            }
                        }
                        if (connect) {
                            springs.push(new Spring(cells[i], cells[j], cells[i].distanceTo(cells[j])));
                        }
                    }
                }

                for (var cell of cells) {
                    var speed = randomFloat(-0.5, 0.5),
                        direction = randomFloat(-Math.PI * 2, Math.PI * 2);
                    cell.vx = Math.cos(direction) * speed;
                    cell.vy = Math.sin(direction) * speed;
                }
            }
        }
    }

    for (var i = 0; i < cells.length; i++) {
        cells[i].update(i);
    }

    for (var spring of springs) {
        spring.update();
    }

    // if (springs.length === 0)
    for (var cell of cells) {
        cell.render();
    }

    for (var spring of springs) {
        spring.render();
    }

    requestAnimationFrame(render);
}

render();