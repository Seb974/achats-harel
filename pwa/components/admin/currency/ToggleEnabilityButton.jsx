import { useUpdate, useNotify, useRefresh, useRecordContext } from "react-admin";
import { IconButton, Tooltip } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { syncDocuments } from "../../../app/lib/client";
import { useSessionContext } from "../SessionContextProvider";
import React from "react";

const ToggleEnabilityButton = ({ label, textAlign }) => {
    const record = useRecordContext();
    const [update, { isLoading }] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();

    const transform = ({inUse, ...data}) => ({ ...data, inUse: !inUse });

    const handleClick = async e => {
        e.stopPropagation();
        const transformedData = transform(record);
        update('currencies', { id: record.id, data: transformedData, previousData: record }, {   
            onSuccess: () => {
                notify(`${getCurrencyName(record)} est maintenant ${!record.inUse ? "sélectionnable." : "indisponible."}`, { type: "info" });
                refresh();
            },
            onError: () => {
                notify("Erreur lors du changement de statut de la devise", { type: "warning" });
            }
        });
    };

    const getCurrencyName = (currency) => `La devise ${currency?.code ?? ''}`;

    return (
        <Tooltip title={record.inUse ? "Retirer de la sélection" : "Rendre sélectionnable"}>
        <span>
            <IconButton onClick={ handleClick } disabled={ isLoading } color={ record.inUse ? "success" : "error" }>
            {record.inUse ? <CheckCircle /> : <Cancel />}
            </IconButton>
        </span>
        </Tooltip>
    );
};

export default ToggleEnabilityButton;
