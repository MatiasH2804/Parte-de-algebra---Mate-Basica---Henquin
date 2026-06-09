const ejemplos = {
  2: [[3, 5], [2, -4]],
  3: [[2, -1, 3], [4, 0, 5], [-2, 7, 1]],
  4: [[1, 2, 0, -1], [3, 1, 4, 2], [0, -2, 5, 1], [2, 3, -1, 4]],
  5: [[2, 1, -1, 3, 0], [4, 0, 2, -1, 5], [1, 3, 1, 0, -2], [0, -2, 4, 1, 3], [5, 1, 0, -3, 2]],
  6: [[3, 1, 0, -2, 4, 1], [2, 5, -1, 0, 3, -2], [0, 2, 4, 1, -1, 3], [1, -3, 2, 6, 0, 2], [4, 0, 1, -1, 5, 1], [2, 1, 3, 0, -2, 4]],
  7: [[2, 1, 0, -1, 3, 2, 4], [0, 3, 2, 1, -2, 5, 1], [4, -1, 5, 0, 2, 1, -3], [1, 2, -2, 4, 0, 3, 2], [3, 0, 1, -3, 6, -1, 5], [2, 4, 0, 1, -1, 2, 3], [5, 1, -3, 2, 4, 0, 1]],
  8: [[4, 1, 0, -2, 3, 1, 5, -1], [2, 6, -1, 0, 4, -2, 1, 3], [0, 3, 5, 1, -1, 2, -2, 4], [1, -2, 2, 7, 0, 3, 1, -3], [3, 0, 1, -1, 6, 1, 2, 5], [2, 1, 4, 0, -2, 5, 3, 1], [5, -1, 0, 3, 1, -3, 4, 2], [1, 4, -2, 2, 5, 0, -1, 6]]
};

document.addEventListener("DOMContentLoaded", () => {
  crearMatriz();
  qs("btnCrear").addEventListener("click", crearMatriz);
  qs("orden").addEventListener("change", crearMatriz);
  qs("btnEjemplo").addEventListener("click", cargarEjemplo);
  qs("btnLimpiar").addEventListener("click", limpiarMatriz);
  qs("btnResolver").addEventListener("click", resolver);
});

function qs(id) {
  return document.getElementById(id);
}

function crearMatriz() {
  const n = Number(qs("orden").value);
  let html = '<table class="matrix-table" aria-label="Matriz">';

  for (let i = 0; i < n; i++) {
    html += "<tr>";
    for (let j = 0; j < n; j++) {
      html += `<td><input id="a${i}${j}" inputmode="decimal" autocomplete="off" value="0" aria-label="Elemento fila ${i + 1}, columna ${j + 1}"></td>`;
    }
    html += "</tr>";
  }

  html += "</table>";
  qs("matriz").innerHTML = html;
  qs("estado").textContent = `Matriz ${n} x ${n} lista para calcular.`;
  qs("resultado").className = "resultado-empty";
  qs("resultado").textContent = "Todavia no se calculo ningun determinante.";
  qs("pasos").innerHTML = "";
}

function cargarEjemplo() {
  const n = Number(qs("orden").value);
  ejemplos[n].forEach((fila, i) => fila.forEach((valor, j) => {
    qs(`a${i}${j}`).value = valor;
  }));
}

function limpiarMatriz() {
  document.querySelectorAll("#matriz input").forEach(input => {
    input.value = "0";
  });
  qs("estado").textContent = "Matriz limpia.";
  qs("resultado").className = "resultado-empty";
  qs("resultado").textContent = "Todavia no se calculo ningun determinante.";
  qs("pasos").innerHTML = "";
}

function leerMatriz() {
  const n = Number(qs("orden").value);
  const A = [];

  for (let i = 0; i < n; i++) {
    const fila = [];
    for (let j = 0; j < n; j++) {
      const texto = qs(`a${i}${j}`).value.trim();
      const valor = parseNumber(texto);
      if (!Number.isFinite(valor)) {
        throw new Error(`El valor de la fila ${i + 1}, columna ${j + 1} no es valido.`);
      }
      fila.push(valor);
    }
    A.push(fila);
  }

  return A;
}

function parseNumber(texto) {
  if (texto === "") return 0;
  const normalizado = texto.replace(",", ".");
  if (normalizado.includes("/")) {
    const partes = normalizado.split("/");
    if (partes.length !== 2) return NaN;
    const num = Number(partes[0]);
    const den = Number(partes[1]);
    return den === 0 ? NaN : num / den;
  }
  return Number(normalizado);
}

