

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;
        this.ballCenter = {x: 200, y: 200};
        this.ballRadius = 40;
        this.ballDir = {x: 1, y: 1};
        this.slide1Diamond = {
            vectors: [
                Vector3(200, 237, 1),
                Vector3(225, 275, 1),
                Vector3(200, 312, 1),
                Vector3(175, 275, 1)
            ],
            center: this.findCenter([
                {x:200, y: 237},
                {x:225, y: 275},
                {x:200, y: 312},
                {x:175, y: 275}
            ]),
            speed: { x: 100, y: 80 },
            color: [0, 128, 128, 255],
            rotate: 0.1
        };
        this.slide1Triangle = {
            vectors: [
                //*/
                Vector3(400, 375, 1), //B
                Vector3(550, 375, 1), //A
                Vector3(475, 505, 1) //C
                /*/
                Vector3(10, 15, 1),
                Vector3(30, 15, 1),
                Vector3(20, 30, 1)
                //*/
            ],
            center: this.findCenter([
                {x:400, y: 375},
                {x:550, y: 375},
                {x:475, y: 505}
            ]),
            speed: { x: 100, y: 80 },
            color: [200, 200, 0, 255],
            rotate: 0.1
        };
        this.slide1Rectangle = {
            vectors: [
                Vector3(500, 100, 1),
                Vector3(500, 250, 1),
                Vector3(600, 250, 1),
                Vector3(600, 100, 1)
            ],
            center: this.findCenter([
                {x:500, y: 100},
                {x:500, y: 250},
                {x:600, y: 250},
                {x:600, y: 100}
            ]),
            speed: { x: 100, y: 80 },
            color: [0, 200, 0, 255],
            rotate: 0.1
        };
    }

    findCenter(points) {
        let sumX = 0;
        let sumY = 0;
        for (const point of points) {
          sumX += point.x;
          sumY += point.y;
        }
        return { x: sumX / points.length, y: sumY / points.length };
      }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
        this.ballLogic(delta_time);
        
        // console.log(Math.sin(0.261799));
        // let model_matrix = new Matrix(3, 3);
        // mat3x3Identity(model_matrix);
        // console.log(model_matrix);
        // model_matrix.values = [[1, 0, 20],
        //                        [0, 1, 20],
        //                        [0, 0, 1]];
        // console.log(model_matrix);
        // this.spinLogic(this.slide1Diamond.vectors);
        let theta1 = (this.slide1Triangle.theta * (time / 100)) % (2 * Math.PI);
        let theta2 = (this.slide1Rectangle.theta * (time / 100)) % (2 * Math.PI);
        this.spinLogic(this.slide1Triangle, theta1);
        this.spinLogic(this.slide1Rectangle, theta2);
    }

    spinLogic(shape, theta){
        // diamond = [
        //     Vector3(200, 237, 1),
        //     Vector3(225, 275, 1),
        //     Vector3(200, 312, 1),
        //     Vector3(175, 275, 1)
        // ]
        let vectors = shape.vectors;
        let p = [];
        // let center = {x: 0, y:0};
        let testTheta = 0.01;
        
        for(let i = 0; i<vectors.length; i++){
            let x = parseInt(vectors[i].values[0]);
            let y = parseInt(vectors[i].values[1]);
            let w = parseInt(vectors[i].values[2]);
            let matrix = new Matrix(3, 1);
            matrix.values = [[x],
                             [y],
                             [w]];
            p[i] = matrix;
            // center.x = center.x + x;
            // center.y = center.y + y;
        }
        // console.log(p)
        // center.x = center.x/vectors.length;
        // center.y = center.y/vectors.length;
        //T = (C * B) * A
        //A = to origin
        //B = spin
        //C = original center
        // console.log(shape[0]);
        let A = new Matrix(3, 3);
        let B  = new Matrix(3, 3);
        let C = new Matrix(3, 3);
        mat3x3Translate(A, -shape.center.x, -shape.center.y);
        mat3x3Rotate(B, testTheta); //CURRRENTTLY USING TEST THTETTAA
        mat3x3Translate(C, shape.center.x, shape.center.y);
        let rotated = Matrix.multiply([C, B, A]);
//multiply points again
        for(let i = 0; i < p.length; i++){
            let point = Matrix.multiply([rotated, p[i]]);
            shape.vectors[i] = point;
        }
        // let result = Vector3(200, 200, 1);
        // shape.vectors[0] = result;
        
    }

    ballLogic(delta_time){
        let x = this.ballCenter.x;
        let y = this.ballCenter.y;
        let r = this.ballRadius;
        let dir = this.ballDir;
        let speed = 0.50;
        if(x-r < 0 || x+r > this.canvas.width){
            dir.x = -dir.x;
        }
        if(y-r < 0 || y+r > this.canvas.height){
            dir.y = -dir.y;
        }
        this.ballCenter.x += dir.x * speed * delta_time;
        this.ballCenter.y += dir.y * speed * delta_time;
    }
    
    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        // TODO: draw bouncing ball (circle that changes direction whenever it hits an edge)
        
        
        // Following line is example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)
        /*
        diamond = [
            Vector3(200, 237, 1),
            Vector3(225, 275, 1),
            Vector3(200, 312, 1),
            Vector3(175, 275, 1)
        ]
        */
        let edges = 30;
        let teal = [0, 128, 128, 255];
        this.drawCircle(this.ballCenter, this.ballRadius, edges, teal);

        
    }

    drawCircle(center, radius, edges, color){
        let ratio = 1/edges;
        let seg = 2*Math.PI*ratio;
        let inc = 0;
        let circle = [];
        for(let p = seg; p<=2*Math.PI+seg; p+=seg){
            let x = Math.round(center.x + radius * Math.cos(p));
            let y = Math.round(center.y + radius * Math.sin(p));
            circle[inc] = Vector3(x, y, 1);
            inc++;
        }
        this.drawConvexPolygon(circle, color);
        
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction
        // this.slide1Triangle
        // this.slide1Rectangle
        this.drawConvexPolygon(this.slide1Diamond.vectors, this.slide1Diamond.color);
        this.drawConvexPolygon(this.slide1Triangle.vectors, this.slide1Triangle.color);
        this.drawConvexPolygon(this.slide1Rectangle.vectors, this.slide1Rectangle.color);
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions

    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        
        
    }
    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};
