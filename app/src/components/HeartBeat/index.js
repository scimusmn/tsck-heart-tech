/* eslint-disable no-console */
/* eslint-disable  prefer-destructuring */

import React from 'react';
import propTypes from 'prop-types';

import Canvas from '@components/Canvas';
// import avbII from '@components/HeartBeat/2d-AVB-ii';
// import sinusBrachycardia from '@components/HeartBeat/sinus-brachycardia';
// import sinusArrest from '@components/HeartBeat/sinus-arrest';
import sinusRhythm from '@components/HeartBeat/sinus-rhythm';
// import vfib from '@components/HeartBeat/vfib';
// import vtach from '@components/HeartBeat/vtach';

const LINE_COLOR = '#ff0000';
const LINE_WIDTH = 5;
const BG_COLOR = '#cccccc';

function rhythm(data, heartrate, sx, sy, dx, dy, speed) {
  return {
    data,
    heartrate,
    scale: {
      x: sx, y: sy, dx, dy,
    },
    speed,
  };
}

function randomChoice(options) {
  const choice = Math.floor(options.length * Math.random());
  return options[choice];
}

class HeartBeat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
    };

    const { width, height } = this.props;

    this.rhythms = [
      rhythm(sinusRhythm, 70, width * (2600 / 600), height / 2, 0, height / 4, width / 4),
    ];

    this.framerate = 30;
    this.delta = 1 / this.framerate;
    this.i0 = 0;

    this.randomRhythm();

    this.rhythm = this.rhythms[0];

    this.draw = this.draw.bind(this);

    console.log(sinusRhythm);
    console.log(this.scale);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  componentDidMount() {
    this.unpause();
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  getPoint(index) {
    const i = index % this.rhythm.data.length;
    const translation = this.rhythm.scale.x * Math.floor(index / this.rhythm.data.length);
    console.log('i', i, 'trans', translation);
    const p = this.rhythm.data[i];
    return {
      x: this.rhythm.scale.x * p.x - this.rhythm.scale.dx + translation,
      y: this.rhythm.scale.y * p.y + this.rhythm.scale.dy,
    };
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  pause() {
    window.clearInterval(this.interval);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  unpause() {
    this.interval = window.setInterval(() => {
      const { time } = this.state;
      this.setState({ time: time + this.delta });
    }, 1000 * this.delta);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  randomRhythm() {
    this.rhythm = randomChoice(this.rhythms);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  draw(ctx, time) {
    this.rhythm.scale.dx = this.rhythm.speed * time;

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    while (this.getPoint(this.i0 + 1).x < 0) {
      this.i0 += 1;
    }

    let i = this.i0;
    ctx.beginPath();
    let p = this.getPoint(i);
    ctx.moveTo(p.x, p.y);

    while (p.x < ctx.canvas.width) {
      p = this.getPoint(i);
      ctx.lineTo(p.x, p.y);
      i += 1;
    }

    ctx.stroke();
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  render() {
    const { width, height } = this.props;
    const { time } = this.state;
    return (
      <>
        <Canvas className="behind" draw={this.draw} data={time} width={width} height={height} />
        <div className="rightAligned card">
          <h2>Heart Rate | معدل ضربات القلب</h2>
          <h1 className="rightAligned">{`${this.rhythm.heartrate} bpm`}</h1>
        </div>
      </>
    );
  }
}

HeartBeat.propTypes = {
  width: propTypes.number,
  height: propTypes.number,
};

HeartBeat.defaultProps = {
  width: 600,
  height: 300,
};

export default HeartBeat;