function resolver() {
  try {
    const A = leerMatriz();
    const n = A.length;
    const pasos = [];
    let resultado;

    if (n === 2) resultado = resolver2x2(A, pasos, "A");
    if (n === 3) resultado = resolver3x3(A, pasos, "A");
    if (n === 4) resultado = resolver4x4(A, pasos);
    if (n >= 5) resultado = resolverGauss(A, pasos);

    qs("estado").textContent = `Determinante calculado para una matriz ${n} x ${n}.`;
    qs("resultado").className = "resultado-box";
    qs("resultado").innerHTML = `<span>Resultado</span><div class="result-math">\\[\\det(A)=${fmt(resultado.valor)}\\]</div>`;
    qs("pasos").innerHTML = pasos.map((paso, index) => stepCard(index + 1, paso.titulo, paso.html)).join("");
    renderMath();
  } catch (error) {
    qs("estado").textContent = "No se pudo calcular.";
    qs("resultado").className = "resultado-error";
    qs("resultado").textContent = error.message;
    qs("pasos").innerHTML = "";
  }
}

function resolver2x2(M, pasos, nombre = "A") {
  const data = det2Data(M);
  pasos.push({
    titulo: "Formula del determinante 2 x 2",
    html: mathBlock(`\\det(${nombre})=ad-bc`)
  });
  pasos.push({
    titulo: "Sustitucion y calculo",
    html: mathBlock(`${matrixLatex(M)}=(${fmt(data.a)}\\cdot${fmt(data.d)})-(${fmt(data.b)}\\cdot${fmt(data.c)})`)
      + mathBlock(`=${fmt(data.ad)}-${fmt(data.bc)}=${fmt(data.valor)}`)
  });
  return { valor: data.valor };
}

function resolver3x3(M, pasos, nombre = "A", tituloBase = "") {
  const minors = firstRowMinors(M);
  const dets = minors.map(minor => det2Data(minor.matrix));
  const valor = minors.reduce((acc, minor, i) => acc + minor.sign * minor.coeff * dets[i].valor, 0);

  pasos.push({
    titulo: `${tituloBase}Expansion por cofactores`,
    html: mathBlock(`\\det(${nombre})=${fmt(minors[0].coeff)}${matrixLatex(minors[0].matrix)}-${fmt(minors[1].coeff)}${matrixLatex(minors[1].matrix)}+${fmt(minors[2].coeff)}${matrixLatex(minors[2].matrix)}`)
  });

  minors.forEach((minor, i) => {
    const d = dets[i];
    pasos.push({
      titulo: `${tituloBase}Calculo del menor M_{1${i + 1}}`,
      html: mathBlock(`${matrixLatex(minor.matrix)}=(${fmt(d.a)}\\cdot${fmt(d.d)})-(${fmt(d.b)}\\cdot${fmt(d.c)})`)
        + mathBlock(`=${fmt(d.ad)}-${fmt(d.bc)}=${fmt(d.valor)}`)
    });
  });

  pasos.push({
    titulo: `${tituloBase}Sustitucion`,
    html: mathBlock(`\\det(${nombre})=${fmt(minors[0].coeff)}(${fmt(dets[0].valor)})-${fmt(minors[1].coeff)}(${fmt(dets[1].valor)})+${fmt(minors[2].coeff)}(${fmt(dets[2].valor)})`)
      + mathBlock(`=${fmt(minors[0].coeff * dets[0].valor)}-${fmt(minors[1].coeff * dets[1].valor)}+${fmt(minors[2].coeff * dets[2].valor)}=${fmt(valor)}`)
  });

  return { valor };
}

function resolver4x4(M, pasos) {
  const minors = firstRowMinors(M);
  const dets = [];

  pasos.push({
    titulo: "Expansion por cofactores",
    html: mathBlock(`\\det(A)=a_{11}M_{11}-a_{12}M_{12}+a_{13}M_{13}-a_{14}M_{14}`)
      + mathBlock(`\\det(A)=${fmt(minors[0].coeff)}M_{11}-${fmt(minors[1].coeff)}M_{12}+${fmt(minors[2].coeff)}M_{13}-${fmt(minors[3].coeff)}M_{14}`)
  });

  minors.forEach((minor, i) => {
    pasos.push({
      titulo: `Menor 3 x 3 M_{1${i + 1}}`,
      html: mathBlock(`M_{1${i + 1}}=${matrixLatex(minor.matrix)}`)
    });
    const subSteps = [];
    const res = resolver3x3(minor.matrix, subSteps, `M_{1${i + 1}}`, `M_{1${i + 1}} - `);
    dets.push(res.valor);
    pasos.push(...subSteps);
  });

  const valor = minors.reduce((acc, minor, i) => acc + minor.sign * minor.coeff * dets[i], 0);
  pasos.push({
    titulo: "Sustitucion final",
    html: mathBlock(`\\det(A)=${fmt(minors[0].coeff)}(${fmt(dets[0])})-${fmt(minors[1].coeff)}(${fmt(dets[1])})+${fmt(minors[2].coeff)}(${fmt(dets[2])})-${fmt(minors[3].coeff)}(${fmt(dets[3])})`)
      + mathBlock(`=${fmt(minors[0].coeff * dets[0])}-${fmt(minors[1].coeff * dets[1])}+${fmt(minors[2].coeff * dets[2])}-${fmt(minors[3].coeff * dets[3])}=${fmt(valor)}`)
  });

  pasos.push({
    titulo: "Resultado",
    html: mathBlock(`\\boxed{\\det(A)=${fmt(valor)}}`)
  });

  return { valor };
}

