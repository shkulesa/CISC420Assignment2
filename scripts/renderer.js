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
    this.ballCenter = { x: 200, y: 200 };
    this.ballRadius = 40;
    this.ballDir = { x: 1, y: 1 };
    this.slide1Shapes = [
      {
        //diamond
        points: [
          { x: 200, y: 237 },
          { x: 225, y: 275 },
          { x: 200, y: 312 },
          { x: 175, y: 275 },
        ],
        def: [
          { x: 200, y: 237 },
          { x: 225, y: 275 },
          { x: 200, y: 312 },
          { x: 175, y: 275 },
        ],
        center: this.findCenter([
          { x: 200, y: 237 },
          { x: 225, y: 275 },
          { x: 200, y: 312 },
          { x: 175, y: 275 },
        ]),
        speed: { x: 100, y: 80 },
        color: [0, 128, 128, 255],
        rotate: 0.2,
      },
      {
        //triangle
        points: [
          { x: 400, y: 375 },
          { x: 550, y: 375 },
          { x: 475, y: 505 },
        ],
        def: [
          { x: 400, y: 375 },
          { x: 550, y: 375 },
          { x: 475, y: 505 },
        ],
        center: this.findCenter([
          { x: 400, y: 375 },
          { x: 550, y: 375 },
          { x: 475, y: 505 },
        ]),
        speed: { x: 100, y: 80 },
        color: [200, 200, 0, 255],
        rotate: -0.3,
      },
      {
        //rectangle
        points: [
          { x: 500, y: 100 },
          { x: 500, y: 250 },
          { x: 600, y: 250 },
          { x: 600, y: 100 },
        ],
        def: [
          { x: 500, y: 100 },
          { x: 500, y: 250 },
          { x: 600, y: 250 },
          { x: 600, y: 100 },
        ],
        center: this.findCenter([
          { x: 500, y: 100 },
          { x: 500, y: 250 },
          { x: 600, y: 250 },
          { x: 600, y: 100 },
        ]),
        speed: { x: 100, y: 80 },
        color: [0, 200, 0, 255],
        rotate: 0.7,
      },
    ];

    this.slide2Shapes = [
      {
        def: [
          { x: 200, y: 150 },
          { x: 300, y: 300 },
          { x: 200, y: 450 },
          { x: 100, y: 300 },
        ],
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
        def: [
          { x: 500, y: 250 },
          { x: 600, y: 300 },
          { x: 650, y: 450 },
          { x: 550, y: 400 },
          { x: 450, y: 350 },
        ],
        points: [
          { x: 500, y: 250 },
          { x: 600, y: 300 },
          { x: 650, y: 450 },
          { x: 550, y: 400 },
          { x: 450, y: 350 },
        ],
        scalars: { x: 1.5, y: 1.01 },
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
      def: [
        { x: 162, y: 172 },
        { x: 209, y: 98 },
        { x: 255, y: 138 },
        { x: 282, y: 200 },
        { x: 255, y: 262 },
        { x: 209, y: 302 },
        { x: 162, y: 228 },
      ],
      points: [
        { x: 162, y: 172 },
        { x: 209, y: 98 },
        { x: 255, y: 138 },
        { x: 282, y: 200 },
        { x: 255, y: 262 },
        { x: 209, y: 302 },
        { x: 162, y: 228 },
      ],
      center: this.findCenter([
        { x: 162, y: 172 },
        { x: 209, y: 98 },
        { x: 255, y: 138 },
        { x: 282, y: 200 },
        { x: 255, y: 262 },
        { x: 209, y: 302 },
        { x: 162, y: 228 },
      ]),
      speed: { x: 100, y: 80 },
      scalars: { x: 1.06, y: 1.03 },
      rotate: 0.1,
      alpha: 0,
    };
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
    // TODO: update any transformations needed for animation
    let new_time = Math.trunc(time);

    //slide 0
    this.ballLogic(delta_time);

    //slide 1
    for (let i = 0; i < this.slide1Shapes.length; i++) {
      let center = this.slide1Shapes[i].center;
      let theta = (this.slide1Shapes[i].rotate * (time / 100)) % (2 * Math.PI);

      let rotate = new Matrix(3, 3);
      let translateToOrigin = new Matrix(3, 3);
      let translateBack = new Matrix(3, 3);
      mat3x3Rotate(rotate, theta);
      for (let j = 0; j < this.slide1Shapes[i].def.length; j++) {
        let point = this.slide1Shapes[i].def[j];
        mat3x3Translate(translateToOrigin, -center.x, -center.y);
        mat3x3Translate(translateBack, center.x, center.y);

        let vector = Vector3(point.x, point.y, 1);
        //make transform matrix
        let transform = Matrix.multiply([translateBack, rotate, translateToOrigin]);
        console.log(transform);
        let transformedVector = Matrix.multiply([transform, vector]);

        this.slide1Shapes[i].points[j].x = transformedVector.values[0][0];
        this.slide1Shapes[i].points[j].y = transformedVector.values[1][0];
      }
    }

    //slide 2
    this.shapesGrowing = Math.trunc(time / 3000) % 2 === 0 ? true : false;

    for (let i = 0; i < this.slide2Shapes.length; i++) {
      //find center
      let center = this.slide2Shapes[i].center;
      let step = (new_time % 3000) / 1000;
      let scaleX =
        Math.trunc(new_time / 3000) % 2 === 0
          ? this.slide2Shapes[i].scalars.x * step
          : this.slide2Shapes[i].scalars.x * 3 - this.slide2Shapes[i].scalars.x * step;
      let scaleY =
        Math.trunc(new_time / 3000) % 2 === 0
          ? this.slide2Shapes[i].scalars.y * step
          : this.slide2Shapes[i].scalars.y * 3 - this.slide2Shapes[i].scalars.y * step;

      for (let j = 0; j < this.slide2Shapes[i].def.length; j++) {
        let point = this.slide2Shapes[i].def[j];

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

    let step = (new_time % 3000) / 1000;
    let center = this.slide3Shape.center;
    let dx =
      Math.trunc(new_time / 3000) % 2 === 0
        ? this.slide3Shape.speed.x * step
        : this.slide3Shape.speed.x * 3 - this.slide3Shape.speed.x * step;
    let dy =
      Math.trunc(new_time / 3000) % 2 === 0
        ? this.slide3Shape.speed.y * step
        : this.slide3Shape.speed.y * 3 - this.slide3Shape.speed.y * step;
    let theta = (this.slide3Shape.rotate * (time / 100)) % (2 * Math.PI);
    dx = Math.trunc(dx);
    dy = Math.trunc(dy);

    let scaleX =
      Math.trunc(new_time / 3000) % 2 === 0
        ? this.slide3Shape.scalars.x * step
        : this.slide3Shape.scalars.x * 3 - this.slide3Shape.scalars.x * step;
    let scaleY =
      Math.trunc(new_time / 3000) % 2 === 0
        ? this.slide3Shape.scalars.y * step
        : this.slide3Shape.scalars.y * 3 - this.slide3Shape.scalars.y * step;

    //transform matrices
    let translateToOrigin = new Matrix(3, 3);
    let scale = new Matrix(3, 3);
    let rotate = new Matrix(3, 3);
    let translateBack = new Matrix(3, 3);
    let translate = new Matrix(3, 3);

    mat3x3Translate(translateToOrigin, -center.x, -center.y);
    mat3x3Scale(scale, scaleX, scaleY);
    mat3x3Rotate(rotate, theta);
    mat3x3Translate(translateBack, center.x, center.y);
    mat3x3Translate(translate, dx, dy);

    let transform = Matrix.multiply([translate, translateBack, rotate, scale, translateToOrigin]);

    for (let i = 0; i < this.slide3Shape.def.length; i++) {
      let point = this.slide3Shape.def[i];

      let vector = Vector3(point.x, point.y, 1);
      let transformedVector = Matrix.multiply([transform, vector]);
      this.slide3Shape.points[i].x = transformedVector.values[0][0];
      this.slide3Shape.points[i].y = transformedVector.values[1][0];
    }
  }

  ballLogic(delta_time) {
    let x = this.ballCenter.x;
    let y = this.ballCenter.y;
    let r = this.ballRadius;
    let dir = this.ballDir;
    let speed = 0.5;
    if (x - r < 0 || x + r > this.canvas.width) {
      if (x - r < 0) {
        this.ballCenter.x = 0 + r;
      }
      if (x + r > this.canvas.width) {
        this.ballCenter.x = this.canvas.width - r;
      }
      dir.x = -dir.x;
    }
    if (y - r < 0 || y + r > this.canvas.height) {
      if (y - r < 0) {
        this.ballCenter.y = 0 + r;
      }
      if (y + r > this.canvas.width) {
        this.ballCenter.y = this.canvas.height - r;
      }
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

    let edges = 30;
    let teal = [0, 128, 128, 255];
    this.drawCircle(this.ballCenter, this.ballRadius, edges, teal);
  }

  drawCircle(center, radius, edges, color) {
    let ratio = 1 / edges;
    let seg = 2 * Math.PI * ratio;
    let inc = 0;
    let circle = [];
    for (let p = seg; p <= 2 * Math.PI + seg; p += seg) {
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

    for (let i = 0; i < this.slide1Shapes.length; i++) {
      let shape = [];
      for (const point of this.slide1Shapes[i].points) {
        shape.push(Vector3(point.x, point.y, 1));
      }
      console.log(shape);
      this.drawConvexPolygon(shape, this.slide1Shapes[i].color);
    }
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
