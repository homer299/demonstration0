document.querySelector('canvas').width = innerWidth;
document.querySelector('canvas').height = innerHeight;
const $canvas_width_half = document.querySelector('canvas').width / 2;
const $canvas_height_half = document.querySelector('canvas').height / 2;

console.log(document.querySelector('canvas').getContext('2d'));



class Player {
    constructor(x, y, r, c) {
        this.coordinate_x = x;
        this.coordinate_y = y;
        this.radius = r;
        this.color = c;
    }

    $$draw_player() {
        document.querySelector('canvas').getContext('2d').beginPath();
        document.querySelector('canvas').getContext('2d').arc(this.coordinate_x, this.coordinate_y, this.radius, 0, Math.PI * 2, false);
        document.querySelector('canvas').getContext('2d').fillStyle = this.color;
        document.querySelector('canvas').getContext('2d').fill();
    }
}

class Enemy {
    constructor (x, y, r, c, vx, vy) {
        this.coordinate_x = x;
        this.coordinate_y = y;
        this.radius = r;
        this.color = c;
        this.velocityx = vx;
        this.velocityy = vy;
    }

    $$draw_enemy() {
        document.querySelector('canvas').getContext('2d').beginPath();
        document.querySelector('canvas').getContext('2d').arc(this.coordinate_x, this.coordinate_y, this.radius, 0, Math.PI * 2, false);
        document.querySelector('canvas').getContext('2d').fillStyle = this.color;
        document.querySelector('canvas').getContext('2d').fill();
    }

    $$update_enemy() {
        this.coordinate_x = this.coordinate_x + this.velocityx;
        this.coordinate_y = this.coordinate_y + this.velocityy;
    }
}

class Projectile {
    constructor (x, y, r, c, vx, vy) {
        this.coordinate_x = x;
        this.coordinate_y = y;
        this.radius = r;
        this.color = c;
        this.velocityx = vx;
        this.velocityy = vy;
    }

    $$draw_projectile() {
        document.querySelector('canvas').getContext('2d').beginPath();
        document.querySelector('canvas').getContext('2d').arc(this.coordinate_x, this.coordinate_y, this.radius, 0, Math.PI * 2, false);
        document.querySelector('canvas').getContext('2d').fillStyle = this.color;
        document.querySelector('canvas').getContext('2d').fill();
    }

    $$update_projectile() {
        this.coordinate_x = this.coordinate_x + this.velocityx;
        this.coordinate_y = this.coordinate_y + this.velocityy;
    }
}

const $friction = 0.99;
class Particle {
    constructor (x, y, r, c, v) {
        this.coordinate_x = x;
        this.coordinate_y = y;
        this.radius = r;
        this.color = c;
        this.velocity = v;
        this.alpha = 1;
    }

    $$draw_particle() {
        document.querySelector('canvas').getContext('2d').save();
        document.querySelector('canvas').getContext('2d').globalAlpha = this.alpha;
        document.querySelector('canvas').getContext('2d').beginPath();
        document.querySelector('canvas').getContext('2d').arc(this.coordinate_x, this.coordinate_y, this.radius, 0, Math.PI * 2, false);
        document.querySelector('canvas').getContext('2d').fillStyle = this.color;
        document.querySelector('canvas').getContext('2d').fill();
        document.querySelector('canvas').getContext('2d').restore();
    }

    $$update_particle() {
        this.velocity.x = this.velocity.x * $friction;
        this.velocity.y = this.velocity.y * $friction;
        this.coordinate_x = this.coordinate_x + this.velocity.x;
        this.coordinate_y = this.coordinate_y + this.velocity.y;
        this.alpha = this.alpha - 0.01;
    }
}


const $projectiles = [];
const $player = new Player($canvas_width_half, $canvas_height_half, 15, 'rgb(225,225,225)');
const $enemies = [];


function $$newprojectile (event) {
    const $angle = Math.atan2(event.clientY - $canvas_height_half, event.clientX - $canvas_width_half);
    const $velocityx = Math.cos($angle) * 8;
    const $velocityy = Math.sin($angle) * 8;
    $projectiles.push(new Projectile($canvas_width_half, $canvas_height_half, 5, 'rgb(255,255,255)', $velocityx, $velocityy));
}

