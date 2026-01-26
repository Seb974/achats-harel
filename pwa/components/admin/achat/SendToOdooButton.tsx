import { useState, useMemo } from 'react';
import { useRecordContext, useNotify, useRefresh } from 'react-admin';
import { 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    CircularProgress,
    Alert,
    Typography,
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useOdoo } from '../../../hooks/useOdoo';

interface SendToOdooButtonProps {
    label?: string;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

/**
 * Bouton pour envoyer un achat vers Odoo comme commande fournisseur confirmée
 * 
 * Utilise les prix de revient calculés (avec coûts d'approche et taxes)
 * et crée directement une commande confirmée dans Odoo.
 * 
 * @example
 * // Dans AchatShow.tsx ou AchatsEdit.tsx
 * <SendToOdooButton />
 */
export const SendToOdooButton = ({ 
    label = 'Envoyer vers Odoo',
    variant = 'contained',
    color = 'primary'
}: SendToOdooButtonProps) => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    
    const { 
        isOdooConfigured, 
        dataSource, 
        loading, 
        createPurchaseOrder, 
        convertAchatToPurchaseOrder,
        calculateCostPrices
    } = useOdoo();
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [sending, setSending] = useState(false);

    // Calculer les prix de revient pour l'aperçu
    const costPriceItems = useMemo(() => {
        if (!record) return [];
        return calculateCostPrices(record);
    }, [record, calculateCostPrices]);

    // Calculer les totaux
    const totals = useMemo(() => {
        return costPriceItems.reduce((acc, item) => ({
            totalHT: acc.totalHT + (item.ht || 0),
            totalTTC: acc.totalTTC + (item.ttc || 0),
            totalQty: acc.totalQty + (item.mainQuantity || 0),
        }), { totalHT: 0, totalTTC: 0, totalQty: 0 });
    }, [costPriceItems]);

    // Ne pas afficher si Odoo n'est pas configuré ou si la source n'est pas Odoo
    if (!isOdooConfigured || dataSource !== 'odoo') {
        return null;
    }

    const handleOpen = () => {
        setDialogOpen(true);
        setResult(null);
    };

    const handleClose = () => {
        setDialogOpen(false);
        if (result?.success) {
            refresh();
        }
    };

    const handleSend = async () => {
        if (!record) {
            notify('Aucun achat sélectionné', { type: 'warning' });
            return;
        }

        setSending(true);
        
        try {
            const purchaseOrderData = convertAchatToPurchaseOrder(record);
            
            if (!purchaseOrderData) {
                setSending(false);
                return;
            }

            const response = await createPurchaseOrder(purchaseOrderData);
            setResult(response);

            if (response.success) {
                notify(`Commande ${response.order_name} créée et confirmée dans Odoo !`, { type: 'success' });
            }
        } catch (error: any) {
            setResult({ success: false, error: error.message });
            notify(error.message || 'Erreur lors de l\'envoi', { type: 'error' });
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Button
                variant={variant}
                color={color}
                onClick={handleOpen}
                startIcon={<ShoppingCartIcon />}
                disabled={loading}
            >
                {label}
            </Button>

            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon color="primary" />
                    Envoyer la commande vers Odoo
                </DialogTitle>
                
                <DialogContent>
                    {!result ? (
                        <Box>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Cette action va créer une <strong>commande fournisseur confirmée</strong> dans Odoo 
                                avec les <strong>prix de revient</strong> calculés (coûts d'approche inclus).
                            </Alert>
                            
                            {record && (
                                <>
                                    {/* Informations générales */}
                                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Informations de la commande
                                        </Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                            <Typography variant="body2">
                                                <strong>Fournisseur :</strong> {record.supplier || 'Non spécifié'}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Référence :</strong> {record.shipNumber || `HAREL-${record.id}`}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Coefficient d'approche :</strong> {record.coeffApp?.toFixed(4) || '1.0000'}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Devise :</strong> EUR (prix de revient)
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Aperçu des lignes */}
                                    <Typography variant="subtitle2" gutterBottom>
                                        Aperçu des lignes de commande ({costPriceItems.length} articles)
                                    </Typography>
                                    
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Produit</TableCell>
                                                    <TableCell align="right">Qté (unités)</TableCell>
                                                    <TableCell align="right">Prix revient/u</TableCell>
                                                    <TableCell align="right">Total TTC</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {costPriceItems.map((item, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                                {item.product}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.quantity} x {item.packaging}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.mainQuantity?.toLocaleString('fr-FR')}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.mainPr?.toFixed(4)} EUR
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.ttc?.toFixed(2)} EUR
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {/* Ligne de total */}
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell>
                                                        <strong>TOTAL</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>{totals.totalQty.toLocaleString('fr-FR')}</strong>
                                                    </TableCell>
                                                    <TableCell align="right">-</TableCell>
                                                    <TableCell align="right">
                                                        <strong>{totals.totalTTC.toFixed(2)} EUR</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        La commande sera directement <strong>confirmée</strong> dans Odoo (état "Bon de commande").
                                    </Alert>
                                </>
                            )}
                        </Box>
                    ) : result.success ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                            
                            <Typography variant="h6" gutterBottom>
                                Commande créée et confirmée !
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                                <Chip 
                                    label={result.order_name} 
                                    color="success" 
                                    variant="filled"
                                    icon={<ShoppingCartIcon />}
                                />
                                <Chip 
                                    label={`${result.lines_count} article(s)`} 
                                    variant="outlined" 
                                />
                                {result.amount_total > 0 && (
                                    <Chip 
                                        label={`Total: ${result.amount_total.toFixed(2)} EUR`} 
                                        color="info" 
                                        variant="outlined" 
                                    />
                                )}
                                <Chip 
                                    label={`État: ${result.state === 'purchase' ? 'Confirmée' : result.state}`} 
                                    color="primary" 
                                    variant="outlined" 
                                />
                            </Box>
                            
                            {result.origin && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Référence origine : {result.origin}
                                </Typography>
                            )}
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Vous pouvez maintenant retrouver cette commande dans Odoo 
                                (Achats → Bons de commande).
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Alert severity="error">
                                <strong>Erreur lors de la création de la commande</strong>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {result.error || result.message || 'Une erreur est survenue'}
                                </Typography>
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        {result?.success ? 'Fermer' : 'Annuler'}
                    </Button>
                    
                    {!result && (
                        <Button 
                            onClick={handleSend} 
                            variant="contained" 
                            color="success"
                            disabled={sending || costPriceItems.length === 0}
                            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                        >
                            {sending ? 'Envoi en cours...' : 'Créer et confirmer la commande'}
                        </Button>
                    )}
                    
                    {result && !result.success && (
                        <Button 
                            onClick={handleSend} 
                            variant="contained" 
                            color="primary"
                            disabled={sending}
                        >
                            Réessayer
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SendToOdooButton;
