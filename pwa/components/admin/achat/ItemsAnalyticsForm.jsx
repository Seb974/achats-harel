import { Box, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { useClient } from "../ClientProvider";
import { clientWithTaxes } from "../../../app/lib/client";

export const ItemsAnalyticsForm = ({ getPackaging }) => {
    const { control } = useFormContext();
    const { client } = useClient();
    const clientDecimal = client?.decimalRound ?? 3;
    const repartitionMethod = client?.repartitionMethod ?? "QUANTITY";

    const items = useWatch({ control, name: "items" }) ?? [];
    const groupingElement = useWatch({ control, name: "groupingElement" }) ?? (client?.groupingElement ?? "CATEGORY");
    const categoryTaxesArray = useWatch({ control, name: "categoryTaxesArray" }) ?? {};
    const globalTaxesComputed = useWatch({ control, name: "globalTaxesComputed" }) ?? {};
    const currency = ' ' + (useWatch({ control, name: "targetCurrency" }) ?? client?.mainCurrency ?? 'EUR');
    const coeffApp = useWatch({ control, name: "coeffApp" }) ?? 1;

    const round = (value) => parseFloat(value.toFixed(clientDecimal));

    if (!items.length) return <div>Pas d’items disponibles</div>;

    const totalFactor = items.reduce((sum, item) => {
        switch(repartitionMethod) {
            case "COST":
                return sum + ((item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0));
            case "WEIGHT":
                return sum + ((item.weight ?? 0) * (item.quantity ?? 0));
            case "QUANTITY":
            default:
                return sum + (item.quantity ?? 0);
        }
    }, 0);

    const itemsWithTTC = items.map(item => {
        const categoryTax = Object.entries(categoryTaxesArray || {}).find(
            ([categoryId, catData]) => (groupingElement === "CATEGORY" && parseInt(categoryId) === parseInt(item.categoryId)) || categoryId == item.categoryId
        )?.[1];

        const itemFactor = (() => {
            switch(repartitionMethod) {
                case "COST": return (item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0);
                case "WEIGHT": return (item.weight ?? 0) * (item.quantity ?? 0);
                case "QUANTITY":
                default: return item.quantity ?? 0;
            }
        })();

        const categoryTotalFactor = (() => {
            switch(repartitionMethod) {
                case "COST": return categoryTax?.totalHT ?? 1;
                case "WEIGHT": return categoryTax?.totalWeight ?? 1;
                case "QUANTITY":
                default: return categoryTax?.totalQty ?? 1;
            }
        })();

        const coeffAppFactor = (() => {
            if (isNaN(coeffApp) || coeffApp === 1) return 1;
            return coeffApp;
            // const relativeWeight = round(itemFactor / (totalFactor || 1));
            // return round(1 + (round(coeffApp )- 1) * relativeWeight);            
        })();

        const packaging = getPackaging(item?.productId, item?.packagingId);
        const quantityNumber = item?.quantity && !isNaN(item?.quantity) ? (item?.quantity ?? 0) : 0;
        const quantityDivider = quantityNumber === 0 ? 1 : quantityNumber;

        const mainQuantity = item?.packagingId === item?.mainPackagingId ? quantityNumber : quantityNumber * (packaging?.unit_factor ?? 0);
        const categoryTaxAmountPerItem = clientWithTaxes(client) && categoryTax ? round((categoryTax.taxesAmount ?? 0) / categoryTotalFactor * itemFactor) : 0;
        const globalTaxAmountPerItem = clientWithTaxes(client) && globalTaxesComputed?.globalTaxesAmount ? round((globalTaxesComputed.globalTaxesAmount ?? 0) / (totalFactor || 1) * itemFactor) : 0;
        const baseHt = round((item.outGoingUnitPriceHT ?? 0) * quantityNumber);
        const ht = clientWithTaxes(client) ? round(baseHt * coeffAppFactor) : baseHt;
        const baseTtc = round((ht + (!isNaN(categoryTaxAmountPerItem) ? categoryTaxAmountPerItem : 0) + (!isNaN(globalTaxAmountPerItem) ? globalTaxAmountPerItem : 0)));
        const ttc = clientWithTaxes(client) ? baseTtc : round(baseTtc * coeffAppFactor);
        const pr = round((ttc ?? 0) / quantityDivider);
        const mainPr = round((ttc ?? 0) / (item.mainQuantity ?? (mainQuantity ?? 1)));

        return { 
            ...item, 
            ht: !isNaN(ht) ? ht : 0, 
            ttc: !isNaN(ttc) ? ttc : 0, 
            pr: !isNaN(pr) ? pr : 0,
            mainPr: !isNaN(mainPr) ? mainPr : 0, 
            mainQuantity: item.mainQuantity && !isNaN(item.mainQuantity) ? item.mainQuantity : (mainQuantity ?? 1),
            outGoingUnitPriceHT: item.outGoingUnitPriceHT && !isNaN(item.outGoingUnitPriceHT) ? item.outGoingUnitPriceHT : (((!isNaN(ht) ? ht : 0) / quantityDivider) ?? 0),
            mainOutGoingUnitPriceHT: item.mainOutGoingUnitPriceHT && !isNaN(item.mainOutGoingUnitPriceHT) ? item.mainOutGoingUnitPriceHT : (((!isNaN(ht) ? ht : 0) / (mainQuantity ?? 1)) ?? 0),
            packaging: item.packaging ?? (packaging?.name ?? '')
        };
    });

    const totals = itemsWithTTC.reduce((acc, item) => {
        acc.totalHT += item.ht;
        acc.totalTTC += item.ttc;
        return acc;
    }, { totalHT: 0, totalTTC: 0 });

    return (
        <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Récapitulatif des items</Typography>
            <TableContainer>
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                            <TableCell>Produit</TableCell>
                            <TableCell>Catégorie</TableCell>
                            <TableCell align="right">Quantité</TableCell>
                            <TableCell align="right">Prix U HT</TableCell>
                            <TableCell align="right">Total HT</TableCell>
                            <TableCell align="right">Total TTC</TableCell>
                            <TableCell align="right">Prix de revient</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {itemsWithTTC.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.productName || item.product}</TableCell>
                                <TableCell>{item.categoryName || item.category}</TableCell>
                                <TableCell align="right">
                                    <p>{`${item?.quantity ?? 0} ${item?.packaging ?? ''}`}</p>
                                    { 
                                        item?.packagingId !== item?.mainPackagingId && parseFloat(item?.quantity) > 0 && 
                                        <p className="text-xs text-gray-500 italic">{`${item?.mainQuantity ?? 0} ${item?.mainPackaging ?? ''}`}</p> 
                                    }
                                </TableCell>
                                <TableCell align="right">
                                    <p>{parseFloat(item?.outGoingUnitPriceHT ?? 0).toFixed(clientDecimal) + currency}</p>
                                    { 
                                        item?.packagingId !== item?.mainPackagingId && parseFloat(item?.quantity ?? 0) > 0 && 
                                        <p className="text-xs text-gray-500 italic">{(item?.mainOutGoingUnitPriceHT ?? 0).toFixed(clientDecimal) + currency}</p>
                                    }
                                </TableCell>
                                <TableCell align="right">{(item?.ht ?? 0).toFixed(clientDecimal) + currency}</TableCell>
                                <TableCell align="right">{(item?.ttc ?? 0).toFixed(clientDecimal) + currency}</TableCell>
                                <TableCell align="right">
                                    <p>{(item?.pr ?? 0).toFixed(clientDecimal) + currency}</p>
                                    { 
                                        item?.packagingId !== item?.mainPackagingId && parseFloat(item?.quantity) > 0 && 
                                        <p className="text-xs text-gray-600 italic font-bold">{(item?.mainPr ?? 0).toFixed(clientDecimal) + currency}</p>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}

                        <TableRow sx={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                            <TableCell colSpan={4} align="right">Total</TableCell>
                            <TableCell align="right">{totals.totalHT.toFixed(clientDecimal) + currency}</TableCell>
                            <TableCell align="right">{totals.totalTTC.toFixed(clientDecimal) + currency}</TableCell>
                            <TableCell >{ " " }</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
