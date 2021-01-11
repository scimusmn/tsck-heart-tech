/* eslint-disable no-console */

import React from 'react';

import Canvas from '@components/Canvas';
import sinusRhythm from '@components/HeartBeat/sinusRhythm';

class HeartBeat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
    };

    this.framerate = 30;
    this.delta = 1 / this.framerate;
    this.i0 = 0;
    this.rhythm = sinusRhythm;
    this.scale = {
      x: 2600,
      y: 300,
      dx: 0,
    };
    this.speed = 200;

    this.draw = this.draw.bind(this);

    console.log(sinusRhythm);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  componentDidMount() {
    window.setInterval(() => {
      const { time } = this.state;
      this.setState({ time: time + this.delta });
    }, 1000 * this.delta);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  getPoint(index) {
    const i = index % this.rhythm.length;
    const translation = this.scale.x * Math.floor(index / this.rhythm.length);
    const p = this.rhythm[i];
    return {
      x: this.scale.x * p.x - this.scale.dx + translation,
      y: this.scale.y * p.y,
    };
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  draw(ctx, time) {
    this.scale.dx = 200 * time;

    ctx.strokeStyle = '#008000';
    ctx.lineWidth = 5;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    while (this.getPoint(this.i0 + 1).x < 0) {
      this.i0 += 1;
    }

    console.log(this.i0);

    let i = this.i0;
    ctx.beginPath();
    let p = this.getPoint(i);
    ctx.moveTo(p.x, p.y);

    while (p.x < ctx.canvas.width) {
      p = this.getPoint(i);
      ctx.lineTo(p.x, p.y);
      i += 1;
    }

    console.log(i);
    ctx.stroke();
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  render() {
    const { time } = this.state;
    return <Canvas draw={this.draw} data={time} />;
  }
}

export default HeartBeat;
