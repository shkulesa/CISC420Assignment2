class Matrix {
  constructor(r, c) {
    this.rows = r;
    this.columns = c;
    this.data = [];
    var i, j;
    for (i = 0; i < this.rows; i++) {
      this.data.push([]);
      for (j = 0; j < this.columns; j++) {
        if (i === j) this.data[i].push(1);
        else this.data[i].push(0);
      }
    }
  }

  set values(v) {
    var i, j, idx;
    // v is already a 2d array with dims equal to rows and columns
    if (v instanceof Array && v.length === this.rows && v[0] instanceof Array && v[0].length === this.columns) {
      this.data = v;
    }
    // v is a flat array with length equal to rows * columns
    else if (v instanceof Array && typeof v[0] === 'number' && v.length === this.rows * this.columns) {
      idx = 0;
      for (i = 0; i < this.rows; i++) {
        for (j = 0; j < this.columns; j++) {
          this.data[i][j] = v[idx];
          idx++;
        }
      }
    }
    // not valid
    else {
      console.log('could not set values for ' + this.rows + 'x' + this.columns + ' maxtrix');
    }
  }

  get values() {
    return this.data.slice();
  }

  // matrix multiplication (this * rhs)
  mult(rhs) {
    var result = null;
    var i, j, k, vals, sum;
    // ensure multiplication is valid
    if (rhs instanceof Matrix && this.columns === rhs.rows) {
      result = new Matrix(this.rows, rhs.columns);
      vals = result.values;
      for (i = 0; i < result.rows; i++) {
        for (j = 0; j < result.columns; j++) {
          sum = 0;
          for (k = 0; k < this.columns; k++) {
            sum += this.data[i][k] * rhs.data[k][j];
          }
          vals[i][j] = sum;
        }
      }
      result.values = vals;
    } else {
      console.log('could not multiply - row/column mismatch');
    }
    return result;
  }

  // determinant
  determinant() {
    let result = null;
    if (this.rows === this.columns) {
      if (this.rows === 2) {
        result = this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0];
      } else {
        let i, j, k;
        let det = 0;
        let submatrix = new Matrix(this.rows - 1, this.columns - 1);
        for (i = 0; i < this.columns; i++) {
          let scale = i % 2 === 0 ? 1 : -1;
          let subvalues = [];
          for (j = 1; j < this.rows; j++) {
            for (k = 0; k < this.columns; k++) {
              if (k !== i) {
                subvalues.push(this.data[j][k]);
              }
            }
          }
          submatrix.values = subvalues;
          det += scale * this.data[0][i] * submatrix.determinant();
        }
        result = det;
      }
    } else {
      console.log('could not compute determinant of non-square matrix');
    }
    return result;
  }

  // transpose
  transpose() {
    let result = new Matrix(this.columns, this.rows);
    let i, j;
    for (i = 0; i < this.rows; i++) {
      for (j = 0; j < this.columns; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }

  // inverse
  inverse() {
    let result = null;
    if (this.rows === this.columns) {
      let i, j, det;
      let valid = true;
      let sign = 1.0;
      let cofactor_values = [];
      let minor = new Matrix(this.rows - 1, this.columns - 1);
      for (i = 0; i < this.rows; i++) {
        for (j = 0; j < this.columns; j++) {
          minor.values = this.getValuesIgnoringRowCol(i, j);
          det = minor.determinant();
          if (det === null) {
            det = 0.0;
            valid = false;
          }
          cofactor_values.push(sign * det);
          sign *= -1.0;
        }
      }
      if (valid) {
        let cofactors = new Matrix(this.rows, this.columns);
        cofactors.values = cofactor_values;
        let adjugate = cofactors.transpose();
        det = this.determinant();
        if (det !== null) {
          let inv_det = 1.0 / det;
          let inv_values = [];
          for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.columns; j++) {
              inv_values.push(inv_det * adjugate.data[i][j]);
            }
          }
          result = new Matrix(this.rows, this.columns);
          result.values = inv_values;
        }
      }
    } else {
      console.log('could not compute inverse of non-square matrix');
    }
    return result;
  }

  // Float32Array in column major order (for OpenGL)
  rawArray() {
    var flat = [];
    var i, j;
    for (j = 0; j < this.columns; j++) {
      for (i = 0; i < this.rows; i++) {
        flat.push(this.data[i][j]);
      }
    }
    return new Float32Array(flat);
  }

  // helper function for inverse calculation
  getValuesIgnoringRowCol(row, col) {
    let i, j;
    let values = [];
    for (i = 0; i < this.rows; i++) {
      for (j = 0; j < this.columns; j++) {
        if (i !== row && j !== col) {
          values.push(this.data[i][j]);
        }
      }
    }
    return values;
  }
}

Matrix.multiply = function (matrices) {
  var i;
  var result = null;
  // ensure at least 2 matrices
  if (
    matrices.length >= 2 &&
    matrices.every((item) => {
      return item instanceof Matrix;
    })
  ) {
    result = matrices[0];
    i = 1;
    while (result !== null && i < matrices.length) {
      result = result.mult(matrices[i]);
      i++;
    }
  } else {
    console.log('could not multiply - requires at least 2 matrices');
  }
  console.log(result);
  return result;
};