function resolverGauss(A, pasos) {
  const M = A.map(fila => fila.slice());
  const n = M.length;
  let swaps = 0;
  let paso = 1;

  pasos.push({
    titulo: "Matriz inicial",
    html: mathBlock(`A=${matrixLatex(M)}`)
  });

  for (let col = 0; col < n - 1; col++) {
    let pivot = col;
    while (pivot < n && casiCero(M[pivot][col])) pivot++;

    if (pivot === n) {
      pasos.push({
        titulo: `Columna ${col + 1} sin pivote`,
        html: mathBlock(`\\text{No hay pivote no nulo en la columna ${col + 1}.}`)
      });
      continue;
    }

    if (pivot !== col) {
      [M[col], M[pivot]] = [M[pivot], M[col]];
      swaps++;
      pasos.push({
        titulo: `Paso ${paso}: intercambio de filas`,
        html: mathBlock(`F_{${col + 1}}\\leftrightarrow F_{${pivot + 1}}`)
          + mathBlock(matrixLatex(M))
      });
      paso++;
    }

    for (let row = col + 1; row < n; row++) {
      if (casiCero(M[row][col])) continue;
      const factor = M[row][col] / M[col][col];
      for (let k = col; k < n; k++) {
        M[row][k] -= factor * M[col][k];
        if (casiCero(M[row][k])) M[row][k] = 0;
      }
      pasos.push({
        titulo: `Paso ${paso}: anulacion bajo el pivote`,
        html: mathBlock(`F_{${row + 1}}\\leftarrow F_{${row + 1}}-${fmt(factor)}F_{${col + 1}}`)
          + mathBlock(matrixLatex(M))
      });
      paso++;
    }
  }

  const diagonal = M.map((fila, i) => fila[i]);
  const producto = diagonal.reduce((acc, valor) => acc * valor, 1);
  const det = (swaps % 2 === 0 ? 1 : -1) * producto;

  pasos.push({
    titulo: "Producto de la diagonal",
    html: mathBlock(`\\det(A)=(-1)^p\\prod_{i=1}^{${n}}u_{ii}`)
      + mathBlock(`p=${swaps},\\quad \\det(A)=(-1)^{${swaps}}\\cdot${diagonal.map(fmt).join("\\cdot")}`)
      + mathBlock(`\\boxed{\\det(A)=${fmt(det)}}`)
  });

  return { valor: det };
}

function firstRowMinors(M) {
  return M[0].map((coeff, col) => ({
    coeff,
    sign: col % 2 === 0 ? 1 : -1,
    matrix: minorMatrix(M, 0, col)
  }));
}

function minorMatrix(M, rowToRemove, colToRemove) {
  return M
    .filter((_, i) => i !== rowToRemove)
    .map(row => row.filter((_, j) => j !== colToRemove));
}

function det2Data(M) {
  const [a, b] = M[0];
  const [c, d] = M[1];
  const ad = a * d;
  const bc = b * c;
  return { a, b, c, d, ad, bc, valor: ad - bc };
}

function matrixLatex(M) {
  return `\\begin{vmatrix}${M.map(row => row.map(fmt).join("&")).join("\\\\")}\\end{vmatrix}`;
}

function mathBlock(latex) {
  return `<div class="math-display">\\[${latex}\\]</div>`;
}

function stepCard(numero, titulo, html) {
  return `
    <article class="step-card">
      <div class="step-index">Paso ${numero}</div>
      <h3>${titulo}</h3>
      ${html}
    </article>
  `;
}

function renderMath() {
  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([qs("resultado"), qs("pasos")]);
  }
}

function fmt(value) {
  if (Object.is(value, -0) || Math.abs(value) < 1e-10) return "0";
  if (Number.isInteger(value)) return String(value);
  const fixed = Number(value.toFixed(6));
  return String(fixed);
}

function casiCero(value) {
  return Math.abs(value) < 1e-10;
}
