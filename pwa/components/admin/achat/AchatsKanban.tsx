import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useListContext, useNotify, useRefresh, useRedirect, useDataProvider } from 'react-admin';
import {
    Box, Card, CardContent, Typography, Chip, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    CircularProgress, LinearProgress, Badge,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Alert,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
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
    stockCount?: number;
    onHeaderClick?: (status: any) => void;
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

const KanbanColumn = ({ status, achats, onDrop, onShowOdoo, onCheckReception, stockCount, onHeaderClick }: KanbanColumnProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const hasOdooLocation = !!status.odooLocationId;

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
                onClick={() => hasOdooLocation && onHeaderClick?.(status)}
                sx={{
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                    bgcolor: status.color || '#6c757d',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: hasOdooLocation ? 'pointer' : 'default',
                    '&:hover': hasOdooLocation ? { filter: 'brightness(1.1)' } : {},
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                    <Typography variant="subtitle2" color="white" fontWeight="bold" noWrap>
                        {status.label}
                    </Typography>
                    {hasOdooLocation && stockCount !== undefined && stockCount > 0 && (
                        <Tooltip title={`${stockCount} produit(s) dans Odoo`}>
                            <Chip
                                icon={<InventoryIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                                label={stockCount}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                    '& .MuiChip-label': { px: 0.5 },
                                }}
                            />
                        </Tooltip>
                    )}
                </Box>
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
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const {
        loading: odooLoading,
        isOdooConfigured,
        syncTransitStatus,
        updatePurchaseOrderPrices,
        cancelPurchaseOrder,
        calculateCostPrices,
        getPurchaseOrderPickings,
        createPurchaseOrder,
        convertAchatToPurchaseOrder,
        findSupplierByName,
        getStockCountsBatch,
        getStockAtLocation,
        getMovementHistory,
        postPOMessage,
    } = useOdoo();

    const [prDialog, setPrDialog] = useState<{ open: boolean; achat: any; targetStatus: any }>({ open: false, achat: null, targetStatus: null });
    const [processing, setProcessing] = useState(false);
    const [allStatuses, setAllStatuses] = useState<any[]>([]);
    const [stockCounts, setStockCounts] = useState<Record<number, number>>({});
    const [stockDialog, setStockDialog] = useState<{
        open: boolean;
        status: any;
        loading: boolean;
        data: any;
        history: any[];
    }>({ open: false, status: null, loading: false, data: null, history: [] });

    const data = useMemo(() => rawData ?? [], [rawData]);

    useEffect(() => {
        dataProvider.getList('statuses', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'id', order: 'ASC' },
            filter: {},
        }).then(({ data: statusData }: any) => {
            setAllStatuses(statusData ?? []);
        }).catch(() => setAllStatuses([]));
    }, [dataProvider]);

    useEffect(() => {
        if (!isOdooConfigured || allStatuses.length === 0) return;
        const locationIds = allStatuses
            .filter((s: any) => s.odooLocationId)
            .map((s: any) => s.odooLocationId as number);
        if (locationIds.length === 0) return;

        getStockCountsBatch(locationIds).then(setStockCounts);
    }, [allStatuses, isOdooConfigured]);

    const handleHeaderClick = useCallback(async (status: any) => {
        if (!status.odooLocationId) return;
        setStockDialog({ open: true, status, loading: true, data: null, history: [] });

        const [result, history] = await Promise.all([
            getStockAtLocation(status.odooLocationId),
            getMovementHistory(status.odooLocationId),
        ]);
        setStockDialog(prev => ({ ...prev, loading: false, data: result, history }));
    }, [getStockAtLocation, getMovementHistory]);

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

    const patchAchat = async (achatId: string, patchData: Record<string, any>) => {
        // @ts-ignore - patchResource is a custom method added to data provider
        return dataProvider.patchResource('achats', achatId, patchData);
    };

    const fetchFullAchat = async (achatId: string): Promise<any> => {
        const { data: fullAchat } = await dataProvider.getOne('achats', { id: achatId });
        return fullAchat;
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
            notify(`Transition ${fromCode} → ${toCode} non autorisée (adjacente uniquement)`, { type: 'warning' });
            return;
        }

        if (toCode === 'A_RECEPTIONNER') {
            setPrDialog({ open: true, achat, targetStatus });
            return;
        }

        await executeTransition(achat, targetStatus);
    }, [data, notify]);

    const executeTransition = async (achat: any, targetStatus: any) => {
        setProcessing(true);
        const fromCode = achat.status?.code;
        const toCode = targetStatus.code;
        const isReverse = isReverseTransition(fromCode, toCode);
        const statusIri = targetStatus['@id'] || `/statuses/${targetStatus.id}`;

        try {
            if (fromCode === 'BROUILLON' && toCode === 'ENVOYE') {
                await handleBrouillonToEnvoye(achat, statusIri);
            } else if (isReverse && fromCode === 'ENVOYE' && toCode === 'BROUILLON') {
                await handleEnvoyeToBrouillon(achat, statusIri);
            } else {
                await handleStockTransition(achat, targetStatus, statusIri, isReverse);
            }

            notify(`${achat.supplier || achat.shipNumber || '#' + achat.id} → ${targetStatus.label}`, { type: 'success' });
            refresh();

            const locationIds = allStatuses
                .filter((s: any) => s.odooLocationId)
                .map((s: any) => s.odooLocationId as number);
            if (locationIds.length > 0) {
                getStockCountsBatch(locationIds).then(setStockCounts);
            }
        } catch (e: any) {
            notify(e.message || 'Erreur lors de la transition', { type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleBrouillonToEnvoye = async (achat: any, statusIri: string) => {
        if (!isOdooConfigured) {
            await patchAchat(achat.id, { status: statusIri });
            return;
        }

        const fullAchat = await fetchFullAchat(achat.id);

        if (!fullAchat.supplierId && fullAchat.supplier) {
            const match = await findSupplierByName(fullAchat.supplier);
            if (match) {
                fullAchat.supplierId = match.id;
                await patchAchat(achat.id, { supplierId: match.id });
            }
        }

        const poData = convertAchatToPurchaseOrder(fullAchat);

        if (!poData) {
            await patchAchat(achat.id, { status: statusIri });
            const reason = !fullAchat.supplierId
                ? `Fournisseur "${fullAchat.supplier || '?'}" introuvable dans Odoo. Associez-le manuellement.`
                : 'Aucun article dans cet achat.';
            notify(`Statut → Envoyé, mais commande Odoo NON créée : ${reason}`, { type: 'warning', autoHideDuration: 8000 });
            return;
        }

        try {
            const result = await createPurchaseOrder(poData);
            if (result.success && result.order_id) {
                await patchAchat(achat.id, {
                    status: statusIri,
                    odooPurchaseOrderId: result.order_id,
                    odooPurchaseOrderName: result.order_name ?? null,
                });
                postPOMessage(result.order_id,
                    `<p><strong>📦 Statut transit : ENVOYÉ</strong><br/>Commande créée depuis l'application Achats Harel le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>`
                );
            } else {
                throw new Error(result.error || 'Erreur création PO Odoo');
            }
        } catch (e: any) {
            await patchAchat(achat.id, { status: statusIri });
            notify(`Statut → Envoyé, mais erreur Odoo : ${e.message}`, { type: 'warning', autoHideDuration: 8000 });
        }
    };

    const handleEnvoyeToBrouillon = async (achat: any, statusIri: string) => {
        if (achat.odooPurchaseOrderId) {
            postPOMessage(achat.odooPurchaseOrderId,
                `<p><strong>⬅️ Retour : ENVOYÉ → BROUILLON</strong><br/>Commande annulée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>`
            );
            try {
                await cancelPurchaseOrder(achat.odooPurchaseOrderId);
            } catch (e: any) {
                notify(`Annulation PO Odoo échouée : ${e.message}`, { type: 'warning' });
            }
        }
        await patchAchat(achat.id, {
            status: statusIri,
            odooPurchaseOrderId: null,
            odooPurchaseOrderName: null,
        });
    };

    const handleStockTransition = async (achat: any, targetStatus: any, statusIri: string, isReverse: boolean) => {
        const fromStatusCode = achat.status?.code;
        const fromStatus = getStatusByCode(fromStatusCode) || achat.status;

        const srcLocationId = isReverse ? targetStatus.odooLocationId : fromStatus?.odooLocationId;
        const destLocationId = isReverse ? fromStatus?.odooLocationId : targetStatus.odooLocationId;

        if (srcLocationId && destLocationId) {
            const fullAchat = await fetchFullAchat(achat.id);
            try {
                await syncTransitStatus(
                    fullAchat,
                    isReverse ? targetStatus : fromStatus,
                    isReverse ? fromStatus : targetStatus,
                );
            } catch (e: any) {
                notify(`Transfert stock Odoo échoué : ${e.message}. Statut mis à jour quand même.`, { type: 'warning' });
            }
        }

        if (achat.odooPurchaseOrderId) {
            const arrow = isReverse ? '⬅️ Retour' : '➡️ Transit';
            const fromLabel = fromStatus?.label || fromStatusCode;
            const toLabel = targetStatus.label;
            postPOMessage(achat.odooPurchaseOrderId,
                `<p><strong>${arrow} : ${fromLabel} → ${toLabel}</strong><br/>${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>`
            );
        }

        await patchAchat(achat.id, { status: statusIri });
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
                const fullAchat = await fetchFullAchat(achat.id);
                const costItems = calculateCostPrices(fullAchat);
                const lines = costItems.map((item: any) => ({
                    product_id: item.productId,
                    price_unit: item.mainPr,
                }));
                await updatePurchaseOrderPrices(achat.odooPurchaseOrderId, lines);
            }

            await executeTransition(achat, targetStatus);
        } catch (e: any) {
            notify(e.message || 'Erreur mise à jour PR', { type: 'error' });
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

            if (allDone) {
                const recuStatus = getStatusByCode('RECU');
                if (recuStatus) {
                    const statusIri = recuStatus['@id'] || `/statuses/${recuStatus.id}`;
                    await patchAchat(achat.id, { status: statusIri });
                    if (achat.odooPurchaseOrderId) {
                        postPOMessage(achat.odooPurchaseOrderId,
                            `<p><strong>✅ RÉCEPTION COMPLÈTE</strong><br/>Marchandises reçues et validées le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>`
                        );
                    }
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
                        stockCount={status.odooLocationId ? stockCounts[status.odooLocationId] : undefined}
                        onHeaderClick={handleHeaderClick}
                    />
                ))}
            </Box>

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

            <Dialog
                open={stockDialog.open}
                onClose={() => setStockDialog({ open: false, status: null, loading: false, data: null, history: [] })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <InventoryIcon color="primary" />
                    Rapport de stock — {stockDialog.status?.label}
                    {stockDialog.data?.location_name && (
                        <Chip label={stockDialog.data.location_name} size="small" variant="outlined" sx={{ ml: 1 }} />
                    )}
                </DialogTitle>
                <DialogContent>
                    {stockDialog.loading ? (
                        <Box textAlign="center" py={4}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Chargement depuis Odoo...
                            </Typography>
                        </Box>
                    ) : stockDialog.data?.error ? (
                        <Alert severity="error">{stockDialog.data.error}</Alert>
                    ) : (
                        <>
                            {/* Stock actuel */}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                Stock actuel dans cet emplacement
                            </Typography>
                            {stockDialog.data?.products?.length === 0 ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Aucun produit actuellement à cette étape.
                                </Alert>
                            ) : (
                                <>
                                    <Box display="flex" gap={2} mb={1}>
                                        <Chip
                                            label={`${stockDialog.data?.total_products ?? 0} produit(s)`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                        <Chip
                                            label={`Qté totale : ${stockDialog.data?.total_quantity ?? 0}`}
                                            color="secondary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Produit</strong></TableCell>
                                                    <TableCell align="right"><strong>Présent</strong></TableCell>
                                                    <TableCell align="right"><strong>Entré</strong></TableCell>
                                                    <TableCell align="right"><strong>Sorti</strong></TableCell>
                                                    <TableCell><strong>Depuis</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stockDialog.data?.products?.map((p: any) => (
                                                    <TableRow key={p.product_id}>
                                                        <TableCell>{p.product_name || `#${p.product_id}`}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{p.quantity}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'success.main' }}>{p.entered}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'error.main' }}>{p.exited}</TableCell>
                                                        <TableCell>
                                                            {p.since ? new Date(p.since).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}

                            {/* Historique des mouvements */}
                            {stockDialog.history.length > 0 && (
                                <>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                        Historique des mouvements
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Date</strong></TableCell>
                                                    <TableCell />
                                                    <TableCell><strong>Produit</strong></TableCell>
                                                    <TableCell align="right"><strong>Qté</strong></TableCell>
                                                    <TableCell><strong>Origine</strong></TableCell>
                                                    <TableCell><strong>Picking</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stockDialog.history.map((m: any, i: number) => (
                                                    <TableRow key={i} sx={{ bgcolor: m.direction === 'in' ? 'success.50' : 'error.50' }}>
                                                        <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                                            {m.date ? new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.85rem' }}>
                                                            {m.direction === 'in' ? '📥' : '📤'}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{m.product_name || `#${m.product_id}`}</TableCell>
                                                        <TableCell align="right">{m.quantity}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.75rem' }}>{m.origin}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.75rem' }}>{m.picking}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {stockDialog.status?.odooLocationId && (
                        <Button
                            onClick={() => {
                                window.open(
                                    `https://ah-chou1.odoo.com/odoo/inventory/products?location_id=${stockDialog.status.odooLocationId}`,
                                    '_blank'
                                );
                            }}
                            startIcon={<OpenInNewIcon />}
                        >
                            Voir dans Odoo
                        </Button>
                    )}
                    <Button
                        onClick={() => setStockDialog({ open: false, status: null, loading: false, data: null, history: [] })}
                    >
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AchatsKanban;
