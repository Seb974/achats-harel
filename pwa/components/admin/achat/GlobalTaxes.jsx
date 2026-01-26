import React, { useEffect, useRef } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import { ReferenceArrayInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { formatNumber } from "../../../app/lib/utils";

const GlobalTaxInput = ({ client, allTaxes }) => {
    const { control, getValues, setValue } = useFormContext();
    const taxes = useWatch({ control, name: "taxes" });
    const globalTaxesComputed = useWatch({ control, name: "globalTaxesComputed" });
    const totalHT = useWatch({ control, name: "totalHT" });
    const clientDecimal = client?.decimalRound ?? 3;
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        const existing = getValues("taxes");
        const isEmpty = !existing || (Array.isArray(existing) && existing.length === 0);

        if (isEmpty && taxes?.length) {
            setValue("taxes", taxes, { shouldValidate: false, shouldDirty: false });
        }
        initializedRef.current = true;
    }, [taxes, getValues, setValue]);


    useEffect(() => {
        if (!taxes?.length || !allTaxes?.length) return;

        const selectedTaxes = allTaxes.filter(t => taxes.includes(t['@id']));
        const totalRate = selectedTaxes.reduce((sum, t) => sum + (t.rate ?? 0), 0);
        const globalTaxesAmount = totalHT * (totalRate / 100);

        const existing = getValues("globalTaxesComputed") || {};
        if (existing.globalTaxesAmount !== globalTaxesAmount || existing.globalTotalRate !== totalRate) {
            setValue("globalTaxesComputed", { globalTaxesAmount, globalTotalRate: totalRate }, { shouldValidate: false, shouldDirty: true });
        }

    }, [taxes, allTaxes, totalHT, getValues, setValue]);

    return (
        <Box mt={1} mb={3} className="w-full">
            <Typography variant="p" gutterBottom className="mb-0">
                Taxes globales
            </Typography>
             <TableContainer variant="outlined" sx={{ maxWidth: "100%", overflowX: "auto", marginTop: "1em" }}>
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                    <TableBody>
                        <TableRow key="globalTaxes">
                            <TableCell sx={{ width: "85%" }}>
                                <ReferenceArrayInput
                                    reference="taxes"
                                    source="taxes"
                                    label="Taxes globales"
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell align="right" sx={{ width: "15%" }}>
                                {formatNumber(parseFloat((globalTaxesComputed?.globalTaxesAmount ?? 0).toFixed(clientDecimal)))}{" "}
                                {client?.mainCurrency ?? ""}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default GlobalTaxInput;
