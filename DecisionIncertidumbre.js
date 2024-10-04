const Incertidumbre = (() => {
    // Mostrar la sección de decisiones bajo incertidumbre
    function showIncertidumbre() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('incertidumbre').style.display = 'block';
        document.getElementById('riesgo').style.display = 'none'; // Ocultar la sección de Riesgo
    }

    // Generar la matriz de decisiones para incertidumbre
    function generarMatrizIncertidumbre() {
        let numAlternativas = parseInt(document.getElementById('numAlternativas').value);
        let numEstados = parseInt(document.getElementById('numEstados').value);
        let matrizDiv = document.getElementById('matrizIncertidumbre');
        matrizDiv.innerHTML = '';

        // Crear matriz de inputs
        for (let i = 0; i < numAlternativas; i++) {
            let row = document.createElement('div');
            for (let j = 0; j < numEstados; j++) {
                let input = document.createElement('input');
                input.type = 'number';
                input.id = `alt${i}_est${j}`;
                input.placeholder = `A${i + 1}, E${j + 1}`;
                row.appendChild(input);
            }
            matrizDiv.appendChild(row);
        }

        // Agregar opción para seleccionar el tipo de problema (Costos o Beneficios)
        let tipoProblemaDiv = document.createElement('div');
        tipoProblemaDiv.innerHTML = `
            <h3>Tipo de problema:</h3>
            <input type="radio" name="tipoProblema" value="beneficios" checked> Beneficios
            <input type="radio" name="tipoProblema" value="costos"> Costos
        `;
        matrizDiv.appendChild(tipoProblemaDiv);

        document.getElementById('opcionesIncertidumbre').style.display = 'block';
    }

    // Obtener la matriz de decisiones ingresada en la interfaz
    function obtenerMatrizIncertidumbre() {
        let numAlternativas = parseInt(document.getElementById('numAlternativas').value);
        let numEstados = parseInt(document.getElementById('numEstados').value);
        let matriz = [];

        for (let i = 0; i < numAlternativas; i++) {
            let fila = [];
            for (let j = 0; j < numEstados; j++) {
                fila.push(parseFloat(document.getElementById(`alt${i}_est${j}`).value));
            }
            matriz.push(fila);
        }
        return matriz;
    }

    // Obtener el tipo de problema seleccionado por el usuario
    function obtenerTipoProblema() {
        let tipo = document.querySelector('input[name="tipoProblema"]:checked').value;
        return tipo === 'beneficios' ? 1 : 2;  // 1: Beneficios, 2: Costos
    }

    // Criterio Maximin
    function criterioMaximin() {
        let matriz = obtenerMatrizIncertidumbre();
        let minimos = matriz.map(fila => Math.min(...fila));
        let mejorAlternativa = maximoValor(minimos);
        mostrarResultadosTabla(`Maximin`, minimos, mejorAlternativa);
    }

    // Criterio Maximax
    function criterioMaximax() {
        let matriz = obtenerMatrizIncertidumbre();
        let maximos = matriz.map(fila => Math.max(...fila));
        let mejorAlternativa = maximoValor(maximos);
        mostrarResultadosTabla(`Maximax`, maximos, mejorAlternativa);
    }

    // Criterio Laplace
    function criterioLaplace() {
        let matriz = obtenerMatrizIncertidumbre();
        let tipoProblema = obtenerTipoProblema();
        let promedios = matriz.map(fila => fila.reduce((acc, val) => acc + val) / fila.length);
        let mejorAlternativa = tipoProblema === 1 ? maximoValor(promedios) : minimoValor(promedios);
        mostrarResultadosTabla(`Laplace`, promedios, mejorAlternativa, tipoProblema);
    }

    // Criterio Hurwicz
    function criterioHurwicz() {
        let matriz = obtenerMatrizIncertidumbre();
        let tipoProblema = obtenerTipoProblema();
        let alpha = parseFloat(prompt("Ingrese el índice de optimismo (α):"));
        let hurwicz = matriz.map(fila => {
            let max = Math.max(...fila);
            let min = Math.min(...fila);
            return tipoProblema === 1
                ? alpha * max + (1 - alpha) * min
                : alpha * min + (1 - alpha) * max;
        });

        let mejorAlternativa = tipoProblema === 1 ? maximoValor(hurwicz) : minimoValor(hurwicz);
        mostrarResultadosTabla(`Hurwicz`, hurwicz, mejorAlternativa, tipoProblema);
    }

    // Criterio Savage
    function criterioSavage() {
        let matriz = obtenerMatrizIncertidumbre();
        let tipoProblema = obtenerTipoProblema();
        let regretMatriz = calcularRegret(matriz, tipoProblema);
        let maximosRegret = regretMatriz.map(fila => Math.max(...fila));
        let mejorAlternativa = minimoValor(maximosRegret);
        mostrarResultadosTabla(`Savage`, maximosRegret, mejorAlternativa, tipoProblema);
    }

    // Calcular matriz de arrepentimiento (regret) para costos y beneficios
    function calcularRegret(matriz, tipoProblema) {
        let M = matriz.length;
        let N = matriz[0].length;
        let regretMatriz = Array.from({ length: M }, () => Array(N).fill(0));

        for (let j = 0; j < N; j++) {
            let referencia = tipoProblema === 1
                ? Math.max(...matriz.map(fila => fila[j])) // Beneficios: Máximo de cada columna
                : Math.min(...matriz.map(fila => fila[j])); // Costos: Mínimo de cada columna

            for (let i = 0; i < M; i++) {
                regretMatriz[i][j] = tipoProblema === 1
                    ? referencia - matriz[i][j] // Beneficios: Restar mayor valor
                    : matriz[i][j] - referencia; // Costos: Restar menor valor
            }
        }
        return regretMatriz;
    }

    // Mostrar los resultados en una tabla
    function mostrarResultadosTabla(criterio, valores, mejorIndice) {
        let resultadoDiv = document.getElementById('resultadoIncertidumbre');
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

    // Funciones auxiliares para encontrar el máximo y mínimo en un array
    function maximoValor(array) {
        return array.indexOf(Math.max(...array));
    }

    function minimoValor(array) {
        return array.indexOf(Math.min(...array));
    }

    return {
        showIncertidumbre,
        generarMatrizIncertidumbre,
        criterioMaximin,
        criterioMaximax,
        criterioSavage,
        criterioHurwicz,
        criterioLaplace
    };
})();
