/* eslint-disable react/forbid-prop-types */

import React, { createRef } from 'react';
import propTypes from 'prop-types';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const ctx = this.canvasRef.current.getContext('2d');
    const { draw, data } = this.props;
    draw(ctx, data);
  }

  render() {
    const { width, height } = this.props;
    return (
      <canvas ref={this.canvasRef} width={width} height={height} />
    );
  }
}

Canvas.propTypes = {
  width: propTypes.number,
  height: propTypes.number,
  draw: propTypes.func.isRequired,
  data: propTypes.any,
};

Canvas.defaultProps = {
  width: 300,
  height: 300,
  data: null,
};

export default Canvas;