const $particles = [];
let $stop;

//function to create frames or just kind of updates the status of canvas....
function $$animate() {

    //variable $stop (created out of this scope) with "let" will be used to stop the animation
    $stop = requestAnimationFrame($$animate);
    document.querySelector('canvas').getContext('2d').fillStyle = 'rgb(0,0,0,0.1)';
    document.querySelector('canvas').getContext('2d').fillRect(0, 0, document.querySelector('canvas').width, document.querySelector('canvas').height);
    $player.$$draw_player();

    //When player's projectile hits an enemy it creates particles. 
    //Here it is checked if these particles should disapear or stay on screen.
    $particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            $particles.splice(index, 1);
        } else {
            particle.$$draw_particle();
            particle.$$update_particle();
        }
    })

    /*
        There is a list called "$projectiles". When player clicks on the screen these projectiles are created.
        Each projectile is appended on this list, and here those projectiles are drawn on screen.
        But if the projectiles move out of canvas borders, they are deleted from the list $projectiles
    */
    $projectiles.forEach((projectile, index) => {
        projectile.$$draw_projectile();
        projectile.$$update_projectile();
        if (projectile.coordinate_x + projectile.radius < 0 || projectile.coordinate_x - projectile.radius > document.querySelector('canvas').width || projectile.coordinate_y + projectile.radius < 0 || projectile.coordinate_y - projectile.radius > document.querySelector('canvas').height) {
            setTimeout(() => {$projectiles.splice(index, 1)}, 0);
        }
    })


    //In all code bellow it is checked if there was a collision between: projectile_enemy or player_enemy 

    //player_enemy collision detection

    $enemies.forEach((enemy, index) => {
        enemy.$$draw_enemy();
        enemy.$$update_enemy();

        const $distance_player_enemy = Math.hypot($player.coordinate_x - enemy.coordinate_x, $player.coordinate_y - enemy.coordinate_y);
        if ($distance_player_enemy - enemy.radius - $player.radius < 1) {
            cancelAnimationFrame($stop);
        }


        //projectile_enemy collision detection
        $projectiles.forEach((projectile, projectileIndex) => {
            const $distance_projectile_enemy = Math.sqrt((enemy.coordinate_x - projectile.coordinate_x) * (enemy.coordinate_x - projectile.coordinate_x) + (enemy.coordinate_y - projectile.coordinate_y) * (enemy.coordinate_y - projectile.coordinate_y));
            if ($distance_projectile_enemy < enemy.radius + projectile.radius) {


                //When projectiles hit enemies are created particles
                for (let i = 0; i < enemy.radius / 4; i++) {
                    $particles.push(new Particle(projectile.coordinate_x, projectile.coordinate_y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 9), y: (Math.random() - 0.5) * (Math.random() * 9)}))
                }


                //here both projectile and the enemy are deleted from their list
                setTimeout(() => {
                    $enemies.splice(index, 1);
                    $projectiles.splice(projectileIndex, 1);
                }, 0)
            }
        })
    })
}



function $$spawnEnemiesFunction () {
    const $radius_enemy = Math.random() * 50 + 9;
    let $x;
    let $y;
    if (Math.random () < 0.5) {
        $x = Math.random() < 0.5 ? - $radius_enemy : document.querySelector('canvas').width + $radius_enemy;
        $y = Math.random() * document.querySelector('canvas').height;
    } else {
        $x = Math.random() * document.querySelector('canvas').width;
        $y = Math.random() < 0.5 ? - $radius_enemy : document.querySelector('canvas').height + $radius_enemy;
    }
    const $angle0 = Math.atan2($canvas_height_half - $y, $canvas_width_half - $x);
    const $velocityx0 = Math.cos($angle0) * ((10 / $radius_enemy) + 1) * 1.6;
    const $velocityy0 = Math.sin($angle0) * ((10 / $radius_enemy) + 1) * 1.6;
    const $color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    $enemies.push(new Enemy($x, $y, $radius_enemy, $color, $velocityx0, $velocityy0));
}




$$animate();
window.addEventListener('click', $$newprojectile);
setInterval($$spawnEnemiesFunction, 1000);