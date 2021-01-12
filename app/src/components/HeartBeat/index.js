/* eslint-disable no-console */
/* eslint-disable  prefer-destructuring */
/* eslint-disable  no-return-assign */

import React from 'react';
import propTypes from 'prop-types';

import Canvas from '@components/Canvas';
import avbII from '@components/HeartBeat/2d-AVB-ii';
import sinusBrachycardia from '@components/HeartBeat/sinus-brachycardia';
import sinusArrest from '@components/HeartBeat/sinus-arrest';
import sinusRhythm from '@components/HeartBeat/sinus-rhythm';
import vfib from '@components/HeartBeat/vfib';
import vtach from '@components/HeartBeat/vtach';

const beep = new Audio('http://sanine.net/files/beep.mp3');
const correct = new Audio('http://sanine.net/files/correct.mp3');
const incorrect = new Audio('http://sanine.net/files/incorrect.mp3');
beep.addEventListener('canplay', () => beep.playable = true);

const LINE_COLOR = '#ff0000';
const LINE_WIDTH = 5;
const BG_COLOR = '#cccccc';

function rhythm(data, heartrate, sx, sy, dx, dy, speed, threshold, treatment) {
  return {
    data,
    heartrate,
    scale: {
      x: sx, y: sy, dx, dy,
    },
    speed,
    threshold,
    treatment,
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
      mode: 'playing',
    };

    this.correctMessage = 'Correct. Press button to try another patient.'
      + ' | صيح. اضغط على الزر لتجربة مريض آخر.';
    this.incorrectMessage = 'Incorrect. Press button to try another patient.'
      + ' | غير صحيح. اضغط على الزر لتجربة مريض آخر.';

    const { width, height } = this.props;

    this.rhythms = [
      rhythm(
        avbII,
        70,
        width * (2600 / 600),
        height / 2,
        0,
        height / 4,
        width / 4,
        0.5,
        'pacemaker',
      ),
      rhythm(
        sinusBrachycardia,
        70,
        width * (5000 / 600),
        height / 2,
        0,
        height / 4,
        width / 4,
        0.5,
        'pacemaker',
      ),
      rhythm(
        sinusArrest,
        70,
        width * (2600 / 600),
        height / 2,
        0,
        height / 4,
        width / 4,
        0.5,
        'pacemaker',
      ),
      rhythm(
        vfib,
        70,
        width * (2600 / 600),
        height / 2,
        0,
        height / 4,
        width / 4,
        0.5,
        'defibrillator',
      ),
      rhythm(
        vtach,
        70,
        width * (5000 / 600),
        height / 2,
        0,
        height / 4,
        width / 4,
        0.5,
        'defibrillator',
      ),
    ];

    this.healthyRhythm = rhythm(
      sinusRhythm,
      70,
      width * (2600 / 600),
      height / 2,
      0,
      height / 4,
      width / 4,
      0.5,
      'none',
    );

    this.framerate = 30;
    this.delta = 1 / this.framerate;
    this.i0 = 0;
    this.beeping = false;

    this.randomRhythm();

    this.readPacemaker = () => this.readType('pacemaker');
    this.readDefibrillator = () => this.readType('defibrillator');

    this.draw = this.draw.bind(this);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  componentDidMount() {
    this.unpause();

    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowDown':
          this.buttonPushed();
          break;

        case 'ArrowLeft':
          this.readPacemaker();
          break;

        case 'ArrowRight':
          this.readDefibrillator();
          break;

        default:
          break;
      }
    });
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  getPoint(index) {
    const i = index % this.rhythm.data.length;
    const translation = this.rhythm.scale.x * Math.floor(index / this.rhythm.data.length);
    const p = this.rhythm.data[i];
    return {
      x: this.rhythm.scale.x * p.x - this.rhythm.scale.dx + translation,
      y: this.rhythm.scale.y * p.y + this.rhythm.scale.dy,
    };
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  setHealthy() {
    this.rhythm = this.healthyRhythm;
    this.i0 = 0;
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  buttonPushed() {
    const { mode } = this.state;
    if (mode === 'playing') {
      return;
    }

    this.randomRhythm();
    this.setState({ time: 0, mode: 'playing' });
    this.i0 = 0;
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  readType(type) {
    const { mode } = this.state;
    if (mode === 'correct') {
      return;
    }

    if (this.rhythm.treatment === type) {
      this.setState({ mode: 'correct' });
      correct.play();
      this.setHealthy();
    } else {
      this.setState({ mode: 'incorrect' });
      incorrect.play();
    }
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

  randomRhythm(allowSinus = false) {
    let r = randomChoice(this.rhythms);
    while (r === this.rhythm || (!allowSinus && r === sinusRhythm)) {
      r = randomChoice(this.rhythms);
    }
    this.rhythm = r;
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

    const y = (p.y - this.rhythm.scale.dy) / this.rhythm.scale.y;
    console.log(y);
    if (y < this.rhythm.threshold) {
      if (!this.beeping && beep.playable) {
        this.beeping = true;
        beep.play();
      }
    } else {
      this.beeping = false;
    }

    ctx.stroke();
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  render() {
    const { width, height } = this.props;
    const { time, mode } = this.state;
    let message;
    if (mode !== 'playing') {
      message = (
        <div className="card bottom">
          <h3>{mode === 'correct' ? this.correctMessage : this.incorrectMessage}</h3>
        </div>
      );
    } else {
      message = <span />;
    }
    return (
      <>
        <Canvas className="behind" draw={this.draw} data={time} width={width} height={height} />
        <div className="rightAligned card">
          <h2>Heart Rate | معدل ضربات القلب</h2>
          <h1 className="rightAligned">{`${this.rhythm.heartrate} bpm`}</h1>
        </div>
        {message}
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
