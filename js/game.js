/*jslint bitwise:true, es5: true */
    
(function (window, undefined) {
    var canvas = undefined,
        ctx = undefined;
    var body = [];
    var lastPress = undefined;
    var KEY_ENTER = 13,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40;
    var dir = 0;
    var pause = true;
    var score = 0;
    var food = undefined;
    //var wall = new Array();
    var gameover = true;
    var iBody = new Image(),
        iFood = new Image();
    var aEat = new Audio(),
        aDie = new Audio();
    var lastUpdate = 0;
        FPS = 0;
        frames = 0;
        acumDelta = 0;
        x = 50,
        y = 50;
    
    function resize(){
        var w = window.innerWidth / canvas.width;
        var h = window.innerHeight / canvas.height;
        var scale = Math.min(h, w);
        canvas.style.width = (canvas.width * scale) + 'px';
        canvas.style.height = (canvas.height * scale) + 'px';
    } 

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());

    document.addEventListener('keydown', function (evt) {
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
    function random(max) {
        return ~~(Math.random() * max);
    }
    function canPlayOgg() {
        var aud = new Audio();
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
            return true;
        } else {
            return false;
        }
    }
    function reset() {
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;
    }
    function paint(ctx) {
        var i = 0,
            l = 0;
        // Clean canvas
        ctx.fillStyle = '#F4F1BB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw player
        ctx.fillStyle = '#4c1e45';
        for (i = 0, l = body.length; i < l; i += 1) {
            //body[i].fill(ctx);
            ctx.drawImage(iBody, body[i].x, body[i].y);
        }
        //ctx.fillText('FPS: ' + FPS, 10, 10);
        // Draw food
        //ctx.fillStyle = '#efc12d';
        //food.fill(ctx);
        //ctx.drawImage(iFood, food.x, food.y);
        food.drawImage(ctx, iFood);
        // Debug last key pressed
        ctx.fillStyle = '#fff';
        //ctx.fillText('Last Press: ' + lastPress, 0, 20);
        // Draw score
        ctx.fillText('Score: ' + score, 0, 10);
        // Draw pause
        if (pause) {
            // Draw pause
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
    function act(deltaTime){
        x += 120 * deltaTime;
        if (x > canvas.width) {
            x = 0;
        }
        var i = 0,
            l = 0;
        if (!pause) {
            // GameOver Reset
            if (gameover) {
                reset();
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
                }
            }
            // Food Intersects
            if (body[0].intersects(food)) {
                body.push(new Rectangle(food.x, food.y, 10, 10));
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                aEat.play();
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
        
    }
    function repaint() {
        window.requestAnimationFrame(repaint);
        paint(ctx);
    }
    function run(){
        window.requestAnimationFrame(run, 17);
        var now = Date.now(),
        deltaTime = (now - lastUpdate) / 1000;
        if (deltaTime > 1) {
            deltaTime = 0;
        }
        lastUpdate = now;
        frames += 1;
        acumDelta += deltaTime;
        if (acumDelta > 1) {
            FPS = frames;
            frames = 0;
            acumDelta -= 1;
        }
        act(deltaTime);
        paint(ctx);
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
        window.addEventListener('resize', resize, false);
        // Create  food
        food = new Rectangle(80, 80, 10, 10);
        //start game
        if (canPlayOgg()) {
            aEat.src="img/chomp1.oga";
            aDie.src = 'img/die.oga';
        } else {
            aEat.src="assets/chomp1.m4a";
            aDie.src = 'img/die.m4a';
        }
        iBody.src = 'img/body.png';
        iFood.src = 'img/fruit.png';
        //aEat.src = 'img/chomp1.oga';
        //aDie.src = 'img/die.oga';
        run ();
        repaint();
    }


    window.addEventListener('load', init, false);
}(window));