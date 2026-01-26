import { TextInput, FileInput, FileField, BooleanInput, TabbedForm, useRedirect, useNotify, NumberInput, SelectInput, useDataProvider, ArrayInput, SimpleFormIterator } from "react-admin";
import { Edit } from "react-admin";
import { fileInputSX, uploadImages, sanitizeData, repartitionMethods } from "../../../app/lib/client";
import { Box, useMediaQuery, Theme, Typography } from '@mui/material';
import { ColorPreview } from './ColorPreview';
import { useClient } from '../../admin/ClientProvider';
import { useSessionContext } from "../../admin/SessionContextProvider";
import { useEffect, useState } from "react";
import GroupingElementInput from './GroupingElementInput';
import RepartitionMethodInput from './RepartitionMethodInput';
import OdooConnectionTest from './OdooConnectionTest';

export const ClientsEdit = () => {

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

    const transform = async data => {
        const cachedClient = sessionStorage.getItem("client");
        const previousData = cachedClient ? JSON.parse(cachedClient) : null;

        const sanitizedData = sanitizeData(data, previousData);
        const images = await uploadImages(sanitizedData, session);
        // @ts-ignore
        const updatedClient = { ...sanitizedData, ...Object.fromEntries(images.map(img => [img.name, img.path || null])) };

        return updatedClient;
    };

    const onSubmit = async (data) => {
        const transformedData = await transform(data);

        try {
            const response = await fetch(`${transformedData['@id']}`, {
                method: 'PUT',
                body: JSON.stringify(transformedData),
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour');

            const updatedClient = await response.json();

            updateClient(updatedClient);
            notify('Le client a bien été mis à jour.', { type: 'success' });
            redirect('list', 'clients');
        } catch (error) {
            notify('Erreur : ' + error.message, { type: 'error' });
        }
    };

    return (
        // @ts-ignore
        <div style={{ overflowX: 'auto', width: '100%'}}>
            <Edit>
                <TabbedForm
                    onSubmit={ onSubmit }
                    syncWithLocation={false} 
                    defaultValues={(record) => ({
                        ...record,
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
                        dataSource: record?.dataSource || "harel"
                    })}
                >   
                    <TabbedForm.Tab label="Informations">
                        <TextInput source="name" label="Nom"/>
                        <TextInput source="address" label="Adresse"/>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1} display="flex" alignItems="center">
                                <TextInput source="zipcode" label="Code postal"/>
                            </Box>
                            <Box flex={2}>
                                <TextInput source="city" label="Ville"/>
                            </Box>
                        </Box>
                        <TextInput source="email" label="Adresse email"/>
                        <TextInput source="phone" label="N° de téléphone"/>
                        <TextInput source="website" label="Site web"/>
                        <TextInput source="url" label="URL"/> 
                        <BooleanInput source="active" label="Utilisateur actif" />    
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
                                    <TextInput source="apiKey" label="Clé API HAREL"/>
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
                        <OdooConnectionTest />
                    </Box>

                        <TextInput source="exchangeApiKey" label="Clé UniRateApi" helperText={<a href="https://unirateapi.com" target="_blank">Exchange Rates By UniRateAPI</a>}/>
                        <TextInput source="emailParams" label="Serveur d'email"/>
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
                                <Box display="flex" gap={2} flexWrap="nowrap" width="100%" className="mt-4">
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
                            <Box display="flex" gap={2} flexWrap="nowrap" width="100%" className="mt-4">
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
                        <FileInput label="Logo" source="logo" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                                format={(value) => {
                                if (typeof value === 'string') {
                                    return [{ src: value, title: value.split('/').pop() }];
                                }
                                return value;
                            }}
                        >
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
            </Edit>
        </div>
    )
};