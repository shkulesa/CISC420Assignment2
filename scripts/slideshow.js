const { createApp } = Vue;

let app;

function init() {
  app = createApp({
    data() {
      return {
        view: {
          id: 'view',
          width: 800,
          height: 600,
        },
        renderer: {},
        slide_description: ['Bouncing Ball', 'Spinning Polygons', 'Grow / Shrink', 'Fun!'],
        slide_idx: 0,
        limit_fps: true,
        fps: 10,
      };
    },
    watch: {
      limit_fps(new_value, old_value) {
        this.renderer.limitFps(new_value);
      },
      fps(new_value, old_value) {
        this.renderer.setFps(parseInt(new_value));
      },
    },
    methods: {
      prevSlide() {
        if (this.slide_idx > 0) {
          this.slide_idx -= 1;
          this.renderer.setSlideIndex(this.slide_idx);
        }
      },

      nextSlide() {
        if (this.slide_idx < this.slide_description.length - 1) {
          this.slide_idx += 1;
          this.renderer.setSlideIndex(this.slide_idx);
        }
      },
    },
  }).mount('#content');

  app.renderer = new Renderer(app.view, app.limit_fps, app.fps);
  window.requestAnimationFrame((timestamp) => {
    app.renderer.animate(timestamp);
  });
}
