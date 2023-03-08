

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
        

    }

    spinLogic(shape){
        let center = {x: 0, y:0};
        for(let i = 0; i<shape.length; i++){
            center.x = center.x + parseInt(shape[i].data[0]);
            center.y = center.y + parseInt(shape[i].data[1]);
        }
        center.x = center.x/shape.length;
        center.y = center/shape.length;
        // console.log(shape[0]);
        let matrix = new Matrix(3, 3);
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
        /*/
        let diamond = [
            Vector3(400, 150, 1),
            Vector3(500, 300, 1),
            Vector3(400, 450, 1),
            Vector3(300, 300, 1)
        ];
        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(diamond, teal);
        //*/
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
        
        let diamond = [
            Vector3(200, 237, 1),
            Vector3(225, 275, 1),
            Vector3(200, 312, 1),
            Vector3(175, 275, 1)
        ];

        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(diamond, teal);
        
        //A[150; 0] B[0; 0] C[75; 129.904]
        let triangle = [
            Vector3(400, 375, 1), //B
            Vector3(550, 375, 1), //A
            Vector3(475, 505, 1) //C
        ];
        let red = [200, 0, 0, 255];
        this.drawConvexPolygon(triangle, red);

        
        let rectangle = [
            Vector3(500, 300, 1),
            Vector3(500, 450, 1),
            Vector3(300, 450, 1),
            Vector3(300, 300, 1)
        ];
        this.spinLogic(triangle);
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
