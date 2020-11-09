/*jslint bitwise:true, es5: true */
    
(function (window, undefined) {
    'use strict';
    var KEY_ENTER = 13,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40;
    
    var canvas = undefined,
        ctx = undefined;
    var lastPress = undefined;
    var pause = false;
    var gameover = false;
    
    var dir = 0;
    var body = [];
    var score = 0;
    var food = undefined;
    var fruit = undefined;
    //var wall = new Array();
    
    var iBody = new Image(),
        iFood = new Image();
    var iStar = new Image();
    var aEat = new Audio(),
        aDie = new Audio();
    
    var currentScene = 0,
        scenes = [];
    var mainScene = undefined,
        gameScene = undefined;
    var highscoreScene = undefined;
    var highscores = [];
    var posHighscore = 10;

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());

    document.addEventListener('keydown', function (evt) {
        if (evt.which >= 37 && evt.which <= 40) {
            evt.preventDefault();
        }
        lastPress = evt.which;
    }, false);

    function Rectangle(x, y, width, height) {
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;

        Rectangle.prototype.intersects = function (rect) {
            if (rect === undefined) {
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
            }
        };
        Rectangle.prototype.fill = function (ctx) {
            if (ctx === undefined) {
                window.console.warn('Missing parameters on function fill');
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };
        Rectangle.prototype.drawImage = function (ctx, img) {
            if (img === undefined) {
                window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                    ctx.drawImage(img, this.x, this.y);
                } else {
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        };
    }
    function Scene() {
        this.id = scenes.length;
        scenes.push(this);
    }
    Scene.prototype = {
        constructor: Scene,
        load: function () {},
        paint: function (ctx) {},
        act: function () {}
    }
    function loadScene(scene) {
        currentScene = scene.id;
        scenes[currentScene].load();
    }
    function random(max) {
        return ~~(Math.random() * max);
    }
    function addHighscore(score){
        posHighscore = 0;
        while (highscores[posHighscore] > score && posHighscore < highscores.length) {
            posHighscore += 1;
        }
        highscores.splice(posHighscore, 0, score);
        if (highscores.length > 10) {
            highscores.length = 10;
        }
        localStorage.highscores = highscores.join(',');
    }
    
    function canPlayOgg() {
        var aud = new Audio();
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
            return true;
        } else {
            return false;
        }
    }
    
    function repaint() {
        window.requestAnimationFrame(repaint);
        if (scenes.length) {
            scenes[currentScene].paint(ctx);
        }
    }
    function sendinformation (score){
        fetch(`https://jsonplaceholder.typicode.com/users?posts=${score}`, {
            method: 'GET'
        })
        .then(function(response) {
            if(response.ok) {
                console.log('Score sent successfully');
                console.log(response);
            }
        })
        .catch(function(err) {
            console.log('Error trying to send the score');
        });
    }
    function run(){
        setTimeout(run, 50);
        if (scenes.length) {
            scenes[currentScene].act();
        }
    }
    function init() {
        /* Create walls
        wall.push(new Rectangle(100, 50, 10, 10));
        wall.push(new Rectangle(100, 100, 10, 10));
        wall.push(new Rectangle(200, 50, 10, 10));
        wall.push(new Rectangle(200, 100, 10, 10));*/
        // Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        
        // Load assets
        if (canPlayOgg()) {
            aEat.src="img/chomp1.oga";
            aDie.src = 'img/die.oga';
        } else {
            aEat.src="assets/chomp1.m4a";
            aDie.src = 'img/die.m4a';
        }
        iBody.src = 'img/body.png';
        iFood.src = 'img/fruit.png';
        iStar.src = 'img/star.png';

        // Create  food
        food = new Rectangle(80, 80, 10, 10);
        // Create  fruit
        fruit = new Rectangle(80, 80, 10, 10);
        // Load saved highscores
        if (localStorage.highscores) {
            highscores = localStorage.highscores.split(',');
        }
        //start game
        run ();
        repaint();
    }

    // Main Scene
    mainScene = new Scene();

    mainScene.paint = function (ctx) {
        // Clean canvas
        ctx.fillStyle = '#4c1e45';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', 150, 60);
        ctx.fillText('Press Enter', 150, 90);
    };
    
    mainScene.act = function () {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(highscoreScene);
            lastPress = null;
        }
    };
    
    // Game Scene
    gameScene = new Scene();

    gameScene.load = function () {
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;
    };

    gameScene.paint = function (ctx) {
        var i = 0,
            l = 0;
        // Clean canvas
        ctx.fillStyle = '#F4F1BB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw player
        ctx.fillStyle = '#4c1e45';
        for (i = 0, l = body.length; i < l; i += 1) {
            body[i].drawImage(ctx, iBody);
        }
        // Draw food
        ctx.strokeStyle = '#f00';
        food.drawImage(ctx, iFood);
        // Draw fruit
        window.setTimeout(fruit.drawImage(ctx, iStar), random(300)+5000)
    
        // Debug last key pressed
            //ctx.fillText('Last Press: ' + lastPress, 0, 20);
        // Draw score
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: ' + score, 0, 10);
        // Draw pause
        if (pause) {
            ctx.textAlign = 'center';
            if (gameover) {
                ctx.fillText('GAME OVER', 150, 75);
            } else {
                ctx.fillText('PAUSE', 150, 75);
            }
            ctx.textAlign = 'left';
        }
        /* Draw walls
        ctx.fillStyle = '#999';
        for (i = 0, l = wall.length; i < l; i += 1) {
            wall[i].fill(ctx);
        }  */  
    }

    gameScene.act = function (){
        var i = 0,
            l = 0;
        if (!pause) {
            // GameOver Reset
            if (gameover) {
                loadScene(highscoreScene);
            }      
            // Move Body
            for (i = body.length - 1; i > 0; i -= 1) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }
            // Change Direction
            if (lastPress === KEY_UP && dir !== 2) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT && dir !== 3) {
                dir = 1;
            }
            if (lastPress === KEY_DOWN && dir !== 0) {
                dir = 2;
            }
            if (lastPress === KEY_LEFT && dir !== 1) {
                dir = 3;
            }
            // Move Head
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
                body[0].x -= 10;
            }
            /* Move Rect
            if (dir == 0) {
                body[0].y -= 10;
            }
            if (dir == 1) {
                body[0].x += 10;
            }
            if (dir == 2) {
                body[0].y += 10;
            }
            if (dir == 3) {
                body[0].x -= 10;
            }*/
            // Out Screen
            if (body[0].x > canvas.width - body[0].width) {
                body[0].x = 0;
            }
            if (body[0].y > canvas.height - body[0].height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = canvas.width - body[0].width;
            }
            if (body[0].y < 0) {
                body[0].y = canvas.height - body[0].height;
            }
            // Body Intersects
            for (i = 2, l = body.length; i < l; i += 1) {
                if (body[0].intersects(body[i])) {
                    gameover = true;
                    pause = true;
                    aDie.play();
                    addHighscore(score);
                }
            }
            // Food Intersects
            if (body[0].intersects(food)) {
                body.push(new Rectangle(food.x, food.y, 10, 10));
                score += 1;
                sendinformation(score)
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                aEat.play();
            }
            // Fruit intersects
            if (body[0].intersects(fruit)) {
                score += 5;
                sendinformation(score)
                aEat.play();
                fruit.x = canvas.width+1;
                fruit.y = null;
                setTimeout(function fStar() {
                    fruit.x = random(canvas.width / 10 - 1) * 10;
                    fruit.y = random(canvas.height / 10 - 1) * 10;
                }, random(3000)+5000)
            }
            /* Wall Intersects
            for (i = 0, l = wall.length; i < l; i += 1) {
                if (food.intersects(wall[i])) {
                    food.x = random(canvas.width / 10 - 1) * 10;
                    food.y = random(canvas.height / 10 - 1) * 10;
                }

                if (body[0].intersects(wall[i])) {
                    gameover = true;
                    pause = true;
                }
            }*/
        }
        // Pause/Unpause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = undefined;
        }
    };    
    // Highscore Scene
    highscoreScene = new Scene();
    highscoreScene.paint = function (ctx) {
        var i = 0,
        l = 0;
    
        // Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', 150, 30);
    
        // Draw high scores
        ctx.textAlign = 'right';
        for (i = 0, l = highscores.length; i < l; i += 1) {
            if (i === posHighscore) {
                ctx.fillText('*' + highscores[i], 180, 40 + i * 10);
            } else {
                ctx.fillText(highscores[i], 180, 40 + i * 10);
            }
        }
    };
    highscoreScene.act = function () {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(gameScene);
            lastPress = null;
        }
    };
    window.addEventListener('load', init, false);
}(window));