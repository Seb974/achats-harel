import { Show, TabbedShowLayout, TextField, DateField, BooleanField, FunctionField, NumberField, useDataProvider } from 'react-admin';
import { getColor, repartitionMethods } from '../../../app/lib/client';
import { isDefined, isDefinedAndNotVoid } from '../../../app/lib/utils';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export const ClientShow = () => {

    const dataProvider = useDataProvider();
    const [customFields, setCustomFields] = useState([]);

    useEffect(() => {
        const fetchAllCUstomFields = async () => {
            try {
                const allCustomFields = await dataProvider.getAll("harel_products/custom_fields");
                const customFields = [{id: "CATEGORY", name: "Catégorie", type: "text"}, ...allCustomFields];
                setCustomFields(customFields ?? []);
            } catch (e) {
                setCustomFields([]);
                console.error("Erreur de chargement des champs personnalisés:", e);
            }
        };
        fetchAllCUstomFields();
    }, []);

    const getDescription = ({ address, zipcode, city }) => {
        return <p>{ address }<br/>{ zipcode } - { city }</p>
    };

    const getRepartitionMethodName = (repartitionMethod) => {
        const selection = repartitionMethods.find(m => m.id === repartitionMethod);
        return selection?.name ?? '';
    };

    const getFilename = path => isDefined(path) ? path.split('/').pop() : '';

    const getGroupingElementName = ({ groupingElement }) => {
        const selection = isDefinedAndNotVoid(customFields) ? customFields.find(f => f.id == groupingElement) : null;
        return selection?.name ?? groupingElement;
    };

    return (
        <Show>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Informations">
                    <TextField source="name" label="Nom"/>
                    <FunctionField 
                        source="address"
                        label="Adresse"
                        render={record => getDescription(record) }
                    />
                    <TextField source="phone" label="N° de téléphone"/>
                    <TextField source="email" label="Adresse email"/>
                    <TextField source="website" label="Site web"/>
                    <TextField source="url" label="URL"/>
                    <DateField source="createdAt" label="Créé le"/>
                    <DateField source="updatedAt" label="Dernière mise à jour, le"/>
                    <BooleanField source="active" label="Compte activé" textAlign="center"/>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Paramètres">    
                    <TextField source="harelUrl" label="URL de l'API HAREL"/>
                    <TextField source="apiKey" label="Clé API HAREL"/>
                    <TextField source="exchangeApiKey" label="Clé UniRateApi"/>
                    <TextField source="emailParams" label="Serveur d'email SendGrid"/>
                    <TextField source="emailAddressSender" label="Adresse email d'envoi"/>
                    <NumberField source="decimalRound" label="Précision des coûts calculés"/>
                    <TextField source="mainCurrency" label="Devise principale"/>
                    {/* @ts-ignore */}
                    <Typography variant="p" gutterBottom>
                        Eléments de calcul des taxes
                    </Typography>
                    <BooleanField source="hasGlobalTaxes" label="Taxes globales" textAlign="center"/>
                    <BooleanField source="hasCategoryTaxes" label="Taxes par groupe" textAlign="center"/>
                    <FunctionField 
                        source="groupingElement"
                        label="Critère de regroupement"
                        render={record => getGroupingElementName(record) }
                    />
                    <FunctionField 
                        source="repartitionMethod"
                        label="Méthode de répartition des coûts"
                        render={({ repartitionMethod }) => getRepartitionMethodName(repartitionMethod) }
                    />
                    <BooleanField source="hasCoeffApp" label="Coefficient d'approche" textAlign="center"/>
                    <BooleanField source="hasCoeffCalculation" label="Calcul du coefficient" textAlign="center"/>
                    {/* @ts-ignore */}
                    <Typography variant="p" gutterBottom>
                        Edition des données
                    </Typography>
                    <BooleanField source="rateEditable" label="Taux de change modifiable" textAlign="center"/>
                    <BooleanField source="convertedPriceEditable" label="Prix convertis modifiables" textAlign="center"/>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Apparence">
                    <FunctionField source="logo" label="Logo" render={({ logo }) => isDefined(logo) ? <a href={logo} target="_blank" rel="noopener noreferrer">{ getFilename(logo) }</a> : ''}/>
                    <FunctionField 
                        source="color"
                        label="Couleur du Header"
                        render={({ color }) => <span style={{ color }}>{ getColor(color).name }</span> }
                    />
                    {/* @ts-ignore */}
                    <Typography variant="p" gutterBottom>
                        Dénomination des sections et champs
                    </Typography>
                    <TextField source="dateRateName" label="Date définissant le taux de change"/>
                    <TextField source="itemsPartName" label="Section des items"/>
                    <TextField source="taxesPartName" label="Section des taxes"/>
                    <TextField source="coeffCalculationPartName" label="Section du coefficient d'approche"/>
                    <TextField source="costPricesPartName" label="Section des prix de revient"/>
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </Show>
    )
}