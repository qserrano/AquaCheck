import { Request, Response, NextFunction } from 'express';
import * as analysisModel from '../models/analysisModel';

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

export const createAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newAnalysis = await analysisModel.newAnalysis(req.body);
        res.status(201).json({
            success: true,
            data: newAnalysis
        });
    } catch (error) {
        next(error);
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

