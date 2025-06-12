DROP TABLE IF EXISTS analysis;

CREATE TABLE analysis (
    id_analysis SERIAL PRIMARY KEY,
    pool VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    time TIME NOT NULL,
    free_chlorine DECIMAL(5,2) NOT NULL,
    total_chlorine DECIMAL(5,2) NOT NULL,
    cyanuric DECIMAL(5,2) NOT NULL,
    acidity DECIMAL(5,2) NOT NULL,
    turbidity DECIMAL(5,2) NOT NULL,
    renovated_water INTEGER NOT NULL,
    recirculated_water INTEGER NOT NULL,
    analyst VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
); 