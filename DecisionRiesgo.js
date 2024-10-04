const Riesgo = (() => {
    // Mostrar la sección de decisiones bajo riesgo
    function showRiesgo() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('riesgo').style.display = 'block';
    }

    // Generar la matriz de pagos para decisiones bajo riesgo
    function generarMatrizRiesgo() {
        let numAlternativas = parseInt(document.getElementById('numAlternativasRiesgo').value);
        let numEstados = parseInt(document.getElementById('numEstadosRiesgo').value);
        let matrizDiv = document.getElementById('matrizRiesgo');
        matrizDiv.innerHTML = '';

        // Generar matriz de pagos
        for (let i = 0; i < numAlternativas; i++) {
            let row = document.createElement('div');
            for (let j = 0; j < numEstados; j++) {
                let input = document.createElement('input');
                input.type = 'number';
                input.id = `altR${i}_estR${j}`;
                input.placeholder = `A${i + 1}, E${j + 1}`;
                row.appendChild(input);
            }
            matrizDiv.appendChild(row);
        }

        // Generar inputs para probabilidades
        let probRow = document.createElement('div');
        probRow.innerHTML = `<h3>Probabilidades de cada Estado</h3>`;
        for (let j = 0; j < numEstados; j++) {
            let input = document.createElement('input');
            input.type = 'number';
            input.id = `probabilidad${j}`;
            input.placeholder = `P${j + 1}`;
            probRow.appendChild(input);
        }
        matrizDiv.appendChild(probRow);

        document.getElementById('opcionesRiesgo').style.display = 'block';
    }

    // Obtener la matriz de pagos ingresada en la interfaz
    function obtenerMatrizRiesgo() {
        let numAlternativas = parseInt(document.getElementById('numAlternativasRiesgo').value);
        let numEstados = parseInt(document.getElementById('numEstadosRiesgo').value);
        let matriz = [];

        for (let i = 0; i < numAlternativas; i++) {
            let fila = [];
            for (let j = 0; j < numEstados; j++) {
                fila.push(parseFloat(document.getElementById(`altR${i}_estR${j}`).value) || 0);
            }
            matriz.push(fila);
        }

        let probabilidades = [];
        for (let j = 0; j < numEstados; j++) {
            probabilidades.push(parseFloat(document.getElementById(`probabilidad${j}`).value) || 0);
        }

        return { matriz, probabilidades };
    }

    // Eliminar alternativas dominadas
    function eliminarDominadas(matriz, M, N) {
        let dominada = new Array(M).fill(false);
        let nuevasAlternativas = M;

        for (let i = 0; i < M; i++) {
            let siempreNegativa = true;
            for (let j = 0; j < N; j++) {
                if (matriz[i][j] > 0) {
                    siempreNegativa = false;
                    break;
                }
            }

            if (siempreNegativa) {
                dominada[i] = true;
                nuevasAlternativas--;
                continue;
            }

            for (let j = 0; j < M; j++) {
                if (i !== j) {
                    let esDominada = true;
                    for (let k = 0; k < N; k++) {
                        if (matriz[i][k] > matriz[j][k]) {
                            esDominada = false;
                            break;
                        }
                    }

                    if (esDominada) {
                        dominada[i] = true;
                        nuevasAlternativas--;
                        break;
                    }
                }
            }
        }

        return matriz.filter((_, index) => !dominada[index]);
    }

    // Criterio de Maximización del Valor Monetario Esperado (VME)
    function criterioVME() {
        let { matriz, probabilidades } = obtenerMatrizRiesgo();
        matriz = eliminarDominadas(matriz, matriz.length, probabilidades.length);

        let VME = matriz.map(fila => 
            fila.reduce((acc, val, index) => acc + val * probabilidades[index], 0)
        );

        let mejorAlternativa = maximoValor(VME);
        mostrarResultadosTabla(`Valor Monetario Esperado (VME)`, VME, mejorAlternativa);
    }

    // Criterio de Pérdida Probable
    function criterioPerdidaProbable() {
        let { matriz, probabilidades } = obtenerMatrizRiesgo();
        matriz = eliminarDominadas(matriz, matriz.length, probabilidades.length);

        let perdidaProbable = matriz.map(fila => 
            fila.reduce((acc, val, index) => (val < 0 ? acc + val * probabilidades[index] : acc), 0)
        );

        let mejorAlternativa = maximoValor(perdidaProbable);
        mostrarResultadosTabla(`Pérdida Probable`, perdidaProbable, mejorAlternativa);
    }

    // Criterio de Probabilidad de Pérdida Monetaria
    function criterioProbabilidadPerdida() {
        let { matriz, probabilidades } = obtenerMatrizRiesgo();
        matriz = eliminarDominadas(matriz, matriz.length, probabilidades.length);

        let perdidaTotal = matriz.map(fila => 
            fila.reduce((acc, val) => (val < 0 ? acc + val : acc), 0)
        );

        let mejorAlternativa = maximoValor(perdidaTotal);
        mostrarResultadosTabla(`Pérdida Monetaria`, perdidaTotal, mejorAlternativa);
    }

    // Criterio de Varianza
    function criterioVarianza() {
        let { matriz, probabilidades } = obtenerMatrizRiesgo();
        matriz = eliminarDominadas(matriz, matriz.length, probabilidades.length);

        let varianza = matriz.map(fila => {
            let media = fila.reduce((acc, val, index) => acc + val * probabilidades[index], 0);
            return fila.reduce((acc, val, index) => acc + Math.pow(val - media, 2) * probabilidades[index], 0);
        });

        let mejorAlternativa = minimoValor(varianza);
        mostrarResultadosTabla(`Varianza`, varianza, mejorAlternativa);
    }

    // Mostrar resultados en tabla
    function mostrarResultadosTabla(criterio, valores, mejorIndice) {
        let resultadoDiv = document.getElementById('resultadoRiesgo');
        resultadoDiv.innerHTML = `
            <h4>Resultado del Criterio ${criterio}</h4>
            <table>
                <thead>
                    <tr>
                        <th>Alternativa</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${valores.map((valor, index) => `
                        <tr ${index === mejorIndice ? 'style="background-color: #d4edda; font-weight: bold;"' : ''}>
                            <td>Alternativa ${index + 1}</td>
                            <td>${valor.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p>La mejor alternativa es la alternativa ${mejorIndice + 1} con valor: ${valores[mejorIndice].toFixed(2)}</p>
        `;
    }

    // Funciones auxiliares
    function maximoValor(arr) {
        return arr.indexOf(Math.max(...arr));
    }

    function minimoValor(arr) {
        return arr.indexOf(Math.min(...arr));
    }

    return {
        showRiesgo,
        generarMatrizRiesgo,
        criterioVME,
        criterioPerdidaProbable,
        criterioProbabilidadPerdida,
        criterioVarianza
    };
})();
