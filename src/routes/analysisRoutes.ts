import express from 'express';
import {
    getAnalysis,
    createAnalysis,
    getAnalysisByPool,
    getAnalysisByAnalyst,
    deleteAnalysis,
    editAnalysis,
    getAnalysisByDateRange,
    getAnalysisById
} from '../controllers/analysisController';
import { authenticate } from '../middlewares/auth';
import {
    validateCreateAnalysis,
    validateUpdateAnalysis,
    validateAnalysisId
} from '../middlewares/analysisValidate';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de análisis
router.get('/', getAnalysis);
router.get('/pool/:poolName', getAnalysisByPool);
router.get('/analyst/:analystName', getAnalysisByAnalyst);
router.get('/date-range', getAnalysisByDateRange);
router.get('/:id', getAnalysisById);
router.post('/', validateCreateAnalysis, createAnalysis);
router.put('/:id', validateUpdateAnalysis, editAnalysis);
router.delete('/:id', validateAnalysisId, deleteAnalysis);

export default router; 