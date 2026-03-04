import { Show, TextField, NumberField, TopToolbar, ListButton, DateField, ArrayField, Datagrid, EditButton, FunctionField, FileField, ReferenceArrayField, TabbedShowLayout, useRecordContext, useNotify, useRefresh, useDataProvider } from 'react-admin';
import { formatNumber, getShipStyle, isDefined } from '../../../app/lib/utils';
import { clientWithCoeffCalculation, clientWithTaxes } from '../../../app/lib/client';
import { ItemsAnalytics } from "./ItemsAnalytics";
import { SendToOdooButton } from "./SendToOdooButton";
import { colors } from '../../../app/lib/colors';
import { useClient } from '../ClientProvider';
import { Box, Button, Chip, Theme, Tooltip, Typography, useMediaQuery } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';
import { useOdoo } from '../../../hooks/useOdoo';

const OdooLinkButton = () => {
    const record = useRecordContext();
    if (!record?.odooPurchaseOrderId) return null;

    const odooUrl = `https://ah-chou1.odoo.com/odoo/purchase/${record.odooPurchaseOrderId}`;

    return (
        <Tooltip title={`Ouvrir ${record.odooPurchaseOrderName || 'PO'} dans Odoo`}>
            <Button
                size="small"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(odooUrl, '_blank')}
                color="info"
            >
                {record.odooPurchaseOrderName || 'Odoo'}
            </Button>
        </Tooltip>
    );
};

const CheckReceptionButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const { getPurchaseOrderPickings } = useOdoo();
    const [checking, setChecking] = useState(false);

    if (!record?.odooPurchaseOrderId || record?.status?.code !== 'A_RECEPTIONNER') return null;

    const handleCheck = async () => {
        setChecking(true);
        try {
            const pickings = await getPurchaseOrderPickings(record.odooPurchaseOrderId);
            const receptions = pickings.filter(
                (p: any) => p.picking_type_id?.[1]?.includes('Réception') || p.picking_type_id?.[1]?.includes('Receipt')
            );

            if (receptions.length === 0) {
                notify('Aucune réception trouvée dans Odoo', { type: 'warning' });
                return;
            }

            const allDone = receptions.every((p: any) => p.state === 'done');

            if (allDone) {
                const statusesResp = await dataProvider.getList('statuses', {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'id', order: 'ASC' },
                    filter: {},
                });
                const recuStatus = (statusesResp.data ?? []).find((s: any) => s.code === 'RECU');

                if (recuStatus) {
                    const statusIri = recuStatus['@id'] || `/statuses/${recuStatus.id}`;
                    // @ts-ignore - patchResource is a custom method
                    await dataProvider.patchResource('achats', record.id, { status: statusIri });
                    notify('Réception complète — statut passé à REÇU', { type: 'success' });
                    refresh();
                }
            } else {
                const doneCount = receptions.filter((p: any) => p.state === 'done').length;
                notify(`Réception en cours (${doneCount}/${receptions.length}). Finalisez dans Odoo.`, { type: 'info' });
            }
        } catch (e: any) {
            notify(e.message || 'Erreur vérification', { type: 'error' });
        } finally {
            setChecking(false);
        }
    };

    return (
        <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleCheck}
            disabled={checking}
        >
            {checking ? 'Vérification...' : 'Vérifier réception'}
        </Button>
    );
};

const HarelShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
        <SendToOdooButton />
        <OdooLinkButton />
        <CheckReceptionButton />
    </TopToolbar>
);

