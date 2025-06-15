import { z } from 'zod';

// Esquema base para análisis
const analysisSchema = z.object({
    pool: z.string()
        .min(1, { message: "El nombre de la piscina es requerido" })
        .max(100, { message: "El nombre de la piscina no puede exceder los 100 caracteres" }),
    data: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha debe tener un formato válido (YYYY-MM-DD)" })
        .transform((str) => new Date(str)),
    time: z.string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
            message: "El formato de hora debe ser HH:mm:ss"
        }),
    free_chlorine: z.number()
        .min(0, { message: "El cloro libre no puede ser negativo" })
        .max(10, { message: "El cloro libre no puede exceder 10 mg/L" }),
    total_chlorine: z.number()
        .min(0, { message: "El cloro total no puede ser negativo" })
        .max(10, { message: "El cloro total no puede exceder 10 mg/L" }),
    cyanuric: z.number()
        .min(0, { message: "El ácido cianúrico no puede ser negativo" })
        .max(999, { message: "El ácido cianúrico no puede exceder 999 mg/L" }),
    acidity: z.number()
        .min(0, { message: "La acidez no puede ser negativa" })
        .max(14, { message: "La acidez no puede exceder 14" }),
    turbidity: z.number()
        .min(0, { message: "La turbidez no puede ser negativa" })
        .max(5, { message: "La turbidez no puede exceder 5 NTU" }),
    renovated_water: z.number()
        .min(0, { message: "El agua renovada no puede ser negativa" })
        .max(999999, { message: "El agua renovada no puede exceder 999999" }),
    recirculated_water: z.number()
        .min(0, { message: "El agua recirculada no puede ser negativa" })
        .max(999999, { message: "El agua recirculada no puede exceder 999999" }),
    analyst: z.string()
        .min(1, { message: "El nombre del analista es requerido" })
        .max(100, { message: "El nombre del analista no puede exceder los 100 caracteres" })
});

// Esquema para creación de análisis
export const createAnalysisSchema = analysisSchema;

// Esquema para actualización de análisis
export const updateAnalysisSchema = analysisSchema.partial().refine(data => {
    return Object.keys(data).length > 0;
}, { message: "Debe proporcionar al menos un campo para actualizar" });

// Esquema para ID de análisis
export const analysisIdSchema = z.object({
    id: z.string().regex(/^[0-9]+$/).transform(Number)
});

// Tipos inferidos para TypeScript
export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type UpdateAnalysisInput = z.infer<typeof updateAnalysisSchema>; 