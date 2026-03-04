import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useListContext, useUpdate, useNotify, useRefresh, useRedirect, useDataProvider } from 'react-admin';
import {
    Box, Card, CardContent, Typography, Chip, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    CircularProgress, LinearProgress, Badge,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useOdoo } from '../../../hooks/useOdoo';

const KANBAN_ORDER = [
    'BROUILLON', 'ENVOYE', 'EN_MER', 'AU_PORT', 'DOUANE', 'A_RECEPTIONNER', 'RECU',
];

const STATUS_REVERSE_MAP: Record<string, string> = {
    ENVOYE: 'BROUILLON',
    EN_MER: 'ENVOYE',
    AU_PORT: 'EN_MER',
    DOUANE: 'AU_PORT',
    A_RECEPTIONNER: 'DOUANE',
};

interface KanbanColumnProps {
    status: any;
    achats: any[];
    onDrop: (achatId: string, targetStatus: any) => void;
    onShowOdoo: (achat: any) => void;
    onCheckReception: (achat: any) => void;
}

const KanbanCard = ({ achat, onShowOdoo, onCheckReception }: {
    achat: any;
    onShowOdoo: (achat: any) => void;
    onCheckReception: (achat: any) => void;
}) => {
    const redirect = useRedirect();
    const statusCode = achat.status?.code;
    const isReceptionnable = statusCode === 'A_RECEPTIONNER';

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('achat_id', String(achat.id));
        e.dataTransfer.setData('achat_json', JSON.stringify(achat));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <Card
            draggable={statusCode !== 'RECU'}
            onDragStart={handleDragStart}
            sx={{
                mb: 1,
                cursor: statusCode !== 'RECU' ? 'grab' : 'default',
                '&:hover': { boxShadow: 3 },
                transition: 'box-shadow 0.2s',
                borderLeft: `4px solid ${achat.status?.color || '#ccc'}`,
            }}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                        variant="body2"
                        fontWeight="bold"
                        noWrap
                        sx={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => redirect('show', 'achats', achat.id)}
                    >
                        {achat.supplier || 'Sans fournisseur'}
                    </Typography>
                    {achat.odooPurchaseOrderName && (
                        <Tooltip title="Ouvrir dans Odoo">
                            <IconButton size="small" onClick={() => onShowOdoo(achat)}>
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Typography variant="caption" color="text.secondary" display="block">
                    {achat.shipNumber || `#${achat.id}`}
                </Typography>

                {achat.totalHT != null && (
                    <Typography variant="caption" color="text.secondary">
                        {achat.totalHT.toFixed(2)} {achat.targetCurrency || 'EUR'}
                    </Typography>
                )}

                {achat.deliveryDate && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        Livraison : {new Date(achat.deliveryDate).toLocaleDateString('fr-FR')}
                    </Typography>
                )}

                {isReceptionnable && (
                    <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onCheckReception(achat)}
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                        fullWidth
                    >
                        Vérifier réception Odoo
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

const KanbanColumn = ({ status, achats, onDrop, onShowOdoo, onCheckReception }: KanbanColumnProps) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const achatId = e.dataTransfer.getData('achat_id');
        if (achatId) {
            onDrop(achatId, status);
        }
    };

    return (
        <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
                flex: '1 1 0',
                minWidth: 180,
                maxWidth: 250,
                bgcolor: isDragOver ? 'action.hover' : 'grey.50',
                borderRadius: 2,
                border: isDragOver ? '2px dashed' : '1px solid',
                borderColor: isDragOver ? status.color || 'primary.main' : 'grey.200',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Box
                sx={{
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                    bgcolor: status.color || '#6c757d',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="subtitle2" color="white" fontWeight="bold" noWrap>
                    {status.label}
                </Typography>
                <Badge badgeContent={achats.length} color="default" sx={{ '& .MuiBadge-badge': { bgcolor: 'rgba(255,255,255,0.3)', color: 'white' } }}>
                    <Box />
                </Badge>
            </Box>

            <Box sx={{ p: 1, overflowY: 'auto', flex: 1 }}>
                {achats.map(achat => (
                    <KanbanCard
                        key={achat.id}
                        achat={achat}
                        onShowOdoo={onShowOdoo}
                        onCheckReception={onCheckReception}
                    />
                ))}
            </Box>
        </Box>
    );
};

export const AchatsKanban = () => {
    const { data: rawData, isLoading } = useListContext();
    const [update] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();
    const {
        loading: odooLoading,
        syncTransitStatus,
        updatePurchaseOrderPrices,
        cancelPurchaseOrder,
        calculateCostPrices,
        checkPickingState,
        getPurchaseOrderPickings,
    } = useOdoo();

    const dataProvider = useDataProvider();
    const [prDialog, setPrDialog] = useState<{ open: boolean; achat: any; targetStatus: any }>({ open: false, achat: null, targetStatus: null });
    const [processing, setProcessing] = useState(false);
    const [allStatuses, setAllStatuses] = useState<any[]>([]);
    const dragAchatRef = useRef<any>(null);

    const data = useMemo(() => rawData ?? [], [rawData]);

    useEffect(() => {
        dataProvider.getList('statuses', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'id', order: 'ASC' },
            filter: {},
        }).then(({ data: statusData }) => {
            setAllStatuses(statusData ?? []);
        }).catch(() => setAllStatuses([]));
    }, [dataProvider]);

    const statuses = useMemo(() => {
        return KANBAN_ORDER
            .map(code => allStatuses.find((s: any) => s.code === code))
            .filter(Boolean);
    }, [allStatuses]);

    const achatsByStatus = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        KANBAN_ORDER.forEach(code => { grouped[code] = []; });
        data.forEach((achat: any) => {
            const code = achat.status?.code;
            if (code && grouped[code]) {
                grouped[code].push(achat);
            }
        });
        return grouped;
    }, [data]);

    const getStatusByCode = useCallback((code: string) => {
        return statuses.find((s: any) => s.code === code);
    }, [statuses]);

    const isValidTransition = (fromCode: string, toCode: string): boolean => {
        const fromIdx = KANBAN_ORDER.indexOf(fromCode);
        const toIdx = KANBAN_ORDER.indexOf(toCode);
        if (fromIdx === -1 || toIdx === -1) return false;
        if (toIdx === fromIdx + 1) return true;
        if (toIdx === fromIdx - 1 && STATUS_REVERSE_MAP[fromCode] === toCode) return true;
        return false;
    };

    const isReverseTransition = (fromCode: string, toCode: string): boolean => {
        return STATUS_REVERSE_MAP[fromCode] === toCode;
    };

    const handleDrop = useCallback(async (achatId: string, targetStatus: any) => {
        const achat = data.find((a: any) => String(a.id) === String(achatId));
        if (!achat) return;

        const fromCode = achat.status?.code;
        const toCode = targetStatus.code;

        if (fromCode === toCode) return;

        if (toCode === 'RECU') {
            notify('Le passage à REÇU se fait via le bouton de vérification de réception', { type: 'info' });
            return;
        }

        if (!isValidTransition(fromCode, toCode)) {
            notify(`Transition ${fromCode} → ${toCode} non autorisée`, { type: 'warning' });
            return;
        }

        if (toCode === 'A_RECEPTIONNER') {
            dragAchatRef.current = achat;
            setPrDialog({ open: true, achat, targetStatus });
            return;
        }

        await executeTransition(achat, targetStatus);
    }, [data, notify]);

    const executeTransition = async (achat: any, targetStatus: any) => {
        setProcessing(true);
        const fromStatus = achat.status;
        const toCode = targetStatus.code;
        const isReverse = isReverseTransition(fromStatus?.code, toCode);

        try {
            if (isReverse && fromStatus?.code === 'ENVOYE' && achat.odooPurchaseOrderId) {
                await cancelPurchaseOrder(achat.odooPurchaseOrderId);
            }

            const transferResult = await syncTransitStatus(achat, fromStatus, targetStatus);

            const statusIri = targetStatus['@id'] || targetStatus.id || `/statuses/${targetStatus.id}`;
            await update('achats', {
                id: achat.id,
                data: { status: statusIri },
                previousData: achat,
            });

            notify(`${achat.supplier || achat.shipNumber} → ${targetStatus.label}`, { type: 'success' });
            refresh();
        } catch (e: any) {
            notify(e.message || 'Erreur lors de la transition', { type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handlePrConfirm = async (choice: 'yes' | 'no' | 'later') => {
        const { achat, targetStatus } = prDialog;
        setPrDialog({ open: false, achat: null, targetStatus: null });

        if (choice === 'later') return;

        if (choice === 'no') {
            redirect('edit', 'achats', achat.id);
            return;
        }

        setProcessing(true);
        try {
            if (achat.odooPurchaseOrderId) {
                const costItems = calculateCostPrices(achat);
                const lines = costItems.map(item => ({
                    product_id: item.productId,
                    price_unit: item.mainPr,
                }));
                await updatePurchaseOrderPrices(achat.odooPurchaseOrderId, lines);
            }

            await executeTransition(achat, targetStatus);
        } catch (e: any) {
            notify(e.message || 'Erreur mise à jour PR', { type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckReception = async (achat: any) => {
        if (!achat.odooPurchaseOrderId) {
            notify('Aucune commande Odoo liée', { type: 'warning' });
            return;
        }

        setProcessing(true);
        try {
            const pickings = await getPurchaseOrderPickings(achat.odooPurchaseOrderId);
            const receptionPickings = pickings.filter(
                (p: any) => p.picking_type_id?.[1]?.includes('Réception') || p.picking_type_id?.[1]?.includes('Receipt')
            );

            if (receptionPickings.length === 0) {
                notify('Aucune réception trouvée dans Odoo pour cette commande', { type: 'warning' });
                return;
            }

            const allDone = receptionPickings.every((p: any) => p.state === 'done');
            const hasPending = receptionPickings.some((p: any) => p.state !== 'done');

            if (allDone) {
                const recuStatus = getStatusByCode('RECU');
                if (recuStatus) {
                    await update('achats', {
                        id: achat.id,
                        data: { status: recuStatus['@id'] || `/statuses/${recuStatus.id}` },
                        previousData: achat,
                    });
                    notify('Réception complète — statut passé à REÇU', { type: 'success' });
                    refresh();
                }
            } else {
                const doneCount = receptionPickings.filter((p: any) => p.state === 'done').length;
                notify(
                    `Réception en cours (${doneCount}/${receptionPickings.length} validées). Complétez la réception dans Odoo.`,
                    { type: 'info' }
                );
            }
        } catch (e: any) {
            notify(e.message || 'Erreur vérification réception', { type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleShowOdoo = (achat: any) => {
        if (achat.odooPurchaseOrderId) {
            const odooBase = 'https://ah-chou1.odoo.com';
            window.open(`${odooBase}/odoo/purchase/${achat.odooPurchaseOrderId}`, '_blank');
        }
    };

    if (isLoading) {
        return <Box p={4} textAlign="center"><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 1 }}>
            {(processing || odooLoading) && <LinearProgress sx={{ mb: 1 }} />}

            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    minHeight: 'calc(100vh - 200px)',
                    pb: 2,
                }}
            >
                {statuses.map((status: any) => (
                    <KanbanColumn
                        key={status.code}
                        status={status}
                        achats={achatsByStatus[status.code] || []}
                        onDrop={handleDrop}
                        onShowOdoo={handleShowOdoo}
                        onCheckReception={handleCheckReception}
                    />
                ))}
            </Box>

            {/* Dialog PR — DOUANE → A_RECEPTIONNER */}
            <Dialog open={prDialog.open} onClose={() => handlePrConfirm('later')} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" />
                    Mise à jour des prix de revient
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        À cette étape, vos prix de revient doivent être définitifs. Avez-vous finalisé les coûts d'approche pour cet achat ?
                    </Typography>
                    {prDialog.achat && (
                        <Chip
                            label={`${prDialog.achat.supplier || ''} — ${prDialog.achat.shipNumber || `#${prDialog.achat.id}`}`}
                            sx={{ mt: 1, mb: 2 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handlePrConfirm('yes')}
                        disabled={processing}
                    >
                        Oui, mes coûts sont à jour
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => handlePrConfirm('no')}
                        disabled={processing}
                    >
                        Non, je vais les mettre à jour
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        color="inherit"
                        onClick={() => handlePrConfirm('later')}
                        disabled={processing}
                    >
                        Plus tard
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AchatsKanban;
