import { evaluarEstado } from './analisis.js';
import { API_BASE_URL } from './usuarios.js';

function generarPDFPorPiscina(poolName, analisis) {
    const docDefinition = {
        pageOrientation: 'landscape',
        pageSize: 'A4',
        header: {
            text: 'AquaCheck - Informe de Análisis',
            alignment: 'center',
            margin: [0, 10, 0, 0]
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            };
        },
        content: [
            {
                text: `Informe de Análisis - Piscina: ${poolName}`,
                style: 'header',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Fecha de generación: ${new Date().toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'Fecha',
                            'Hora',
                            'Cloro Lib. (ppm)',
                            'Cloro Tot. (ppm)',
                            'CyA (ppm)',
                            'pH',
                            'Turb. (NTU)',
                            'Agua Renov. (m3)',
                            'Agua Recirc. (m3)',
                            'Analista',
                            'Estado'
                        ],
                        ...analisis.map(a => [
                            new Date(a.data).toLocaleDateString(),
                            a.time,
                            a.free_chlorine,
                            a.total_chlorine,
                            a.cyanuric,
                            a.acidity,
                            a.turbidity,
                            a.renovated_water,
                            a.recirculated_water,
                            a.analyst,
                            evaluarEstado(a)
                        ])
                    ]
                }
            },
            {
                text: 'Resumen de Análisis',
                style: 'subheader',
                margin: [0, 20, 0, 10]
            },
            {
                text: `Total de análisis: ${analisis.length}`,
                margin: [0, 0, 0, 5]
            },
            {
                text: `Período: ${new Date(analisis[0].data).toLocaleDateString()} - ${new Date(analisis[analisis.length-1].data).toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10
        }
    };

    pdfMake.createPdf(docDefinition).download(`Informe_${poolName}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function generarPDFPorAnalista(analystName, analisis) {
    const docDefinition = {
        pageOrientation: 'landscape',
        pageSize: 'A4',
        header: {
            text: 'AquaCheck - Informe de Análisis',
            alignment: 'center',
            margin: [0, 10, 0, 0]
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            };
        },
        content: [
            {
                text: `Informe de Análisis - Analista: ${analystName}`,
                style: 'header',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Fecha de generación: ${new Date().toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'Piscina',
                            'Fecha',
                            'Hora',
                            'Cloro Lib. (ppm)',
                            'Cloro Tot. (ppm)',
                            'CyA (ppm)',
                            'pH',
                            'Turb. (NTU)',
                            'Agua Renov. (m3)',
                            'Agua Recirc. (m3)',
                            'Estado'
                        ],
                        ...analisis.map(a => [
                            a.pool || '',
                            new Date(a.data).toLocaleDateString(),
                            a.time,
                            a.free_chlorine,
                            a.total_chlorine,
                            a.cyanuric,
                            a.acidity,
                            a.turbidity,
                            a.renovated_water,
                            a.recirculated_water,
                            evaluarEstado(a)
                        ])
                    ]
                }
            },
            {
                text: 'Resumen de Análisis',
                style: 'subheader',
                margin: [0, 20, 0, 10]
            },
            {
                text: `Total de análisis: ${analisis.length}`,
                margin: [0, 0, 0, 5]
            },
            {
                text: `Período: ${new Date(analisis[0].data).toLocaleDateString()} - ${new Date(analisis[analisis.length-1].data).toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10
        }
    };

    pdfMake.createPdf(docDefinition).download(`Informe_${analystName}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function generarPDFPorFechas(fechaInicio, fechaFin, analisis) {
    const docDefinition = {
        pageOrientation: 'landscape',
        pageSize: 'A4',
        header: {
            text: 'AquaCheck - Informe de Análisis',
            alignment: 'center',
            margin: [0, 10, 0, 0]
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            };
        },
        content: [
            {
                text: `Informe de Análisis - Período: ${new Date(fechaInicio).toLocaleDateString()} al ${new Date(fechaFin).toLocaleDateString()}`,
                style: 'header',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Fecha de generación: ${new Date().toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'Piscina',
                            'Fecha',
                            'Hora',
                            'Cloro Lib. (ppm)',
                            'Cloro Tot. (ppm)',
                            'CyA (ppm)',
                            'pH',
                            'Turb. (NTU)',
                            'Agua Renov. (m3)',
                            'Agua Recirc. (m3)',
                            'Analista',
                            'Estado'
                        ],
                        ...analisis.map(a => [
                            a.pool || '',
                            new Date(a.data).toLocaleDateString(),
                            a.time,
                            a.free_chlorine,
                            a.total_chlorine,
                            a.cyanuric,
                            a.acidity,
                            a.turbidity,
                            a.renovated_water,
                            a.recirculated_water,
                            a.analyst,
                            evaluarEstado(a)
                        ])
                    ]
                }
            },
            {
                text: 'Resumen de Análisis',
                style: 'subheader',
                margin: [0, 20, 0, 10]
            },
            {
                text: `Total de análisis: ${analisis.length}`,
                margin: [0, 0, 0, 5]
            },
            {
                text: `Período: ${new Date(analisis[0].data).toLocaleDateString()} - ${new Date(analisis[analisis.length-1].data).toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10
        }
    };

    pdfMake.createPdf(docDefinition).download(`Informe_${fechaInicio}_${fechaFin}.pdf`);
}

function generarPDFPersonalizado(pool, analyst, fechaInicio, fechaFin, analisis) {
    const docDefinition = {
        pageOrientation: 'landscape',
        pageSize: 'A4',
        header: {
            text: 'AquaCheck - Informe de Análisis',
            alignment: 'center',
            margin: [0, 10, 0, 0]
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            };
        },
        content: [
            {
                text: 'Informe de Análisis Personalizado',
                style: 'header',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Fecha de generación: ${new Date().toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            },
            {
                text: 'Filtros aplicados:',
                style: 'subheader',
                margin: [0, 0, 0, 10]
            },
            {
                text: [
                    `Piscina: ${pool || 'Todas'}\n`,
                    `Analista: ${analyst || 'Todos'}\n`,
                    `Período: ${new Date(fechaInicio).toLocaleDateString()} al ${new Date(fechaFin).toLocaleDateString()}`
                ],
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'Piscina',
                            'Fecha',
                            'Hora',
                            'Cloro Lib. (ppm)',
                            'Cloro Tot. (ppm)',
                            'CyA (ppm)',
                            'pH',
                            'Turb. (NTU)',
                            'Agua Renov. (m3)',
                            'Agua Recirc. (m3)',
                            'Analista',
                            'Estado'
                        ],
                        ...analisis.map(a => [
                            a.pool || '',
                            new Date(a.data).toLocaleDateString(),
                            a.time,
                            a.free_chlorine,
                            a.total_chlorine,
                            a.cyanuric,
                            a.acidity,
                            a.turbidity,
                            a.renovated_water,
                            a.recirculated_water,
                            a.analyst,
                            evaluarEstado(a)
                        ])
                    ]
                }
            },
            {
                text: 'Resumen de Análisis',
                style: 'subheader',
                margin: [0, 20, 0, 10]
            },
            {
                text: `Total de análisis: ${analisis.length}`,
                margin: [0, 0, 0, 5]
            },
            {
                text: `Período: ${new Date(analisis[0].data).toLocaleDateString()} - ${new Date(analisis[analisis.length-1].data).toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10
        }
    };

    pdfMake.createPdf(docDefinition).download(`Informe_Personalizado_${new Date().toISOString().split('T')[0]}.pdf`);
}

async function mostrarInformesPorPiscina(contenedor) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        const response = await fetch('/api/analysis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener las piscinas');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        const piscinas = [...new Set(analisis.map(a => a.pool))].sort();

        // Crear un contenedor temporal para el informe sin reemplazar todo el contenido
        const tempContainer = document.createElement('div');
        tempContainer.id = 'informes-por-piscina-container';
        tempContainer.className = 'content-section';
        tempContainer.style.display = 'block';
        tempContainer.innerHTML = `
            <div class="analisis-container">
                <h2>Generar Informes por Piscina</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="poolSelectInforme">Seleccione una piscina:</label>
                    <select id="poolSelectInforme" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Seleccione una piscina</option>
                        ${piscinas.map(pool => `<option value="${pool}">${pool}</option>`).join('')}
                    </select>
                </div>
                <div id="vistaPrevia" style="display: none;">
                    <h3>Vista Previa del Informe</h3>
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Lib. (ppm)</th>
                                    <th>Cloro Tot. (ppm)</th>
                                    <th>CyA (ppm)</th>
                                    <th>pH</th>
                                    <th>Turb. (NTU)</th>
                                    <th>Agua Renov. (m3)</th>
                                    <th>Agua Recirc. (m3)</th>
                                    <th>Analista</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBody">
                            </tbody>
                        </table>
                    </div>
                    <div class="resumen-informe" style="margin: 20px 0;">
                        <h4>Resumen del Informe</h4>
                        <p id="totalAnalisis"></p>
                        <p id="periodoAnalisis"></p>
                    </div>
                    <div class="form-group" style="margin: 20px 0;">
                        <button id="generarPDF" class="btn-primary">Generar PDF</button>
                    </div>
                </div>
            </div>
        `;

        // Remover el contenedor temporal anterior si existe
        const existingContainer = document.getElementById('informes-por-piscina-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Agregar el nuevo contenedor al mainContent
        contenedor.appendChild(tempContainer);

        // Buscar elementos dentro del contenedor específico
        const poolSelect = tempContainer.querySelector('#poolSelectInforme');
        const vistaPrevia = tempContainer.querySelector('#vistaPrevia');
        const tbody = tempContainer.querySelector('#analisisTableBody');
        const totalAnalisis = tempContainer.querySelector('#totalAnalisis');
        const periodoAnalisis = tempContainer.querySelector('#periodoAnalisis');
        const generarPDFBtn = tempContainer.querySelector('#generarPDF');

        let analisisActual = [];

        poolSelect.addEventListener('change', async (e) => {
            const selectedPool = e.target.value;
            if (!selectedPool) {
                vistaPrevia.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`/api/analysis/pool/${encodeURIComponent(selectedPool)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los análisis de la piscina');
                }

                const data = await response.json();
                analisisActual = data.success && data.data ? data.data : [];

                if (analisisActual.length === 0) {
                    alert('No hay análisis registrados para esta piscina');
                    vistaPrevia.style.display = 'none';
                    return;
                }

                vistaPrevia.style.display = 'block';

                tbody.innerHTML = analisisActual.map(analisis => `
                    <tr>
                        <td>${new Date(analisis.data).toLocaleDateString()}</td>
                        <td>${analisis.time}</td>
                        <td>${analisis.free_chlorine}</td>
                        <td>${analisis.total_chlorine}</td>
                        <td>${analisis.cyanuric}</td>
                        <td>${analisis.acidity}</td>
                        <td>${analisis.turbidity}</td>
                        <td>${analisis.renovated_water}</td>
                        <td>${analisis.recirculated_water}</td>
                        <td>${analisis.analyst}</td>
                        <td>${evaluarEstado(analisis)}</td>
                    </tr>
                `).join('');

                totalAnalisis.textContent = `Total de análisis: ${analisisActual.length}`;
                periodoAnalisis.textContent = `Período: ${new Date(analisisActual[0].data).toLocaleDateString()} - ${new Date(analisisActual[analisisActual.length-1].data).toLocaleDateString()}`;

            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar los análisis: ' + error.message);
                vistaPrevia.style.display = 'none';
            }
        });

        generarPDFBtn.addEventListener('click', () => {
            if (analisisActual.length > 0) {
                generarPDFPorPiscina(poolSelect.value, analisisActual);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        // Si hay un error, mostrar en el contenedor temporal
        const tempContainer = document.getElementById('informes-por-piscina-container');
        if (tempContainer) {
            tempContainer.innerHTML = `
                <div class="error-container">
                    <h3>Error al cargar los informes</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

async function mostrarInformesPorAnalista(contenedor) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        const response = await fetch('/api/analysis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener los analistas');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        const analistas = [...new Set(analisis.map(a => a.analyst))].sort();

        // Crear un contenedor temporal para el informe sin reemplazar todo el contenido
        const tempContainer = document.createElement('div');
        tempContainer.id = 'informes-por-analista-container';
        tempContainer.className = 'content-section';
        tempContainer.style.display = 'block';
        tempContainer.innerHTML = `
            <div class="analisis-container">
                <h2>Generar Informes por Analista</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="analystSelectInforme">Seleccione un analista:</label>
                    <select id="analystSelectInforme" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Seleccione un analista</option>
                        ${analistas.map(analyst => `<option value="${analyst}">${analyst}</option>`).join('')}
                    </select>
                </div>
                <div id="vistaPrevia" style="display: none;">
                    <h3>Vista Previa del Informe</h3>
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Piscina</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Lib. (ppm)</th>
                                    <th>Cloro Tot. (ppm)</th>
                                    <th>CyA (ppm)</th>
                                    <th>pH</th>
                                    <th>Turb. (NTU)</th>
                                    <th>Agua Renov. (m3)</th>
                                    <th>Agua Recirc. (m3)</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBody">
                            </tbody>
                        </table>
                    </div>
                    <div class="resumen-informe" style="margin: 20px 0;">
                        <h4>Resumen del Informe</h4>
                        <p id="totalAnalisis"></p>
                        <p id="periodoAnalisis"></p>
                    </div>
                    <div class="form-group" style="margin: 20px 0;">
                        <button id="generarPDF" class="btn-primary">Generar PDF</button>
                    </div>
                </div>
            </div>
        `;

        // Remover el contenedor temporal anterior si existe
        const existingContainer = document.getElementById('informes-por-analista-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Agregar el nuevo contenedor al mainContent
        contenedor.appendChild(tempContainer);

        // Buscar elementos dentro del contenedor específico
        const analystSelect = tempContainer.querySelector('#analystSelectInforme');
        const vistaPrevia = tempContainer.querySelector('#vistaPrevia');
        const tbody = tempContainer.querySelector('#analisisTableBody');
        const totalAnalisis = tempContainer.querySelector('#totalAnalisis');
        const periodoAnalisis = tempContainer.querySelector('#periodoAnalisis');
        const generarPDFBtn = tempContainer.querySelector('#generarPDF');

        let analisisActual = [];

        analystSelect.addEventListener('change', async (e) => {
            const selectedAnalyst = e.target.value;
            if (!selectedAnalyst) {
                vistaPrevia.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`/api/analysis/analyst/${encodeURIComponent(selectedAnalyst)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los análisis del analista');
                }

                const data = await response.json();
                analisisActual = data.success && data.data ? data.data : [];

                if (analisisActual.length === 0) {
                    alert('No hay análisis registrados para este analista');
                    vistaPrevia.style.display = 'none';
                    return;
                }

                vistaPrevia.style.display = 'block';

                tbody.innerHTML = analisisActual.map(analisis => `
                    <tr>
                        <td>${analisis.pool || ''}</td>
                        <td>${new Date(analisis.data).toLocaleDateString()}</td>
                        <td>${analisis.time}</td>
                        <td>${analisis.free_chlorine}</td>
                        <td>${analisis.total_chlorine}</td>
                        <td>${analisis.cyanuric}</td>
                        <td>${analisis.acidity}</td>
                        <td>${analisis.turbidity}</td>
                        <td>${analisis.renovated_water}</td>
                        <td>${analisis.recirculated_water}</td>
                        <td>${evaluarEstado(analisis)}</td>
                    </tr>
                `).join('');

                totalAnalisis.textContent = `Total de análisis: ${analisisActual.length}`;
                periodoAnalisis.textContent = `Período: ${new Date(analisisActual[0].data).toLocaleDateString()} - ${new Date(analisisActual[analisisActual.length-1].data).toLocaleDateString()}`;

            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar los análisis: ' + error.message);
                vistaPrevia.style.display = 'none';
            }
        });

        generarPDFBtn.addEventListener('click', () => {
            if (analisisActual.length > 0) {
                generarPDFPorAnalista(analystSelect.value, analisisActual);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        // Si hay un error, mostrar en el contenedor temporal
        const tempContainer = document.getElementById('informes-por-analista-container');
        if (tempContainer) {
            tempContainer.innerHTML = `
                <div class="error-container">
                    <h3>Error al cargar los informes</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

async function mostrarInformesPorFechas(contenedor) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        // Crear un contenedor temporal para el informe sin reemplazar todo el contenido
        const tempContainer = document.createElement('div');
        tempContainer.id = 'informes-por-fechas-container';
        tempContainer.className = 'content-section';
        tempContainer.style.display = 'block';
        tempContainer.innerHTML = `
            <div class="analisis-container">
                <h2>Generar Informes por Rango de Fechas</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="fechaInicio">Fecha Inicio:</label>
                    <input type="date" id="fechaInicio" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="fechaFin">Fecha Fin:</label>
                    <input type="date" id="fechaFin" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                </div>
                <div class="form-group" style="margin: 20px 0;">
                    <button id="buscarAnalisis" class="btn-primary">Buscar Análisis</button>
                </div>
                <div id="vistaPrevia" style="display: none;">
                    <h3>Vista Previa del Informe</h3>
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Piscina</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Lib. (ppm)</th>
                                    <th>Cloro Tot. (ppm)</th>
                                    <th>CyA (ppm)</th>
                                    <th>pH</th>
                                    <th>Turb. (NTU)</th>
                                    <th>Agua Renov. (m3)</th>
                                    <th>Agua Recirc. (m3)</th>
                                    <th>Analista</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBody">
                            </tbody>
                        </table>
                    </div>
                    <div class="resumen-informe" style="margin: 20px 0;">
                        <h4>Resumen del Informe</h4>
                        <p id="totalAnalisis"></p>
                        <p id="periodoAnalisis"></p>
                    </div>
                    <div class="form-group" style="margin: 20px 0;">
                        <button id="generarPDF" class="btn-primary">Generar PDF</button>
                    </div>
                </div>
            </div>
        `;

        // Remover el contenedor temporal anterior si existe
        const existingContainer = document.getElementById('informes-por-fechas-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Agregar el nuevo contenedor al mainContent
        contenedor.appendChild(tempContainer);

        // Buscar elementos dentro del contenedor específico
        const fechaInicio = tempContainer.querySelector('#fechaInicio');
        const fechaFin = tempContainer.querySelector('#fechaFin');
        const buscarBtn = tempContainer.querySelector('#buscarAnalisis');
        const vistaPrevia = tempContainer.querySelector('#vistaPrevia');
        const tbody = tempContainer.querySelector('#analisisTableBody');
        const totalAnalisis = tempContainer.querySelector('#totalAnalisis');
        const periodoAnalisis = tempContainer.querySelector('#periodoAnalisis');
        const generarPDFBtn = tempContainer.querySelector('#generarPDF');

        let analisisActual = [];

        buscarBtn.addEventListener('click', async () => {
            const inicio = fechaInicio.value;
            const fin = fechaFin.value;

            if (!inicio || !fin) {
                alert('Por favor, seleccione ambas fechas');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/analysis/date-range?start=${inicio}&end=${fin}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al obtener los análisis');
                }

                const data = await response.json();
                analisisActual = data.success && data.data ? data.data : [];

                if (analisisActual.length === 0) {
                    alert('No hay análisis registrados en el período seleccionado');
                    vistaPrevia.style.display = 'none';
                    return;
                }

                vistaPrevia.style.display = 'block';

                tbody.innerHTML = analisisActual.map(analisis => `
                    <tr>
                        <td>${analisis.pool || ''}</td>
                        <td>${new Date(analisis.data).toLocaleDateString()}</td>
                        <td>${analisis.time}</td>
                        <td>${analisis.free_chlorine}</td>
                        <td>${analisis.total_chlorine}</td>
                        <td>${analisis.cyanuric}</td>
                        <td>${analisis.acidity}</td>
                        <td>${analisis.turbidity}</td>
                        <td>${analisis.renovated_water}</td>
                        <td>${analisis.recirculated_water}</td>
                        <td>${analisis.analyst}</td>
                        <td>${evaluarEstado(analisis)}</td>
                    </tr>
                `).join('');

                totalAnalisis.textContent = `Total de análisis: ${analisisActual.length}`;
                periodoAnalisis.textContent = `Período: ${new Date(analisisActual[0].data).toLocaleDateString()} - ${new Date(analisisActual[analisisActual.length-1].data).toLocaleDateString()}`;

            } catch (error) {
                alert('Error al cargar los análisis: ' + error.message);
                vistaPrevia.style.display = 'none';
            }
        });

        generarPDFBtn.addEventListener('click', () => {
            if (analisisActual.length > 0) {
                generarPDFPorFechas(fechaInicio.value, fechaFin.value, analisisActual);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        // Si hay un error, mostrar en el contenedor temporal
        const tempContainer = document.getElementById('informes-por-fechas-container');
        if (tempContainer) {
            tempContainer.innerHTML = `
                <div class="error-container">
                    <h3>Error al cargar los informes</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

async function mostrarInformesPersonalizados(contenedor) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        const response = await fetch(`${API_BASE_URL}/api/analysis`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener los datos');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        const piscinas = [...new Set(analisis.map(a => a.pool))].sort();
        const analistas = [...new Set(analisis.map(a => a.analyst))].sort();

        // Crear un contenedor temporal para el informe sin reemplazar todo el contenido
        const tempContainer = document.createElement('div');
        tempContainer.id = 'informes-personalizados-container';
        tempContainer.className = 'content-section';
        tempContainer.style.display = 'block';
        tempContainer.innerHTML = `
            <div class="analisis-container">
                <h2>Generar Informes Personalizados</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="poolSelectPersonalizado">Piscina:</label>
                    <select id="poolSelectPersonalizado" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Todas las piscinas</option>
                        ${piscinas.map(pool => `<option value="${pool}">${pool}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="analystSelectPersonalizado">Analista:</label>
                    <select id="analystSelectPersonalizado" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Todos los analistas</option>
                        ${analistas.map(analyst => `<option value="${analyst}">${analyst}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="fechaInicioPersonalizado">Fecha Inicio:</label>
                    <input type="date" id="fechaInicioPersonalizado" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="fechaFinPersonalizado">Fecha Fin:</label>
                    <input type="date" id="fechaFinPersonalizado" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                </div>
                <div class="form-group" style="margin: 20px 0;">
                    <button id="buscarAnalisisPersonalizado" class="btn-primary">Buscar Análisis</button>
                </div>
                <div id="vistaPreviaPersonalizado" style="display: none;">
                    <h3>Vista Previa del Informe</h3>
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Piscina</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Lib. (ppm)</th>
                                    <th>Cloro Tot. (ppm)</th>
                                    <th>CyA (ppm)</th>
                                    <th>pH</th>
                                    <th>Turb. (NTU)</th>
                                    <th>Agua Renov. (m3)</th>
                                    <th>Agua Recirc. (m3)</th>
                                    <th>Analista</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBodyPersonalizado">
                            </tbody>
                        </table>
                    </div>
                    <div class="resumen-informe" style="margin: 20px 0;">
                        <h4>Resumen del Informe</h4>
                        <p id="totalAnalisisPersonalizado"></p>
                        <p id="periodoAnalisisPersonalizado"></p>
                    </div>
                    <div class="form-group" style="margin: 20px 0;">
                        <button id="generarPDFPersonalizado" class="btn-primary">Generar PDF</button>
                    </div>
                </div>
            </div>
        `;

        // Remover el contenedor temporal anterior si existe
        const existingContainer = document.getElementById('informes-personalizados-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Agregar el nuevo contenedor al mainContent
        contenedor.appendChild(tempContainer);

        // Buscar elementos dentro del contenedor específico
        const poolSelect = tempContainer.querySelector('#poolSelectPersonalizado');
        const analystSelect = tempContainer.querySelector('#analystSelectPersonalizado');
        const fechaInicio = tempContainer.querySelector('#fechaInicioPersonalizado');
        const fechaFin = tempContainer.querySelector('#fechaFinPersonalizado');
        const buscarBtn = tempContainer.querySelector('#buscarAnalisisPersonalizado');
        const vistaPrevia = tempContainer.querySelector('#vistaPreviaPersonalizado');
        const tbody = tempContainer.querySelector('#analisisTableBodyPersonalizado');
        const totalAnalisis = tempContainer.querySelector('#totalAnalisisPersonalizado');
        const periodoAnalisis = tempContainer.querySelector('#periodoAnalisisPersonalizado');
        const generarPDFBtn = tempContainer.querySelector('#generarPDFPersonalizado');

        let analisisActual = [];

        buscarBtn.addEventListener('click', async () => {
            const pool = poolSelect.value;
            const analyst = analystSelect.value;
            const inicio = fechaInicio.value;
            const fin = fechaFin.value;

            if (!inicio || !fin) {
                alert('Por favor, seleccione ambas fechas');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/analysis/date-range?start=${inicio}&end=${fin}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al obtener los análisis');
                }

                const data = await response.json();
                let analisis = data.success && data.data ? data.data : [];

                // Filtrar por piscina si se seleccionó una
                if (pool) {
                    analisis = analisis.filter(a => a.pool === pool);
                }

                // Filtrar por analista si se seleccionó uno
                if (analyst) {
                    analisis = analisis.filter(a => a.analyst === analyst);
                }

                analisisActual = analisis;

                if (analisisActual.length === 0) {
                    alert('No hay análisis registrados con los filtros seleccionados');
                    vistaPrevia.style.display = 'none';
                    return;
                }

                vistaPrevia.style.display = 'block';

                tbody.innerHTML = analisisActual.map(analisis => `
                    <tr>
                        <td>${analisis.pool || ''}</td>
                        <td>${new Date(analisis.data).toLocaleDateString()}</td>
                        <td>${analisis.time}</td>
                        <td>${analisis.free_chlorine}</td>
                        <td>${analisis.total_chlorine}</td>
                        <td>${analisis.cyanuric}</td>
                        <td>${analisis.acidity}</td>
                        <td>${analisis.turbidity}</td>
                        <td>${analisis.renovated_water}</td>
                        <td>${analisis.recirculated_water}</td>
                        <td>${analisis.analyst}</td>
                        <td>${evaluarEstado(analisis)}</td>
                    </tr>
                `).join('');

                totalAnalisis.textContent = `Total de análisis: ${analisisActual.length}`;
                periodoAnalisis.textContent = `Período: ${new Date(analisisActual[0].data).toLocaleDateString()} - ${new Date(analisisActual[analisisActual.length-1].data).toLocaleDateString()}`;

            } catch (error) {
                alert('Error al cargar los análisis: ' + error.message);
                vistaPrevia.style.display = 'none';
            }
        });

        generarPDFBtn.addEventListener('click', () => {
            if (analisisActual.length > 0) {
                generarPDFPersonalizado(
                    poolSelect.value,
                    analystSelect.value,
                    fechaInicio.value,
                    fechaFin.value,
                    analisisActual
                );
            }
        });

    } catch (error) {
        console.error('Error:', error);
        // Si hay un error, mostrar en el contenedor temporal
        const tempContainer = document.getElementById('informes-personalizados-container');
        if (tempContainer) {
            tempContainer.innerHTML = `
                <div class="error-container">
                    <h3>Error al cargar los informes</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

export {
    mostrarInformesPorPiscina,
    mostrarInformesPorAnalista,
    mostrarInformesPorFechas,
    mostrarInformesPersonalizados,
    generarPDFPorPiscina,
    generarPDFPorAnalista,
    generarPDFPorFechas,
    generarPDFPersonalizado
}; 