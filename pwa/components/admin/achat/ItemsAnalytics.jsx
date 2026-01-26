import { Box, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from "@mui/material";
import { useRecordContext } from "react-admin";
import { useClient } from "../ClientProvider";
import { clientWithTaxes } from "../../../app/lib/client";

export const ItemsAnalytics = () => {
  const { client } = useClient();
  const record = useRecordContext();
  const clientDecimal = client?.decimalRound ?? 3;
  const groupingElement = record?.groupingElement ?? (client?.groupingElement ?? "CATEGORY");
  const repartitionMethod = client?.repartitionMethod ?? "QUANTITY";
  const currency = ' ' + (record.targetCurrency ?? (client?.mainCurrency ?? 'EUR'));

  const round = (value) => parseFloat(value.toFixed(clientDecimal));

  if (!record?.items) return <div>Pas d’items disponibles</div>;

  const totalFactor = record.items.reduce((sum, item) => {
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

  const itemsWithTTC = record.items.map(item => {
    const categoryTax = Object.values(record.categoryTaxes ?? {}).find(cat => (groupingElement === "CATEGORY" && parseInt(cat.categoryId) === parseInt(item.categoryId)) || cat.categoryId == item.categoryId);
    
    const itemFactor = (() => {
      switch(repartitionMethod) {
        case "COST":
          return (item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0);
        case "WEIGHT":
          return (item.weight ?? 0) * (item.quantity ?? 0);
        case "QUANTITY":
        default:
          return item.quantity ?? 0;
      }
    })();

    const categoryTotalFactor = (() => {
      switch(repartitionMethod) {
        case "COST":
          return categoryTax?.totalHT ?? 1;
        case "WEIGHT":
          return categoryTax?.totalWeight ?? 1;
        case "QUANTITY":
        default:
          return categoryTax?.totalQty ?? 1;
      }
    })();

    const coeffAppFactor = (() => {
        if (isNaN(record?.coeffApp) || record?.coeffApp === 1) return 1;
        return record?.coeffApp;    
        // const relativeWeight = round(itemFactor / (totalFactor || 1));
        // return round(1 + (round(record?.coeffApp) - 1) * relativeWeight);
    })();

    const categoryTaxAmountPerItem = clientWithTaxes(client) && categoryTax ? round((categoryTax.taxesAmount ?? 0) / categoryTotalFactor * itemFactor) : 0;
    const globalTaxAmountPerItem = clientWithTaxes(client) && record?.globalTaxesAmount ? round((record.globalTaxesAmount ?? 0) / (totalFactor || 1) * itemFactor) : 0;
    const baseHt = round((item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0));
    const ht = clientWithTaxes(client) ? round(baseHt * coeffAppFactor) : baseHt;
    const baseTtc = round(ht + (!isNaN(categoryTaxAmountPerItem) ? categoryTaxAmountPerItem : 0) + (!isNaN(globalTaxAmountPerItem) ? globalTaxAmountPerItem : 0));
    const ttc = clientWithTaxes(client) ? baseTtc : round(baseTtc * coeffAppFactor);
    const pr = round((ttc ?? 0) / (item.quantity ?? 1));
    const mainPr = round((ttc ?? 0) / (item.mainQuantity ?? 1));

    return { ...item, ht, ttc, pr, mainPr };
  });

  const totals = itemsWithTTC.reduce((acc, item) => {
      acc.totalHT += item.ht;
      acc.totalTTC += item.ttc;
      return acc;
    }, { totalHT: 0, totalTTC: 0 });

  return (
    <Box>
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
                   <p>{`${item.quantity ?? 0} ${item.packaging ?? ''}`}</p>
                    { item?.packagingId !== item?.mainPackagingId && parseFloat(item?.quantity ?? 0) > 0 && 
                    // (item?.unitFactor ?? 1) !== 1 && 
                        <p className="text-xs text-gray-500 italic">{`${item?.mainQuantity ?? 0} ${item?.mainPackaging ?? ''}`}</p> 
                    }
                </TableCell>
                <TableCell align="right">
                  <p>{parseFloat(item?.outGoingUnitPriceHT ?? 0).toFixed(clientDecimal) + currency}</p>
                  { item?.packagingId !== item?.mainPackagingId && parseFloat(item?.quantity ?? 0) > 0 && 
                  // (item?.unitFactor ?? 1) !== 1 &&
                      <p className="text-xs text-gray-500 italic">{(item?.mainOutGoingUnitPriceHT ?? 0).toFixed(clientDecimal) + currency}</p>
                  }
                </TableCell>
                <TableCell align="right">{(item?.ht ?? 0).toFixed(clientDecimal) + currency}</TableCell>
                <TableCell align="right">{(item?.ttc ?? 0).toFixed(clientDecimal) + currency}</TableCell>
                <TableCell align="right">
                  <p>{(item?.pr ?? 0).toFixed(clientDecimal) + currency}</p>
                  { item?.packagingId !== item?.mainPackagingId && parseFloat(item?.quantity ?? 0) > 0 && 
                  // (item?.unitFactor ?? 1) !== 1 &&
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