export const AchatShow = () => {

    const { client } = useClient();
    const clientDecimal = client?.decimalRound ?? 3;
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

    const getChipMode = status => {
        const selectedColor = colors.find(c => c.id === (status?.color ?? '#9ca3af'));
        // @ts-ignore
        return !isDefined(selectedColor) || !isDefined(status?.label) ? (status?.label ?? '') : <Chip label={status.label} size="small" sx={ getShipStyle({color: selectedColor.id}) }/>
    };

    return (
        <Show actions={<HarelShowActions />}>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label={ client?.itemsPartName ?? "Produits" }>
                    <FunctionField
                        source="status"
                        label="Statut"
                        render={({status}) => getChipMode(status)}
                    />
                    <DateField source="date" label={ client?.dateRateName ?? "Date d'achat" } sortable={false} />
                    <DateField source="deliveryDate" sortable={false} label="Date de livraison"/>
                    <TextField source="supplier" label="Fournisseur" sortable={ false }/>
                    <TextField source="shipNumber" label="Référence" sortable={ false }/>
                    <TextField source="baseCurrency" label="Devise entrante" sortable={ false }/>
                    <FunctionField
                        source="exchangeRate"
                        label="Taux de change"
                        render={({exchangeRate, targetCurrency}) => `${ exchangeRate ?? '' } ${ exchangeRate && targetCurrency ? targetCurrency : '' }`}
                    />
                    <ArrayField source="items">
                        <Datagrid
                            optimized
                            rowClick={false}
                            bulkActionButtons={false}
                            sx={{
                                '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                                '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                            }}
                        >
                            <TextField source="product" label="Produit"/>
                            <TextField source="packaging" label="Packaging"/>
                            <NumberField source="quantity" label="Quantité" />
                            <FunctionField
                                source="outGoingUnitPriceHT"
                                label="Prix U HT"
                                render={({outGoingUnitPriceHT, targetCurrency}) => `${ outGoingUnitPriceHT ? formatNumber(outGoingUnitPriceHT) : '' } ${ outGoingUnitPriceHT && targetCurrency ? targetCurrency : '' }`}
                            />
                            <FunctionField
                                source="totalPriceHT"
                                label="Prix U HT"
                                render={({totalPriceHT, targetCurrency}) => `${ totalPriceHT ? formatNumber(totalPriceHT) : '' } ${ totalPriceHT && targetCurrency ? targetCurrency : '' }`}
                            />
                        </Datagrid>
                    </ArrayField>
                    <FunctionField
                        source="totalHT"
                        label="Total HT"
                        render={({totalHT, targetCurrency}) => `${ totalHT ? formatNumber(totalHT) : '' } ${ totalHT && targetCurrency ? targetCurrency : '' }`}
                    />
                    { (!clientWithTaxes(client) && (client?.hasCoeffApp ?? true) && !(client?.hasCoeffCalculation ?? true)) && <NumberField source="coeffApp" label="Coefficient d'approche" options={{ style: 'decimal' }}/> }
                    <FileField source="documents" src="contentUrl" title="description" target="_blank" label="Documents associés"/>
                    <TextField source="comment" label="Commentaire(s)"/>
                    <FunctionField
                        label="Commande Odoo"
                        render={(record: any) => record?.odooPurchaseOrderName ? (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                    label={record.odooPurchaseOrderName}
                                    color="primary"
                                    size="small"
                                    onClick={() => window.open(`https://ah-chou1.odoo.com/odoo/purchase/${record.odooPurchaseOrderId}`, '_blank')}
                                    icon={<OpenInNewIcon />}
                                    clickable
                                />
                            </Box>
                        ) : <Typography variant="caption" color="text.secondary">Non liée</Typography>}
                    />
                </TabbedShowLayout.Tab>
                { clientWithCoeffCalculation(client) && 
                    <TabbedShowLayout.Tab label={ client?.coeffCalculationPartName ?? "Coûts d'approche" }>
                        {/* @ts-ignore */}
                        <Typography variant="p" gutterBottom>
                            Taux de couverture
                        </Typography>
                        <ArrayField source="coveringCosts" label="">
                            <Datagrid
                            optimized
                            rowClick={false}
                            bulkActionButtons={false}
                            sx={{
                                '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                                '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                            }}
                        >
                            <DateField source="date" sortable={false} label="Date" />
                            <NumberField source="exchangeRate" label="Taux de change" />
                            <NumberField source="amount" label="Montant en devise" />
                            <FunctionField
                                source="value"
                                label="Valeur en EUR"
                                render={({amount, exchangeRate, baseCurrency}) => `${ amount && exchangeRate && !isNaN(amount) && !isNaN(exchangeRate) ? formatNumber(parseFloat((amount / (exchangeRate ?? 1)).toFixed(clientDecimal))) : '' } ${ amount && exchangeRate && client?.mainCurrency ? client?.mainCurrency : '' }`}
                            />
                        </Datagrid>
                        </ArrayField>
                        <FunctionField
                            source="totalCoveringCurrency"
                            label="Total devise"
                            render={({coveringCosts}) => formatNumber(parseFloat((coveringCosts ?? []).reduce((sum, i) => sum += (i?.amount ?? 0), 0).toFixed(clientDecimal))) }
                        />
                        <FunctionField
                            source="totalCoveringConverted"
                            label="Total en EUR"
                            render={({coveringCosts}) => `${formatNumber(parseFloat((coveringCosts ?? []).reduce((sum, i) => sum +=( (i?.amount ?? 0) / (i?.exchangeRate ?? 1)), 0).toFixed(clientDecimal)))} ${ client?.mainCurrency ? client?.mainCurrency : '' }` }
                        />
                        <FunctionField
                            source="totalCoveringHT"
                            label="Gain ou perte de change"
                            render={({totalCoveringHT}) => `${ totalCoveringHT ? formatNumber(parseFloat(totalCoveringHT.toFixed(clientDecimal))) : '' } ${ totalCoveringHT && client?.mainCurrency ? client?.mainCurrency : '' }`}
                        />

                        {/* @ts-ignore */}
                        <Typography variant="p" gutterBottom>
                            Autres coûts
                        </Typography>
                        <ArrayField source="otherCosts" label="">
                            <Datagrid
                            optimized
                            rowClick={false}
                            bulkActionButtons={false}
                            sx={{
                                '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                                '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                            }}
                        >
                            <TextField source="name" label="Coût"/>
                            <FunctionField
                                source="value"
                                label="Valeur"
                                render={({value, currency}) => `${ value ? formatNumber(parseFloat(value.toFixed(clientDecimal))) : '' } ${ value && currency ? currency : '' }`}
                            />
                        </Datagrid>
                        </ArrayField>
                        <FunctionField
                            source="totalOtherCosts"
                            label="Total des autres coûts en EUR"
                            render={({otherCosts}) => `${formatNumber(parseFloat((otherCosts ?? []).reduce((sum, i) => sum += (i?.value ?? 0), 0).toFixed(clientDecimal)))} ${ client?.mainCurrency ? client?.mainCurrency : '' }` }
                        />
                        <FunctionField
                            source="coeffApp"
                            label="Coefficient d'approche"
                            render={({coeffApp}) => `${parseFloat(coeffApp ?? 0)}`}
                            // render={({coeffApp}) => `${parseFloat(coeffApp?.toFixed(clientDecimal)) ?? 0}`}
                        />
                    </TabbedShowLayout.Tab>
                }
                { clientWithTaxes(client) &&
                    <TabbedShowLayout.Tab label={ client?.taxesPartName ?? "Autres coûts" } sx={ !clientWithTaxes(client) ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                        { ((client?.hasCoeffApp ?? true) && !(client?.hasCoeffCalculation ?? true)) && <NumberField source="coeffApp" label="Coefficient d'approche" options={{ style: 'decimal' }}/> }
                        <ArrayField source="categoryTaxes" label="Taxes par catégorie">
                            <Datagrid
                                optimized
                                bulkActionButtons={false}
                                rowClick={false}
                                sx={{
                                    '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                                    '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                                }}
                            >
                                <TextField source="categoryName" label="Catégorie"/>
                                <NumberField source="totalQty" label="Quantité" />
                                <FunctionField
                                    source="totalHT"
                                    label="Total HT"
                                    render={({totalHT}) => `${ totalHT ? formatNumber(totalHT) : '' } ${ totalHT && client?.mainCurrency ? client?.mainCurrency : '' }`}
                                />
                                <ReferenceArrayField reference="taxes" source="taxIds" label="Taxes"/>
                                <FunctionField
                                    source="taxesAmount"
                                    label="Montant des taxes"
                                    render={({taxesAmount}) => `${ taxesAmount ? formatNumber(taxesAmount) : '' } ${ taxesAmount && client?.mainCurrency ? client?.mainCurrency : '' }`}
                                />
                            </Datagrid>
                        </ArrayField>
                        <ReferenceArrayField reference="taxes" source="taxIds" label="Taxes globales"/>
                        <FunctionField
                            source="globalTaxesAmount"
                            label="Montant des taxes globales"
                            render={({globalTaxesAmount}) => `${ globalTaxesAmount ? formatNumber(globalTaxesAmount) : '' } ${ globalTaxesAmount && client?.mainCurrency ? client?.mainCurrency : '' }`}
                        />
                    </TabbedShowLayout.Tab>
                }
                { !isSmall && 
                    <TabbedShowLayout.Tab label={ client?.costPricesPartName ?? "Prix de revient" }>
                        <ItemsAnalytics/>
                    </TabbedShowLayout.Tab>
                }
            </TabbedShowLayout>                
        </Show>
    )
}