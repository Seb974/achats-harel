import { useState } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { Button, CircularProgress, Alert, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudIcon from '@mui/icons-material/Cloud';

interface OdooTestResult {
    success?: boolean;
    message?: string;
    odoo_version?: string;
    user_id?: number;
    database?: string;
    error?: string;
}

export const OdooConnectionTest = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OdooTestResult | null>(null);

    const testConnection = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            // @ts-ignore - méthode personnalisée ajoutée au dataProvider
            const response = await dataProvider.testOdooConnection();
            setResult(response);
            
            if (response.success) {
                notify('Connexion Odoo réussie !', { type: 'success' });
            } else {
                notify(response.error || 'Échec de la connexion', { type: 'error' });
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Erreur de connexion';
            setResult({ error: errorMessage, success: false });
            notify(errorMessage, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Button
                variant="outlined"
                color="primary"
                onClick={testConnection}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudIcon />}
            >
                {loading ? 'Test en cours...' : 'Tester la connexion Odoo'}
            </Button>

            {result && (
                <Box sx={{ mt: 2 }}>
                    {result.success ? (
                        <Alert 
                            severity="success" 
                            icon={<CheckCircleIcon />}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box>
                                <strong>Connexion réussie !</strong>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {result.odoo_version && (
                                        <Chip 
                                            size="small" 
                                            label={`Odoo ${result.odoo_version}`} 
                                            color="success" 
                                            variant="outlined" 
                                        />
                                    )}
                                    {result.database && (
                                        <Chip 
                                            size="small" 
                                            label={`DB: ${result.database}`} 
                                            color="info" 
                                            variant="outlined" 
                                        />
                                    )}
                                    {result.user_id && (
                                        <Chip 
                                            size="small" 
                                            label={`User ID: ${result.user_id}`} 
                                            variant="outlined" 
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Alert>
                    ) : (
                        <Alert severity="error" icon={<ErrorIcon />}>
                            <strong>Échec de la connexion</strong>
                            <Box sx={{ mt: 1 }}>
                                {result.error || result.message || 'Erreur inconnue'}
                            </Box>
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default OdooConnectionTest;
