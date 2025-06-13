import { Request, Response, NextFunction } from 'express';
import * as analysisModel from '../models/analysisModel';
import pool from '../db/db';

// Función para verificar la conexión a la base de datos
const checkDatabaseConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (error) {
        console.error('Error de conexión a la base de datos:', error);
        return false;
    }
};

export const getAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const analysis = await analysisModel.getAnalysis();
        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        next(error);
    }
};

export const createAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Verificar conexión a la base de datos
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            res.status(500).json({
                status: 'error',
                message: 'Error de conexión a la base de datos'
            });
            return;
        }

        console.log('Datos recibidos en el controlador:', req.body);
        
        // Verificar que todos los campos requeridos estén presentes
        const requiredFields = ['pool', 'data', 'time', 'free_chlorine', 'total_chlorine', 
                              'cyanuric', 'acidity', 'turbidity', 'renovated_water', 
                              'recirculated_water', 'analyst'];
        
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            res.status(400).json({
                status: 'error',
                message: `Campos faltantes: ${missingFields.join(', ')}`
            });
            return;
        }

        const newAnalysis = await analysisModel.newAnalysis(req.body);
        res.status(201).json({
            success: true,
            data: newAnalysis
        });
    } catch (error) {
        console.error('Error detallado en createAnalysis:', error);
        if (error instanceof Error) {
            res.status(500).json({
                status: 'error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
};

export const getAnalysisByPool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { poolName } = req.params;
        const analysis = await analysisModel.getAnalysisByPool(poolName);
        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        next(error);
    }
};

export const getAnalysisByAnalyst = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { analystName } = req.params;
        const analysis = await analysisModel.getAnalysisByAnalyst(analystName);
        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deletedAnalysis = await analysisModel.deleteAnalysis(Number(id));
        res.status(200).json({
            success: true,
            data: deletedAnalysis
        });
    } catch (error) {
        next(error);
    }
};

export const editAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updatedAnalysis = await analysisModel.editAnalysis(Number(id), req.body);
        res.status(200).json({
            success: true,
            data: updatedAnalysis
        });
    } catch (error) {
        next(error);
    }
};

export const getAnalysisByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { start, end } = req.query;
        
        if (!start || !end) {
            res.status(400).json({
                success: false,
                message: 'Se requieren las fechas de inicio y fin'
            });
            return;
        }

        const analysis = await analysisModel.getAnalysisByDateRange(start as string, end as string);
        
        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        next(error);
    }
};

