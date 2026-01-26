import React, { useMemo, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { ReferenceArrayInput } from "react-admin";
import { formatNumber, isDefinedAndNotVoid } from "../../../app/lib/utils";

const CategoryTaxInput = ({ client, products, allTaxes = [], customFields= [] }) => {
  const { control, setValue } = useFormContext();
  const items = useWatch({ control, name: "items" });
  const categoryTaxesArray = useWatch({ control, name: "categoryTaxesArray" });
  const clientDecimal = client?.decimalRound ?? 3;

  const groupingElement = client?.groupingElement ?? "CATEGORY";

  const categoriesSummary = useMemo(() => {
    if (!isDefinedAndNotVoid(items)) return [];

    const map = {}
    for (let item of items) {
      if ((groupingElement === "CATEGORY" && !item?.categoryId) || groupingElement !== "CATEGORY") {
        if (!item?.productId) continue;
        const selectedProduct = products.find(p => p.id === item.productId);
        const category = groupingElement === "CATEGORY" ? selectedProduct?.category : selectedProduct?.custom_fields;
        if (!category) continue;
        if (groupingElement === "CATEGORY") {
          item = { ...item, categoryId: category.id, category: category.name };
        } else {
          const selection = Object.entries(category || {}).find(([code, data]) => parseInt(code) === parseInt(groupingElement));
          item = {...item, categoryId: selection[1] ?? '', category: selection[1] ?? ''};
        }
      }

      if (!map[item.categoryId]) {
        map[item.categoryId] = {categoryId: item.categoryId, categoryName: item.category, totalHT: 0, totalQty: 0};
      }

      map[item.categoryId].totalQty += item.quantity ?? 0;
      map[item.categoryId].totalHT += (item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0);
      map[item.categoryId].categoryName = item.category;
    }

    Object.values(map).forEach(cat => {
      const selectedTaxIds = categoryTaxesArray?.[cat.categoryId]?.taxIds ?? [];
      const selectedTaxes = allTaxes.filter(t => selectedTaxIds.includes(t['@id']));
      const totalRate = selectedTaxes.reduce((sum, t) => sum + (t.rate ?? 0), 0);
      const taxesAmount = cat.totalHT * (totalRate / 100);
      const totalTTC = cat.totalHT + taxesAmount;

      cat.totalRate = totalRate;
      cat.taxesAmount = taxesAmount;
      cat.totalTTC = totalTTC;
    });

    return Object.values(map);
  }, [items, categoryTaxesArray, allTaxes, products]);

  useEffect(() => {
    if (!categoriesSummary.length) return;

    categoriesSummary.forEach(cat => {
      const existing = categoryTaxesArray?.[cat.categoryId] ?? {};
      const selectedTaxIds = existing?.taxIds ?? [];

      if (existing.taxesAmount !== cat.taxesAmount || existing.totalTTC !== cat.totalTTC || existing.totalRate !== cat.totalRate) {
        setValue(`categoryTaxesArray.${cat.categoryId}`, {
            taxIds: selectedTaxIds,
            totalQty: cat.totalQty,
            totalHT: cat.totalHT,
            taxesAmount: cat.taxesAmount,
            totalTTC: cat.totalTTC,
            totalRate: cat.totalRate,
            categoryName: cat.categoryName,
          },
          { shouldValidate: false, shouldDirty: true }
        );
      }
    });
  }, [categoriesSummary, categoryTaxesArray, setValue]);

  if (!categoriesSummary.length) return null;

  return (
    <Box mt={3} mb={3} className="w-full">
      <Typography variant="p" gutterBottom>
        Taxes par catégorie
      </Typography>
      <TableContainer
        variant="outlined"
        sx={{ maxWidth: "100%", overflowX: "auto", marginTop: "1em" }}
      >
        <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell sx={{ width: "15%" }}>Catégorie</TableCell>
              <TableCell align="right" sx={{ width: "10%" }}>Quantité</TableCell>
              <TableCell align="right" sx={{ width: "15%" }}>Total HT</TableCell>
              <TableCell sx={{ width: "45%" }}>Taxes associées</TableCell>
              <TableCell align="right" sx={{ width: "15%" }}>Montant des taxes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriesSummary.map(cat => (
              <TableRow key={cat.categoryId}>
                <TableCell>{cat.categoryName}</TableCell>
                <TableCell align="right">
                  {formatNumber(parseFloat(cat.totalQty.toFixed(clientDecimal)))}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(parseFloat(cat.totalHT.toFixed(clientDecimal)))} {client?.mainCurrency ?? ""}
                </TableCell>
                <TableCell>
                  <ReferenceArrayInput
                    key={cat.categoryId}
                    reference="taxes"
                    source={`categoryTaxesArray.${cat.categoryId}.taxIds`}
                    label=""
                    fullWidth
                  />
                </TableCell>
                <TableCell align="right">
                  {formatNumber(parseFloat(cat.taxesAmount.toFixed(clientDecimal)))} {client?.mainCurrency ?? ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CategoryTaxInput;
