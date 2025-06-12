import pool from '../db/db';

export interface Analysis {
    id_analysis?: number;
    pool: string;
    data: Date;
    time: `${number}:${number}:${number}`; // Formato HH:mm:ss
    free_chlorine: number;
    total_chlorine: number;
    cyanuric: number;
    acidity: number;
    turbidity: number;
    renovated_water: number;
    recirculated_water: number;
    created_at?: Date;
    analyst: string;
}

export const getAnalysis = async (): Promise<Analysis[]> => {
    const query = `
        SELECT * FROM analysis
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const newAnalysis = async (analysis: Omit<Analysis, 'id_analysis' | 'created_at'>): Promise<Analysis> => {
    try {
        console.log('Intentando insertar análisis con datos:', analysis);
        
        // Validar que la fecha sea válida
        const date = new Date(analysis.data);
        if (isNaN(date.getTime())) {
            throw new Error('Fecha inválida');
        }

        // Validar que la hora tenga el formato correcto
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!timeRegex.test(analysis.time)) {
            throw new Error('Formato de hora inválido');
        }

        const query = `
            INSERT INTO analysis (
                pool, data, time, free_chlorine, total_chlorine, 
                cyanuric, acidity, turbidity, renovated_water, 
                recirculated_water, analyst, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [
            analysis.pool,
            date,
            analysis.time,
            analysis.free_chlorine,
            analysis.total_chlorine,
            analysis.cyanuric,
            analysis.acidity,
            analysis.turbidity,
            analysis.renovated_water,
            analysis.recirculated_water,
            analysis.analyst
        ];
        console.log('Valores a insertar:', values);
        
        const result = await pool.query(query, values);
        console.log('Resultado de la inserción:', result.rows[0]);
        
        if (!result.rows[0]) {
            throw new Error('No se pudo insertar el análisis');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error en newAnalysis:', error);
        if (error instanceof Error) {
            throw new Error(`Error al crear análisis: ${error.message}`);
        }
        throw error;
    }
};

export const getAnalysisByPool = async (poolName: string): Promise<Analysis[]> => {
    const query = `
        SELECT * FROM analysis
        WHERE pool = $1
        ORDER BY data ASC, time ASC
    `;
    const result = await pool.query(query, [poolName]);
    return result.rows;
};

export const deleteAnalysis = async (id: number): Promise<Analysis> => {
    const query = `
        DELETE FROM analysis
        WHERE id_analysis = $1
        RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

export const editAnalysis = async (id: number, analysis: Omit<Analysis, 'id_analysis' | 'created_at'>): Promise<Analysis> => {
    const query = `
        UPDATE analysis
        SET pool = $1,
            data = $2,
            time = $3,
            free_chlorine = $4,
            total_chlorine = $5,
            cyanuric = $6,
            acidity = $7,
            turbidity = $8,
            renovated_water = $9,
            recirculated_water = $10,
            analyst = $11
        WHERE id_analysis = $12
        RETURNING *
    `;
    const values = [
        analysis.pool,
        analysis.data,
        analysis.time,
        analysis.free_chlorine,
        analysis.total_chlorine,
        analysis.cyanuric,
        analysis.acidity,
        analysis.turbidity,
        analysis.renovated_water,
        analysis.recirculated_water,
        analysis.analyst,
        id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

