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

const KanbanColumn = ({ status, achats, onDrop, onShowOdoo, onCheckReception, onHeaderClick }: KanbanColumnProps) => {
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
                onClick={() => onHeaderClick?.(status)}
                sx={{
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                    bgcolor: status.color || '#6c757d',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { filter: 'brightness(1.1)' },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" color="white" fontWeight="bold" noWrap>
                        {status.label}
                    </Typography>
                </Box>
                <Chip
                    label={achats.length}
                    size="small"
                    sx={{
                        height: 22,
                        minWidth: 22,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '& .MuiChip-label': { px: 0.5 },
                    }}
                />
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
        validateReceipt,
        updateTransitStatus,
        clearTransitStock,
        createPurchaseOrder,
        convertAchatToPurchaseOrder,
        findSupplierByName,
        getStockByTransitStatus,
        postPOMessage,
    } = useOdoo();

    const [prDialog, setPrDialog] = useState<{ open: boolean; achat: any; targetStatus: any }>({ open: false, achat: null, targetStatus: null });
    const [processing, setProcessing] = useState(false);
    const [allStatuses, setAllStatuses] = useState<any[]>([]);
    const [stockDialog, setStockDialog] = useState<{
        open: boolean;
        status: any;
        loading: boolean;
        data: any;
    }>({ open: false, status: null, loading: false, data: null });

    interface TransitionStep {
        label: string;
        status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
        detail?: string;
    }
    const [transDialog, setTransDialog] = useState<{
        open: boolean;
        achat: any;
        fromStatus: any;
        targetStatus: any;
        phase: 'confirm' | 'executing' | 'done';
        steps: TransitionStep[];
        error?: string;
    }>({ open: false, achat: null, fromStatus: null, targetStatus: null, phase: 'confirm', steps: [] });

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

    const handleHeaderClick = useCallback(async (status: any) => {
        if (!status.code) return;
        setStockDialog({ open: true, status, loading: true, data: null });

        const result = await getStockByTransitStatus(status.code);
        setStockDialog(prev => ({ ...prev, loading: false, data: result }));
    }, [getStockByTransitStatus]);

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

    const describeTransitionSteps = (fromCode: string, toCode: string, achat: any): TransitionStep[] => {
        const isReverse = isReverseTransition(fromCode, toCode);
        const fromStatus = getStatusByCode(fromCode);
        const toStatus = getStatusByCode(toCode);
        const steps: TransitionStep[] = [];

        if (fromCode === 'BROUILLON' && toCode === 'ENVOYE') {
            steps.push({ label: 'Recherche fournisseur dans Odoo', status: 'pending' });
            steps.push({ label: 'Création du bon de commande (PO)', status: 'pending' });
            steps.push({ label: 'Confirmation RFQ → Purchase Order', status: 'pending' });
            steps.push({ label: 'Message chatter PO', status: 'pending' });
        } else if (isReverse && fromCode === 'ENVOYE' && toCode === 'BROUILLON') {
            steps.push({ label: 'Annulation du PO Odoo (button_cancel)', status: 'pending' });
            steps.push({ label: 'Nettoyage stock transit + suppression lien PO', status: 'pending' });
        } else {
            const srcName = fromStatus?.label || fromCode;
            const destName = toStatus?.label || toCode;
            const srcId = fromStatus?.odooLocationId;
            const destId = toStatus?.odooLocationId;

            if (srcId && destId) {
                steps.push({ label: `Transfert stock : ${srcName} (${srcId}) → ${destName} (${destId})`, status: 'pending' });
                steps.push({ label: 'Positionnement quantités sur le picking', status: 'pending' });
                steps.push({ label: 'Validation du picking (button_validate)', status: 'pending' });
            }
            if (achat.odooPurchaseOrderId) {
                steps.push({ label: `Message chatter PO (${achat.odooPurchaseOrderName || 'PO#' + achat.odooPurchaseOrderId})`, status: 'pending' });
            }
        }
        if (achat.odooPurchaseOrderId || (fromCode === 'BROUILLON' && toCode === 'ENVOYE')) {
            steps.push({ label: `Statut transit Odoo → ${toStatus?.label || toCode}`, status: 'pending' });
        }
        steps.push({ label: 'Mise à jour statut dans l\'app', status: 'pending' });
        steps.push({ label: 'Actualisation compteurs stock', status: 'pending' });
        return steps;
    };

    const handleDrop = useCallback(async (achatId: string, targetStatus: any) => {
        const achat = data.find((a: any) => String(a.id) === String(achatId));
        if (!achat) return;

        const fromCode = achat.status?.code;
        const toCode = targetStatus.code;

        if (fromCode === toCode) return;

        if (toCode === 'RECU') {
            notify('Le passage à REÇU se fait via le bouton de validation de réception', { type: 'info' });
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

        const fromStatus = getStatusByCode(fromCode) || achat.status;
        const steps = describeTransitionSteps(fromCode, toCode, achat);
        setTransDialog({
            open: true,
            achat,
            fromStatus,
            targetStatus,
            phase: 'confirm',
            steps,
        });
    }, [data, notify, statuses]);

    const updateStep = (index: number, update: Partial<TransitionStep>) => {
        setTransDialog(prev => {
            const steps = [...prev.steps];
            steps[index] = { ...steps[index], ...update };
            return { ...prev, steps };
        });
    };

    const executeTransitionWithSteps = async () => {
        setTransDialog(prev => ({ ...prev, phase: 'executing' }));
        setProcessing(true);

        const { achat, targetStatus } = transDialog;
        if (!achat || !targetStatus) return;

        const fromCode = achat.status?.code;
        const toCode = targetStatus.code;
        const isReverse = isReverseTransition(fromCode, toCode);
        const statusIri = targetStatus['@id'] || `/statuses/${targetStatus.id}`;
        let stepIdx = 0;
        let hasError = false;

        try {
            if (fromCode === 'BROUILLON' && toCode === 'ENVOYE') {
                if (!isOdooConfigured) {
                    for (let i = 0; i < transDialog.steps.length - 2; i++) updateStep(i, { status: 'skipped', detail: 'Odoo non configuré' });
                    stepIdx = transDialog.steps.length - 2;
                } else {
                    const fullAchat = await fetchFullAchat(achat.id);

                    updateStep(stepIdx, { status: 'running' });
                    if (!fullAchat.supplierId && fullAchat.supplier) {
                        const match = await findSupplierByName(fullAchat.supplier);
                        if (match) {
                            fullAchat.supplierId = match.id;
                            await patchAchat(achat.id, { supplierId: match.id });
                            updateStep(stepIdx, { status: 'success', detail: `${match.name} (id=${match.id})` });
                        } else {
                            updateStep(stepIdx, { status: 'error', detail: `"${fullAchat.supplier}" introuvable` });
                        }
                    } else {
                        updateStep(stepIdx, { status: 'success', detail: fullAchat.supplier || 'OK' });
                    }
                    stepIdx++;

                    const poData = convertAchatToPurchaseOrder(fullAchat);
                    if (!poData) {
                        updateStep(stepIdx, { status: 'error', detail: 'Aucun article ou fournisseur' });
                        stepIdx++;
                        updateStep(stepIdx, { status: 'skipped' });
                        stepIdx++;
                        updateStep(stepIdx, { status: 'skipped' });
                        stepIdx++;
                        await patchAchat(achat.id, { status: statusIri });
                        updateStep(stepIdx, { status: 'success', detail: 'Statut mis à jour (sans PO)' });
                        stepIdx++;
                        updateStep(stepIdx, { status: 'skipped' });
                        hasError = true;
                    } else {
                        updateStep(stepIdx, { status: 'running' });
                        try {
                            const result = await createPurchaseOrder(poData);
                            if (result.success && result.order_id) {
                                updateStep(stepIdx, { status: 'success', detail: `${result.order_name} (id=${result.order_id})` });
                                stepIdx++;
                                updateStep(stepIdx, { status: 'success', detail: 'RFQ confirmé' });
                                stepIdx++;

                                updateStep(stepIdx, { status: 'running' });
                                postPOMessage(result.order_id,
                                    `<p><strong>Statut transit : ENVOYÉ</strong><br/>Commande créée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>`
                                );
                                updateStep(stepIdx, { status: 'success' });
                                stepIdx++;

                                updateStep(stepIdx, { status: 'running' });
                                await updateTransitStatus(result.order_id, 'ENVOYE');
                                updateStep(stepIdx, { status: 'success', detail: 'x_statut_transit = envoye' });
                                stepIdx++;

                                updateStep(stepIdx, { status: 'running' });
                                await patchAchat(achat.id, {
                                    status: statusIri,
                                    odooPurchaseOrderId: result.order_id,
                                    odooPurchaseOrderName: result.order_name ?? null,
                                });
                                updateStep(stepIdx, { status: 'success' });
                                stepIdx++;
                            } else {
                                throw new Error(result.error || 'Erreur création PO');
                            }
                        } catch (e: any) {
                            updateStep(stepIdx, { status: 'error', detail: e.message });
                            hasError = true;
                            stepIdx = transDialog.steps.length - 1;
                        }
                    }
                }
            } else if (isReverse && fromCode === 'ENVOYE' && toCode === 'BROUILLON') {
                if (achat.odooPurchaseOrderId) {
                    updateStep(stepIdx, { status: 'running' });
                    try {
                        await cancelPurchaseOrder(achat.odooPurchaseOrderId);
                        updateStep(stepIdx, { status: 'success', detail: `PO ${achat.odooPurchaseOrderName} annulé` });
                    } catch (e: any) {
                        updateStep(stepIdx, { status: 'error', detail: e.message });
                    }
                } else {
                    updateStep(stepIdx, { status: 'skipped', detail: 'Aucun PO lié' });
                }
                stepIdx++;

                updateStep(stepIdx, { status: 'running' });
                const fullAchatForClear = await fetchFullAchat(achat.id);
                await clearTransitStock(fullAchatForClear);
                await patchAchat(achat.id, { status: statusIri, odooPurchaseOrderId: null, odooPurchaseOrderName: null });
                updateStep(stepIdx, { status: 'success' });
                stepIdx++;
            } else {
                const fromStatus = getStatusByCode(fromCode) || achat.status;
                const srcLocationId = fromStatus?.odooLocationId;
                const destLocationId = targetStatus.odooLocationId;

                let transferResult: any = null;
                if (srcLocationId && destLocationId) {
                    updateStep(stepIdx, { status: 'running' });
                    const fullAchat = await fetchFullAchat(achat.id);
                    try {
                        transferResult = await syncTransitStatus(
                            fullAchat,
                            fromStatus,
                            targetStatus,
                        );
                        updateStep(stepIdx, { status: 'success', detail: `loc ${srcLocationId} → ${destLocationId}` });
                        stepIdx++;
                        updateStep(stepIdx, { status: 'success', detail: transferResult?.picking_name || 'OK' });
                        stepIdx++;
                        updateStep(stepIdx, { status: 'success', detail: `state: ${transferResult?.state || 'done'}` });
                        stepIdx++;
                    } catch (e: any) {
                        updateStep(stepIdx, { status: 'error', detail: e.message });
                        stepIdx += 3;
                        hasError = true;
                    }
                }

                if (achat.odooPurchaseOrderId) {
                    updateStep(stepIdx, { status: 'running' });
                    const arrow = isReverse ? 'Retour' : 'Transit';
                    const fromLabel = fromStatus?.label || fromCode;
                    const toLabel = targetStatus.label;
                    const pickingRef = transferResult?.picking_name
                        ? `<br/>Transfert : <a href="https://ah-chou1.odoo.com/odoo/inventory/transfers/${transferResult.picking_id}">${transferResult.picking_name}</a> (${transferResult.state})`
                        : '';
                    postPOMessage(achat.odooPurchaseOrderId,
                        `<p><strong>${arrow} : ${fromLabel} → ${toLabel}</strong><br/>${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}${pickingRef}</p>`
                    );
                    updateStep(stepIdx, { status: 'success' });
                    stepIdx++;

                    updateStep(stepIdx, { status: 'running' });
                    await updateTransitStatus(achat.odooPurchaseOrderId, toCode);
                    const odooVal = toCode.toLowerCase().replace('_', '_');
                    updateStep(stepIdx, { status: 'success', detail: `x_statut_transit = ${odooVal}` });
                    stepIdx++;
                }

                updateStep(stepIdx, { status: 'running' });
                await patchAchat(achat.id, { status: statusIri });
                updateStep(stepIdx, { status: 'success' });
                stepIdx++;
            }

            if (!hasError && stepIdx < transDialog.steps.length) {
                updateStep(stepIdx, { status: 'success' });
            }

            refresh();
        } catch (e: any) {
            setTransDialog(prev => ({ ...prev, error: e.message }));
        } finally {
            setProcessing(false);
            setTransDialog(prev => ({ ...prev, phase: 'done' }));
        }
    };

    const executeTransition = async (achat: any, targetStatus: any) => {
        const fromCode = achat.status?.code;
        const steps = describeTransitionSteps(fromCode, targetStatus.code, achat);
        setTransDialog({
            open: true,
            achat,
            fromStatus: getStatusByCode(fromCode) || achat.status,
            targetStatus,
            phase: 'confirm',
            steps,
        });
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
        const fullAchat = await fetchFullAchat(achat.id);
        await clearTransitStock(fullAchat);
        await patchAchat(achat.id, {
            status: statusIri,
            odooPurchaseOrderId: null,
            odooPurchaseOrderName: null,
        });
    };

    const handleStockTransition = async (achat: any, targetStatus: any, statusIri: string, isReverse: boolean) => {
        const fromStatusCode = achat.status?.code;
        const fromStatus = getStatusByCode(fromStatusCode) || achat.status;

        const srcLocationId = fromStatus?.odooLocationId;
        const destLocationId = targetStatus.odooLocationId;

        if (srcLocationId && destLocationId) {
            const fullAchat = await fetchFullAchat(achat.id);
            try {
                await syncTransitStatus(fullAchat, fromStatus, targetStatus);
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
            const result = await validateReceipt(achat.odooPurchaseOrderId);

            if (result.success) {
                const recuStatus = getStatusByCode('RECU');
                if (recuStatus) {
                    const statusIri = recuStatus['@id'] || `/statuses/${recuStatus.id}`;
                    await patchAchat(achat.id, { status: statusIri });
                    await updateTransitStatus(achat.odooPurchaseOrderId, 'RECU');
                    postPOMessage(achat.odooPurchaseOrderId,
                        `<p><strong>✅ RÉCEPTION COMPLÈTE</strong><br/>Marchandises reçues et validées le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br/>Statut réception Odoo : ${result.receipt_status}</p>`
                    );
                    notify(`Réception validée — receipt_status: ${result.receipt_status}`, { type: 'success' });
                    refresh();
                }
            } else {
                notify(result.error || 'Aucun picking à valider', { type: 'info' });
            }
        } catch (e: any) {
            notify(e.message || 'Erreur validation réception', { type: 'error' });
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
                        onHeaderClick={handleHeaderClick}
                    />
                ))}
            </Box>

            {/* DIALOG TRANSITION UNIVERSELLE */}
            <Dialog
                open={transDialog.open}
                onClose={() => { if (transDialog.phase !== 'executing') setTransDialog(prev => ({ ...prev, open: false })); }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" />
                    <Box>
                        <Typography variant="h6" component="span">
                            {transDialog.fromStatus?.label || '?'} → {transDialog.targetStatus?.label || '?'}
                        </Typography>
                        {transDialog.achat && (
                            <Typography variant="body2" color="text.secondary">
                                {transDialog.achat.supplier || ''} — {transDialog.achat.shipNumber || `#${transDialog.achat.id}`}
                            </Typography>
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {transDialog.phase === 'confirm' && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Les actions suivantes seront exécutées dans Odoo :
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {transDialog.steps.map((step, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: step.status === 'error' ? 'error.50' : step.status === 'success' ? 'success.50' : step.status === 'running' ? 'action.hover' : 'transparent',
                                    border: step.status === 'running' ? '1px solid' : '1px solid transparent',
                                    borderColor: step.status === 'running' ? 'primary.main' : 'transparent',
                                }}
                            >
                                <Box sx={{ mt: 0.3, minWidth: 24, textAlign: 'center' }}>
                                    {step.status === 'pending' && <Typography color="text.disabled">○</Typography>}
                                    {step.status === 'running' && <CircularProgress size={18} />}
                                    {step.status === 'success' && <Typography color="success.main">✓</Typography>}
                                    {step.status === 'error' && <Typography color="error.main">✗</Typography>}
                                    {step.status === 'skipped' && <Typography color="text.disabled">—</Typography>}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: step.status === 'running' ? 'bold' : 'normal',
                                            color: step.status === 'skipped' ? 'text.disabled' : 'text.primary',
                                        }}
                                    >
                                        {step.label}
                                    </Typography>
                                    {step.detail && (
                                        <Typography variant="caption" color={step.status === 'error' ? 'error.main' : 'text.secondary'}>
                                            {step.detail}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {transDialog.error && (
                        <Alert severity="error" sx={{ mt: 2 }}>{transDialog.error}</Alert>
                    )}

                    {transDialog.phase === 'done' && !transDialog.error && transDialog.steps.every(s => s.status !== 'error') && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Transition complète. Toutes les actions Odoo ont été exécutées.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {transDialog.phase === 'confirm' && (
                        <>
                            <Button
                                onClick={() => setTransDialog(prev => ({ ...prev, open: false }))}
                                color="inherit"
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={executeTransitionWithSteps}
                                startIcon={<LocalShippingIcon />}
                            >
                                Exécuter
                            </Button>
                        </>
                    )}
                    {transDialog.phase === 'executing' && (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                            Exécution en cours...
                        </Typography>
                    )}
                    {transDialog.phase === 'done' && (
                        <>
                            {transDialog.achat?.odooPurchaseOrderId && (
                                <Button
                                    onClick={() => window.open(`https://ah-chou1.odoo.com/odoo/purchase/${transDialog.achat.odooPurchaseOrderId}`, '_blank')}
                                    startIcon={<OpenInNewIcon />}
                                >
                                    Voir PO dans Odoo
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={() => setTransDialog(prev => ({ ...prev, open: false }))}
                            >
                                Fermer
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

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
                onClose={() => setStockDialog({ open: false, status: null, loading: false, data: null })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <InventoryIcon color="primary" />
                    Produits — {stockDialog.status?.label}
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
                            {stockDialog.data?.products?.length === 0 ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Aucune commande avec ce statut transit dans Odoo.
                                </Alert>
                            ) : (
                                <>
                                    <Box display="flex" gap={2} mb={2}>
                                        <Chip
                                            label={`${stockDialog.data?.purchase_orders ?? 0} commande(s)`}
                                            color="info"
                                            variant="outlined"
                                            size="small"
                                        />
                                        <Chip
                                            label={`${stockDialog.data?.total_products ?? 0} ligne(s) produit`}
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
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Commande</strong></TableCell>
                                                    <TableCell><strong>Produit</strong></TableCell>
                                                    <TableCell align="right"><strong>Quantité</strong></TableCell>
                                                    <TableCell align="right"><strong>P.U.</strong></TableCell>
                                                    <TableCell align="right"><strong>Sous-total</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stockDialog.data?.products?.map((p: any, i: number) => (
                                                    <TableRow key={`${p.po_id}-${p.product_id}-${i}`}>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                                                                onClick={() => window.open(`https://ah-chou1.odoo.com/odoo/purchase/${p.po_id}`, '_blank')}
                                                            >
                                                                {p.po_name}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>{p.product_name || `#${p.product_id}`}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{p.quantity}</TableCell>
                                                        <TableCell align="right">{p.price_unit?.toFixed(2)} EUR</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{p.price_subtotal?.toFixed(2)} EUR</TableCell>
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
                        <>
                            <Button
                                onClick={() => window.open(
                                    'https://ah-chou1.odoo.com/web#action=892',
                                    '_blank'
                                )}
                                startIcon={<OpenInNewIcon />}
                                size="small"
                            >
                                Stock Transit Odoo
                            </Button>
                            <Button
                                onClick={() => window.open(
                                    'https://ah-chou1.odoo.com/web#action=893',
                                    '_blank'
                                )}
                                startIcon={<OpenInNewIcon />}
                                size="small"
                            >
                                Transferts Transit Odoo
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={() => setStockDialog({ open: false, status: null, loading: false, data: null })}
                    >
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AchatsKanban;
