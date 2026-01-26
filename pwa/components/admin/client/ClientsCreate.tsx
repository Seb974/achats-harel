import { TextInput, FileInput, FileField, BooleanInput, TabbedForm, required, useRedirect, useNotify, NumberInput, SelectInput, useDataProvider } from "react-admin";
import { Create } from "react-admin";
import { colors, objectToFormData, fileInputSX, sanitizeData, repartitionMethods } from "../../../app/lib/client";
import { Box, Theme, Typography, useMediaQuery } from '@mui/material';
import { ColorPreview } from './ColorPreview';
import { useClient } from '../../admin/ClientProvider';
import { useSessionContext } from "../../admin/SessionContextProvider";
import { useEffect, useState } from "react";
import GroupingElementInput from "./GroupingElementInput";
import RepartitionMethodInput from "./RepartitionMethodInput";

export const ClientsCreate = () => {

    const notify = useNotify();
    const redirect = useRedirect();
    const { updateClient } = useClient();
    const dataProvider = useDataProvider();
    const { session } = useSessionContext();
    const [customFields, setCustomFields] = useState([]);
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

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

    const onSubmit = async data => {
        const sanitizedData = sanitizeData(data);
        const formData = objectToFormData(sanitizedData);
        try {
            // @ts-ignore
            const response = await fetch('/clients', { method: 'POST', body: formData, headers: {'Authorization': `Bearer ${session?.accessToken}`}});
        
            if (!response.ok) throw new Error('Erreur lors de l’envoi');

            const newClient = await response.json();

            updateClient(newClient);
            notify('Le client a bien été enregistré.', { type: 'success' });
            redirect('list', 'clients');
          } catch (error) {
            notify('Erreur : ' + error.message, { type: 'error' });
          }
    };

    return (
        <Create redirect="list">
            <TabbedForm 
                onSubmit={ onSubmit }
                defaultValues={(record) => ({
                    active: true,
                    color: colors[0].id,
                    hasCategoryTaxes: false,
                    hasGlobalTaxes: false,
                    hasCoeffApp: false, 
                    rateEditable: false, 
                    convertedPriceEditable: false,
                    dateRateName: "Date",
                    itemsPartName: "Produits",
                    taxesPartName: "Autres coûts",
                    costPricesPartName: "Prix de revient",
                    coeffCalculationPartName: 'Coûts d\'approche',
                    groupingElement: "CATEGORY",
                    dataSource: "harel"
                })}
            >
                <TabbedForm.Tab label="Informations">
                    <TextInput source="name" label="Nom" validate={required()}/>
                    <TextInput source="address" label="Adresse" validate={required()}/>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1} display="flex" alignItems="center">
                            <TextInput source="zipcode" label="Code postal" validate={required()}/>
                        </Box>
                        <Box flex={2}>
                            <TextInput source="city" label="Ville" validate={required()}/>
                        </Box>
                    </Box>
                    <TextInput source="email" label="Adresse email" validate={required()}/>
                    <TextInput source="phone" label="N° de téléphone" validate={required()}/>
                    <TextInput source="website" label="Site web"/>
                    <TextInput source="url" label="URL"/>
                    <BooleanInput source="active" label="Utilisateur actif"/>
                </TabbedForm.Tab>
                <TabbedForm.Tab label="Paramètres">
                    {/* Sélection de la source de données */}
                    <Box className="mb-4" width="100%">
                        {/* @ts-ignore */}
                        <Typography variant="p" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            Source des données produits
                        </Typography>
                        <SelectInput 
                            source="dataSource" 
                            label="Source de données" 
                            choices={[
                                { id: 'harel', name: 'HAREL' },
                                { id: 'odoo', name: 'Odoo' },
                            ]}
                            defaultValue="harel"
                            helperText="Choisissez la source des produits et fournisseurs"
                        />
                    </Box>

                    {/* Configuration HAREL */}
                    <Box className="mb-4" width="100%">
                        {/* @ts-ignore */}
                        <Typography variant="p" gutterBottom>
                            Configuration HAREL
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={2} display="flex" alignItems="center">
                                <TextInput source="harelUrl" label="URL de l'API HAREL"/>
                            </Box>
                            <Box flex={1}>
                                <TextInput source="harelApiKey" label="Clé API HAREL"/>
                            </Box>
                        </Box>
                    </Box>

                    {/* Configuration ODOO */}
                    <Box className="mb-4" width="100%">
                        {/* @ts-ignore */}
                        <Typography variant="p" gutterBottom>
                            Configuration Odoo
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={2}>
                                <TextInput source="odooUrl" label="URL Odoo" helperText="Ex: https://votre-instance.odoo.com"/>
                            </Box>
                            <Box flex={1}>
                                <TextInput source="odooDatabase" label="Base de données" helperText="Nom de la base Odoo"/>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <TextInput source="odooUsername" label="Utilisateur Odoo" helperText="Email ou login de l'utilisateur"/>
                            </Box>
                            <Box flex={1}>
                                <TextInput source="odooApiKey" label="Clé API Odoo" type="password" helperText="Clé API ou mot de passe"/>
                            </Box>
                        </Box>
                    </Box>

                    <TextInput source="exchangeRateApiKey" label="Clé UniRateApi" helperText={<a href="https://unirateapi.com" target="_blank">Exchange Rates By UniRateAPI</a>}/>
                    <TextInput source="emailServer" label="Serveur d'email"/>
                    <TextInput source="emailAddressSender" label="Adresse email d'envoi"/>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1} display="flex" alignItems="center">
                            <NumberInput source="decimalRound" label="Précision des coûts calculés" min={ 0 } max={ 9 } defaultValue={ 3 } helperText={"Nombre de chiffre après la virgule."}/>
                        </Box>
                        <Box flex={1}>
                            <TextInput source="mainCurrency" label="Devise principale" helperText={<>Saisir le <a href="https://fr.wikipedia.org/wiki/ISO_4217" target="_blank">code ISO 4217</a> de la devise</>}/>
                        </Box>
                    </Box>
                    <Box className="mt-2" width="100%">
                            {/* @ts-ignore */}
                            <Typography variant="p" gutterBottom>
                                Eléments de calcul des taxes
                            </Typography>
                            { !isSmall ? 
                            
                                <Box display="flex" gap={1} flexWrap="nowrap" width="100%" className="mt-4">
                                    <Box flex={1}>
                                        <BooleanInput source="hasGlobalTaxes" label="Taxes globales"/>
                                    </Box>
                                    <Box flex={1} display="flex" alignItems="center">
                                        <BooleanInput source="hasCategoryTaxes" label="Taxes par groupe"/>
                                    </Box>
                                </Box> 
                                :
                                <Box flexWrap="nowrap" width="100%" className="mt-4">
                                    <BooleanInput source="hasGlobalTaxes" label="Taxes globales"/>
                                    <BooleanInput source="hasCategoryTaxes" label="Taxes par groupe"/>
                                </Box>
                            }
                        </Box>
                        <GroupingElementInput customFields={customFields}/>
                        <RepartitionMethodInput repartitionMethods={ repartitionMethods }/>
                        { !isSmall ? 
                            <Box display="flex" gap={1} flexWrap="nowrap" width="100%" className="mt-4">
                                    <Box flex={1}>
                                    <BooleanInput source="hasCoeffApp" label="Coefficient d'approche"/>
                                </Box>
                                <Box flex={1} display="flex" alignItems="center">
                                    <BooleanInput source="hasCoeffCalculation" label="Calcul du coefficient"/>
                                </Box>
                            </Box> 
                            :
                            <Box flexWrap="nowrap" width="100%" className="mt-4">
                                <BooleanInput source="hasCoeffApp" label="Coefficient d'approche"/>
                                <BooleanInput source="hasCoeffCalculation" label="Calcul du coefficient"/>
                            </Box>
                        }
                        <Box className="mt-2" width="100%">
                            {/* @ts-ignore */}
                            <Typography variant="p" gutterBottom>
                                Edition des données
                            </Typography>
                            { !isSmall ? 
                                <Box display="flex" gap={2} flexWrap="nowrap" width="100%" className="mt-4">
                                    <Box flex={1} display="flex" alignItems="center">
                                        <BooleanInput source="rateEditable" label="Taux de change modifiable"/>
                                    </Box>
                                    <Box flex={1}>
                                        <BooleanInput source="convertedPriceEditable" label="Prix convertis modifiables"/>
                                    </Box>
                                </Box> 
                                :
                                <Box flexWrap="nowrap" width="100%" className="mt-4">
                                    <BooleanInput source="rateEditable" label="Taux de change modifiable"/>
                                    <BooleanInput source="convertedPriceEditable" label="Prix convertis modifiables"/>
                                </Box>
                            }
                        </Box>
                </TabbedForm.Tab>
                <TabbedForm.Tab label="Apparence">
                    <FileInput label="Logo" source="logo" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                        <FileField source="src" title="title" />
                    </FileInput> 
                    <ColorPreview/>
                    <Box className="mt-2" width="100%">
                        {/* @ts-ignore */}
                        <Typography variant="p" gutterBottom>
                            Dénomination des sections et champs
                        </Typography>
                        <TextInput source="dateRateName" label="Champ date" helperText="Nom de la date définissant le taux de change"/>
                        <TextInput source="itemsPartName" label="Section des items"/>
                        <TextInput source="taxesPartName" label="Section des taxes"/>
                        <TextInput source="coeffCalculationPartName" label="Section du coefficient d'approche"/>
                        <TextInput source="costPricesPartName" label="Section des prix de revient"/>
                    </Box>
                </TabbedForm.Tab>
            </TabbedForm>
        </Create>
    )
};