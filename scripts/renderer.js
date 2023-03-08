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
    this.slide2Shapes = [
      {
        points: [
          { x: 200, y: 150 },
          { x: 300, y: 300 },
          { x: 200, y: 450 },
          { x: 100, y: 300 },
        ],
        scalars: { x: 1.01, y: 1.01 },
        center: this.findCenter([
          { x: 200, y: 150 },
          { x: 300, y: 300 },
          { x: 200, y: 450 },
          { x: 100, y: 300 },
        ]),
      },

      {
        points: [
          { x: 500, y: 250 },
          { x: 600, y: 300 },
          { x: 650, y: 450 },
          { x: 550, y: 400 },
          { x: 450, y: 350 },
        ],
        scalars: { x: 1.01, y: 1.05 },
        center: this.findCenter([
          { x: 500, y: 250 },
          { x: 600, y: 300 },
          { x: 650, y: 450 },
          { x: 550, y: 400 },
          { x: 450, y: 350 },
        ]),
      },
    ];
    this.slide3Shape = {
      points: [
        { x: 362, y: 272 },
        { x: 409, y: 198 },
        { x: 455, y: 238 },
        { x: 482, y: 300 },
        { x: 455, y: 362 },
        { x: 409, y: 402 },
        { x: 362, y: 328 },
      ],
      speed: { x: 3, y: 2 },
      scalars: { x: 1.06, y: 1.03 },
      rotate: { theta: 0.1 },
      alpha: 0,
    };
    this.animationCounter = 0;
    this.shapesGrowing = true;
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
    } else {
      window.requestAnimationFrame((ts) => {
        this.animate(ts);
      });
    }

    // Update previous time to current one for next calculation of delta time
    this.prev_time = timestamp;
  }

  //
  updateTransforms(time, delta_time) {
    this.animationCounter++;
    this.slide3Shape.alpha = (this.animationCounter % 127) * 2;
    // TODO: update any transformations needed for animation

    //slide 2
    if (this.animationCounter % 30 === 0) this.shapesGrowing = !this.shapesGrowing;

    for (let i = 0; i < this.slide2Shapes.length; i++) {
      //find center
      let center = this.slide2Shapes[i].center;
      let scaleX = this.shapesGrowing ? this.slide2Shapes[i].scalars.x : 1 / this.slide2Shapes[i].scalars.x;
      let scaleY = this.shapesGrowing ? this.slide2Shapes[i].scalars.y : 1 / this.slide2Shapes[i].scalars.y;

      for (let j = 0; j < this.slide2Shapes[i].points.length; j++) {
        let point = this.slide2Shapes[i].points[j];

        //individual transform matrices
        let translate1 = new Matrix(3, 3);
        let scale = new Matrix(3, 3);
        let translate2 = new Matrix(3, 3);

        mat3x3Translate(translate1, -center.x, -center.y);
        mat3x3Scale(scale, scaleX, scaleY);
        mat3x3Translate(translate2, center.x, center.y);

        let vector = Vector3(point.x, point.y, 1);
        //create transform matrix (must be in reverse order)
        let transform = Matrix.multiply([translate2, scale, translate1]);
        //apply transform matrix
        let transformedVector = Matrix.multiply([transform, vector]);

        this.slide2Shapes[i].points[j].x = transformedVector.values[0][0];
        this.slide2Shapes[i].points[j].y = transformedVector.values[1][0];
      }
    }

    //slide 3
    let center = this.findCenter(this.slide3Shape.points);
    let scaleX = this.shapesGrowing ? this.slide3Shape.scalars.x : 1 / this.slide3Shape.scalars.x;
    let scaleY = this.shapesGrowing ? this.slide3Shape.scalars.y : 1 / this.slide3Shape.scalars.y;
    let dx = Math.trunc(this.animationCounter / 50) % 2 === 0 ? this.slide3Shape.speed.x : -this.slide3Shape.speed.x;
    let dy = Math.trunc(this.animationCounter / 50) % 2 === 0 ? this.slide3Shape.speed.y : -this.slide3Shape.speed.y;

    //transform matrices
    let translateToOrigin = new Matrix(3, 3);
    let scale = new Matrix(3, 3);
    let rotate = new Matrix(3, 3);
    let translateBack = new Matrix(3, 3);
    let translate = new Matrix(3, 3);

    mat3x3Translate(translateToOrigin, -center.x, -center.y);
    mat3x3Scale(scale, scaleX, scaleY);
    mat3x3Rotate(rotate, this.slide3Shape.rotate.theta);
    mat3x3Translate(translateBack, center.x, center.y);
    mat3x3Translate(translate, dx, dy);

    let transform = Matrix.multiply([translate, translateBack, rotate, scale, translateToOrigin]);

    for (let i = 0; i < this.slide3Shape.points.length; i++) {
      let point = this.slide3Shape.points[i];

      let vector = Vector3(point.x, point.y, 1);
      //translate point
      let transformedVector = Matrix.multiply([transform, vector]);
      this.slide3Shape.points[i].x = transformedVector.values[0][0];
      this.slide3Shape.points[i].y = transformedVector.values[1][0];
    }
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
    let diamond = [Vector3(400, 150, 1), Vector3(500, 300, 1), Vector3(400, 450, 1), Vector3(300, 300, 1)];
    let teal = [0, 128, 128, 255];
    this.drawConvexPolygon(diamond, teal);
  }

  //
  drawSlide1() {
    // TODO: draw at least 3 polygons that spin about their own centers
    //   - have each polygon spin at a different speed / direction
  }

  //
  drawSlide2() {
    // TODO: draw at least 2 polygons grow and shrink about their own centers
    //   - have each polygon grow / shrink different sizes
    //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions

    let color1 = [0, 0, 0, 255];
    let shape1Points = [];
    for (const point of this.slide2Shapes[0].points) {
      shape1Points.push(Vector3(point.x, point.y, 1));
    }
    this.drawConvexPolygon(shape1Points, color1);

    let color2 = [10, 240, 30, 255];
    let shape2Points = [];
    for (const point of this.slide2Shapes[1].points) {
      shape2Points.push(Vector3(point.x, point.y, 1));
    }
    this.drawConvexPolygon(shape2Points, color2);
  }

  //
  drawSlide3() {
    // TODO: get creative!
    //   - animation should involve all three basic transformation types
    //     (translation, scaling, and rotation)

    let color1 = [153, 50, 204, 255 - this.slide3Shape.alpha];
    let shape1Points = [];
    for (const point of this.slide3Shape.points) {
      shape1Points.push(Vector3(point.x, point.y, 1));
    }
    this.drawConvexPolygon(shape1Points, color1);
  }

  // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
  // color:        array of int [R, G, B, A]
  drawConvexPolygon(vertex_list, color) {
    this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] / 255 + ')';
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
}
