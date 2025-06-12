import { Request, Response, NextFunction } from 'express';
import { validate } from './validate';
import { createAnalysisSchema, updateAnalysisSchema, analysisIdSchema } from '../validations/analysisValidation';

export const validateCreateAnalysis = validate({
    body: createAnalysisSchema
});

export const validateUpdateAnalysis = validate({
    body: updateAnalysisSchema,
    params: analysisIdSchema
});

export const validateAnalysisId = validate({
    params: analysisIdSchema
});
