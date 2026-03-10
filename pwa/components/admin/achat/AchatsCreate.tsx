import { TextInput, Create, required, NumberInput, SelectInput, DateInput, ArrayInput, SimpleFormIterator, useDataProvider, AutocompleteInput, FormDataConsumer, useSourceContext, useRecordContext, FileInput, TabbedForm, BooleanInput } from "react-admin";
import { clientWithCategoryTaxes, clientWithCoeffCalculation, clientWithGlobalTaxes, clientWithTaxes, getFormatedCategoryTax, syncDocuments } from "../../../app/lib/client";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid, isNotBlank } from "../../../app/lib/utils";
import { useSessionContext } from "../SessionContextProvider";
import { useFormContext, useWatch } from "react-hook-form";
import CategoryTaxInput from "./CategoryTaxInput";
import { useClient } from "../ClientProvider";
import { Box, Button, Link, Paper, Typography, useMediaQuery, Divider } from "@mui/material";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TuneIcon from '@mui/icons-material/Tune';
import { useEffect, useMemo, useState } from "react";
import GlobalTaxInput from "./GlobalTaxes";
import DeleteIcon from '@mui/icons-material/Delete';
import { ItemsAnalyticsForm } from "./ItemsAnalyticsForm";

const MyFileField = ({ source }) => {
  const record = useRecordContext();
  if (!record) return null;

  const url = record[source];
  const label = record.description || record.title || record.path || "Sans nom";

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" underline="always" sx={{ color: "primary.main", fontSize: "0.85rem" }}>
      {label}
    </Link>
  );
};

const TaxesInputs = ({ client, products, allTaxes }) => {
  return (
    <>
      { clientWithCategoryTaxes(client) && <CategoryTaxInput client={client} products={products} allTaxes={allTaxes}/> }
      { clientWithGlobalTaxes(client) && <GlobalTaxInput client={client} allTaxes={allTaxes}/> }
    </>
  )
};

const CurrencySelect = ({ currencies, setCurrencies }) => {
    const dataProvider = useDataProvider();
    
    useEffect(() => {
        dataProvider.getList('currencies', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'code', order: 'ASC' },
            filter: { inUse: true }
        }).then(({ data }) => setCurrencies(data));
    }, []);

    return <SelectInput source="baseCurrency" label="Devise entrante" optionText="code" optionValue="code" choices={currencies} />;
};

const ExchangeRateInput = ({ client }) => {

  const { session } = useSessionContext();
  const { setValue } = useFormContext();
  const date = useWatch({ name: "date" });
  const baseCurrency = useWatch({ name: "baseCurrency" });
  const targetCurrency = useWatch({ name: "targetCurrency" });

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!date || !baseCurrency || !targetCurrency) return;

      try {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const res = await fetch(`/exchange_rate/${targetCurrency}/${baseCurrency}/${formattedDate}`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json", 
                'Authorization': `Bearer ${session?.accessToken}`
            },
        });

        const data = await res.json();
        setValue("exchangeRate", data.rate);
      } catch (e) {
          console.error("Erreur de récupération des custom_fields", e);
      }
    };

    fetchExchangeRate();
  }, [date, baseCurrency, targetCurrency]);

  const isReadOnly = !(client?.rateEditable ?? false);
  return <NumberInput 
    source="exchangeRate" 
    label="Taux de change" 
    readOnly={isReadOnly}
    sx={ isReadOnly ? { 
      '& .MuiInputBase-root': { backgroundColor: '#f5f5f5' },
      '& .MuiInputBase-input': { fontStyle: 'italic', color: '#757575' }
    } : {}}
  />
};

const TotalInput = ({ client, totalCurrency, setTotalCurrency }) => {
  const { setValue } = useFormContext();
  const items = useWatch({ name: "items" });
  const baseCurrency = useWatch({ name: "baseCurrency" });
  const clientDecimal = client?.decimalRound ?? 2;

  useEffect(() => {
    const total = items?.reduce((sum, current) => sum += (current.quantity ?? 0) * (current.outGoingUnitPriceHT ?? 0), 0) ?? 0;
    const totalIncoming = items?.reduce((sum, current) => sum += (current.quantity ?? 0) * (current.incomingUnitPrice ?? 0), 0) ?? 0;
    setValue("totalHT", parseFloat(total.toFixed(2)));
    setTotalCurrency(totalIncoming);
  }, [items]);

  return (
    <NumberInput 
      source="totalHT" 
      label={ `Total HT ${ isDefined(client?.mainCurrency) ? ' en ' + client?.mainCurrency : '' }`}
      helperText={ baseCurrency ? `${ totalCurrency.toFixed(2) } ${ baseCurrency }` : '' }
      fullWidth
      sx={{ 
        '& .MuiInputBase-input': { 
          fontSize: '1.3rem', 
          fontWeight: 700,
          color: '#1b5e20',
          textAlign: 'right',
        },
        '& .MuiFormHelperText-root': {
          textAlign: 'right',
          fontWeight: 500,
          fontSize: '0.8rem',
        }
      }}
    />
  );
};

const ProductAutocomplete = ({ products }) => {
  const richProducts = products.map(p => ({...p, name: `${p.code || '-'} - ${p.label}`}));
  const filterProducts = (searchText) => {
    if (!searchText) return richProducts;
    return richProducts.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
  };

  return !isDefinedAndNotVoid(products) ? 
    <TextInput label="Produit" source="product" readOnly/> :
    <AutocompleteInput
        label="Produit"
        source="productId"
        validate={required()}
        choices={richProducts}
        optionText="name"
        optionValue="id"
        filterToQuery={filterProducts}
    />
}

const SupplierInput = ({ suppliers, isOdoo }) => {
  // Si Odoo, afficher un autocomplete avec les fournisseurs Odoo
  // Sinon, afficher un champ texte libre
  if (isOdoo && isDefinedAndNotVoid(suppliers)) {
    return (
      <AutocompleteInput
        label="Fournisseur"
        source="supplierId"
        choices={suppliers}
        optionText="name"
        optionValue="id"
        filterToQuery={(searchText) => {
          if (!searchText) return suppliers;
          return suppliers.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()));
        }}
      />
    );
  }
  return <TextInput source="supplier" label="Fournisseur"/>;
}

const StatusInput = ({ statuses }) => {
  const { setValue } = useFormContext();
  const currentStatus = useWatch({ name: "status" });

  useEffect(() => {
    if (currentStatus || !statuses?.length) return;

    const defaultStatus = statuses.find(s => s.isDefault);
    if (defaultStatus) setValue("status", defaultStatus["@id"]);

  }, [statuses, currentStatus, setValue]);

  return <SelectInput source="status" choices={statuses} optionValue="@id" optionText="label" label="Statut"/>
};

const OutgoingPriceInput = ({ exchangeRate, rowValues, targetCurrency, client }) => {
  
  const { setValue } = useFormContext();
  const sourceContext = useSourceContext();
  const [convertedPrice, setConvertedPrice] = useState(0);
  const price = rowValues?.incomingUnitPrice ?? 0;
  const rate = exchangeRate ?? 0;
  const currency = targetCurrency ?? "EUR";
  const quantity = rowValues?.quantity ?? 0;

  useEffect(() => {
    // Éviter division par zéro - si pas de taux, utiliser 1 (pas de conversion)
    const safeRate = rate > 0 ? rate : 1;
    const newConvertedPrice = price / safeRate;
    setConvertedPrice(isFinite(newConvertedPrice) ? newConvertedPrice : 0);
    // Arrondir à 2 décimales pour l'affichage
    const finalPrice = isFinite(newConvertedPrice) ? parseFloat(newConvertedPrice.toFixed(2)) : 0;
    setValue(sourceContext.getSource('outGoingUnitPriceHT'), finalPrice);
  }, [price, rate]);

  const totalDisplay = (quantity * convertedPrice);
  const showTotal = isFinite(totalDisplay) && totalDisplay > 0;

  const isReadOnly = !(client?.convertedPriceEditable ?? false);
  return <NumberInput 
          source="outGoingUnitPriceHT" 
          label={`Prix ${currency}`}
          readOnly={isReadOnly}
          helperText={ showTotal ? `= ${totalDisplay.toFixed(2)} ${currency}` : '' }
          fullWidth
          sx={ isReadOnly ? { 
            '& .MuiInputBase-root': { backgroundColor: '#f5f5f5' },
            '& .MuiInputBase-input': { fontStyle: 'italic', color: '#757575' }
          } : {}}
        />;
};

const PackagingInput = ({ rowValues, products, groupingElement }) => {
  const { setValue } = useFormContext();
  const sourceContext = useSourceContext();
  const product = rowValues?.productId ?? null;
  const packagingId = rowValues?.packagingId ?? null;
  const [packagings, setPackagings] = useState([]);
  const [baseUnitPrice, setBaseUnitPrice] = useState(0);

  // Effet pour initialiser quand le produit change
  useEffect(() => {
    if (isDefined(product) && isDefinedAndNotVoid(products)) {
      const selection = products.find(p => p.id === product);
      const productPackagings = selection?.packagings ?? [];
      const mainPackaging = productPackagings?.find(p => p.unit_factor === 1);

      let groupingCategory = {id: '', name: ''};
      if (groupingElement === "CATEGORY") {
        groupingCategory = selection?.category;
      } else {
        const groupSelection = Object.entries(selection?.custom_fields || {}).find(([code, data]) => parseInt(code) === parseInt(groupingElement));
        // @ts-ignore
        groupingCategory = {id: groupSelection?.[1] ?? '', name: groupSelection?.[1] ?? ''};
      }

      const defaultPackagingId = mainPackaging?.id ?? (productPackagings?.[0]?.id ?? '');
      const defaultPackagingName = mainPackaging?.name ?? (productPackagings?.[0]?.name ?? '');
      
      // Prix d'achat unitaire du produit (unitPrice pour Odoo = standard_price)
      const productPrice = selection?.unitPrice ?? 0;
      setBaseUnitPrice(productPrice);
      
      setValue(sourceContext.getSource('mainPackaging'), defaultPackagingName);
      setValue(sourceContext.getSource('mainPackagingId'), defaultPackagingId);
      setValue(sourceContext.getSource('packagingId'), defaultPackagingId); // Auto-sélectionner le packaging
      setValue(sourceContext.getSource('category'),  groupingCategory?.name ?? '');
      setValue(sourceContext.getSource('categoryId'),  groupingCategory?.id ?? '');
      setValue(sourceContext.getSource('product'), selection?.label ?? '');
      
      // Pré-remplir le prix d'achat (prix unitaire de base)
      if (productPrice > 0) {
        setValue(sourceContext.getSource('incomingUnitPrice'), productPrice);
      }
      
      setPackagings(productPackagings);
    }
  }, [product, products]);

  // Effet pour recalculer le prix quand le packaging change
  useEffect(() => {
    if (isDefined(packagingId) && isDefinedAndNotVoid(packagings) && baseUnitPrice > 0) {
      const selectedPackaging = packagings.find(p => p.id == packagingId);
      if (selectedPackaging) {
        const unitFactor = selectedPackaging.unit_factor ?? 1;
        // Prix = prix unitaire de base × facteur du conditionnement
        const packagingPrice = baseUnitPrice * unitFactor;
        setValue(sourceContext.getSource('incomingUnitPrice'), parseFloat(packagingPrice.toFixed(2)));
      }
    }
  }, [packagingId, packagings, baseUnitPrice]);

  return <SelectInput source="packagingId" label="Packaging" optionText="name" choices={packagings} validate={required()}/>;
}

const IncomingPriceInput = ({ formData, rowValues, client }) => {
  const baseCurrency = formData?.baseCurrency ?? "USD";
  const price = rowValues?.incomingUnitPrice ?? 0;
  const quantity = rowValues?.quantity ?? 0;
  const total = quantity * price;
  const showTotal = isFinite(total) && total > 0;

  return (
    <NumberInput 
      source="incomingUnitPrice" 
      label={`Prix ${baseCurrency}`}
      helperText={ showTotal ? `= ${total.toFixed(2)} ${baseCurrency}` : '' }
      fullWidth
      sx={{
        '& .MuiFormHelperText-root': {
          color: '#2e7d32',
          fontWeight: 500,
          fontSize: '0.75rem',
        }
      }}
    />
  );
};

const RemoveButton = ({ item, items, index }) => {
  const { setValue } = useFormContext();

  const handleRemove = () => {
    const newItems = items.filter((current, i) => parseInt(i) !== parseInt(index));
    setValue("otherCosts", newItems);
  };

  return <Button onClick={() => handleRemove()} disabled={item?.isFix} color="error" startIcon={<DeleteIcon />} size="small" className="my-auto"></Button>
};

const OtherCostsInput = ({ client, recurringCosts }) => {
  const { setValue } = useFormContext();
  const baseCurrency = useWatch({ name: "baseCurrency" });
  const targetCurrency = useWatch({ name: "targetCurrency" });
  const otherCosts = useWatch({ name: "otherCosts" });
  const [availableCurrencies, setAvailableCurrencies] = useState([]);

  const mandatoryCosts = useMemo(() => {
    const costs = isDefinedAndNotVoid(recurringCosts) && client?.hasCoeffCalculation ? recurringCosts : [];
    return costs.map(({name, isFix}) => ({name, isFix, value: 0, currency: client?.mainCurrency ?? ''}))
  }, [recurringCosts, client]);

  useEffect(() => {
    const currencies = [targetCurrency, baseCurrency].filter(c => isNotBlank(c)).map(c => ({code: c}));
    setAvailableCurrencies(currencies ?? []);
  }, [baseCurrency, targetCurrency]);

  useEffect(() => {
    if (isDefinedAndNotVoid(mandatoryCosts) && !isDefinedAndNotVoid(otherCosts))
      setValue("otherCosts", mandatoryCosts);
  }, [mandatoryCosts]);

  return (
    <ArrayInput source="otherCosts" label="" defaultValue={ mandatoryCosts }>
      <SimpleFormIterator inline disableClear disableRemove disableReordering>
        <FormDataConsumer>
          {({formData, scopedFormData}) => {
            const i = formData?.otherCosts?.indexOf(scopedFormData); 
            return (
              <>
                <TextInput source="name" label="Coût" readOnly={scopedFormData?.isFix ?? false} defaultValue={""}/>
                <NumberInput source="value" label="Valeur" defaultValue={0} min={0}/>
                <SelectInput source="currency" label="Devise entrante" optionText="code" optionValue="code" choices={availableCurrencies} validate={required()} defaultValue={targetCurrency}/>
                <BooleanInput source="isFix" label="isFix" defaultValue={false} sx={{display: 'none'}}/>
                <RemoveButton item={scopedFormData} items={formData.otherCosts} index={i}/>
              </>
            );
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  );
};

const CoveringCostsInput = ({ client, isSmall, totalCurrency }) => {
  
  const { setValue } = useFormContext();
  const clientDecimal = client?.decimalRound ?? 3;
  const items = useWatch({ name: "items" });
  const totalHT = useWatch({ name: "totalHT" });
  const exchangeRate = useWatch({ name: "exchangeRate" });
  const coveringCosts = useWatch({ name: "coveringCosts" });
  const baseCurrency = useWatch({ name: "baseCurrency" });
  const targetCurrency = useWatch({ name: "targetCurrency" });

  const baseCurrencyTotal = useMemo(() => {
    const total = isDefinedAndNotVoid(items) ? items.reduce((sum, i) => sum += (i.incomingUnitPrice * i.quantity), 0) : 0;
    return parseFloat(total.toFixed(clientDecimal));
  }, [items, totalHT]);

  const defaultRate = useMemo(() => exchangeRate, [exchangeRate]);

  useEffect(() => {
    const totalCurrency = coveringCosts?.reduce((sum, i) => sum += (i.amount ?? 0), 0) ?? 0;
    const totalConverted = coveringCosts?.reduce((sum, i) => sum += (i.amount ?? 0)/ (i.exchangeRate ?? 1), 0) ?? 0;
    const totalCoveringHT = totalHT - totalConverted;
    setValue("totalCurrency", parseFloat(totalCurrency.toFixed(clientDecimal)));
    setValue("totalConverted", parseFloat(totalConverted.toFixed(clientDecimal)));
    setValue("totalCoveringHT", parseFloat(totalCoveringHT.toFixed(clientDecimal)));

  }, [coveringCosts]);

  const getConvertedAmountString = (data) => {
    if (isDefined(data?.amount) && parseFloat(data?.amount) !== 0 && isDefined(data?.exchangeRate)) {
      const convertedAmount = (parseFloat(data.amount) ?? 0) / (parseFloat(data.exchangeRate) ?? 1);
      return `${ parseFloat(convertedAmount.toFixed(clientDecimal)) } ${ targetCurrency ?? '' }`;
    }
    return '';
  };

  const getDefaultAmount = () => {
    const totalCurrencyBought = coveringCosts?.reduce((sum, i) => sum += i.amount, 0) ?? 0; 
    return Math.max(baseCurrencyTotal - totalCurrencyBought, 0);
  };

  return (
    <>
      <ArrayInput source="coveringCosts" label="" defaultValue={ [{date: new Date(), amount: baseCurrencyTotal, exchangeRate: defaultRate}] }>
        <SimpleFormIterator inline disableClear  disableReordering>
          <FormDataConsumer>
            {({formData, scopedFormData}) => {
              const i = formData?.coveringCosts?.indexOf(scopedFormData);
              return (
                <>
                  <DateInput source="date" defaultValue={ new Date() } label="Date"/>
                  <NumberInput source="exchangeRate" label="Taux de change" defaultValue={exchangeRate} min={0}/>
                  <NumberInput source="amount" label={`Montant ${isDefined(baseCurrency) ? `en ${baseCurrency}` : ''}`} defaultValue={ getDefaultAmount() } helperText={ getConvertedAmountString(scopedFormData) } min={0}/>
                </>
              ); 
            }}
          </FormDataConsumer>
        </SimpleFormIterator>
      </ArrayInput>
      {!isSmall ? 
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
            <Box flex={1}>
                <NumberInput 
                  source="totalCurrency" 
                  label={`Total ${baseCurrency ?? ''}`} 
                  helperText={isDefined(totalCurrency) && totalCurrency > 0 && `Total des achats : ${ parseFloat(totalCurrency.toFixed(clientDecimal)) } ${ baseCurrency ?? '' }`}
                  readOnly
                />
            </Box>
            <Box flex={1}>
                <NumberInput 
                  source="totalConverted" 
                  label={`Total ${targetCurrency ?? ''}`} 
                  helperText={isDefined(totalHT) && totalHT > 0 && `Total des achats : ${ parseFloat(totalHT.toFixed(clientDecimal)) } ${ targetCurrency ?? '' }`}
                  readOnly 
                />
            </Box>
        </Box>
        :
        <Box flexWrap="nowrap" width="100%" className="mt-4">
            <NumberInput 
              source="totalCurrency" 
              label={`Total ${baseCurrency ?? ''}`} 
              helperText={isDefined(totalCurrency) && totalCurrency > 0 && `Total des achats : ${ parseFloat(totalCurrency.toFixed(clientDecimal)) } ${ baseCurrency ?? '' }`}
              readOnly
            />
            <NumberInput 
              source="totalConverted" 
              label={`Total ${targetCurrency ?? ''}`} 
              helperText={isDefined(totalHT) && totalHT > 0 && `Total des achats : ${ parseFloat(totalHT.toFixed(clientDecimal)) } ${ targetCurrency ?? '' }`}
              readOnly 
            />
        </Box>
      }
      <NumberInput source="totalCoveringHT" label={`Gain/perte de change ${targetCurrency}`}/>
    </>
  );
};

const CalculatedCoeffAppInput = ({ client }) => {
  const clientDecimal = client?.decimalRound ?? 3;
  const { setValue } = useFormContext();
  const totalHT = useWatch({ name: "totalHT" });
  const otherCosts = useWatch({ name: "otherCosts" });
  const targetCurrency = useWatch({ name: "targetCurrency" });
  const totalCoveringHT = useWatch({ name: "totalCoveringHT" });
  const coveringExchangeRate = useWatch({ name: "coveringExchangeRate" });

  const totalOtherCosts = useMemo(() => {
    const total = isDefinedAndNotVoid(otherCosts) ? otherCosts.reduce((sum, i) => sum += parseFloat(i?.value ?? 0), 0) : 0;
    return parseFloat(total.toFixed(clientDecimal));
  }, [otherCosts]);

  useEffect(() => {
    const totalOtherCosts = otherCosts?.reduce((sum, c) => sum += c.currency !== targetCurrency ? parseFloat(c.value ?? 0) / parseFloat(coveringExchangeRate ?? 0) : parseFloat(c.value ?? 0), 0) ?? 0;
    const total = (totalOtherCosts ?? 0) - (totalCoveringHT ?? 0);
    const coeff = (total + (totalHT ?? 0))/ (totalHT ?? 1);
    setValue("totalOtherCosts", totalOtherCosts);
    setValue("coeffApp", coeff);
  }, [totalOtherCosts, totalCoveringHT, totalHT]);


  return (
    <Box flexWrap="nowrap" width="100%" className="mt-4">
        <NumberInput source="totalOtherCosts"  label={"Total des autres coûts " + (isDefined(targetCurrency) ? `en ${targetCurrency}` : "")} readOnly/>
        {/* @ts-ignore */}
        <Typography variant="p" gutterBottom>
          Coefficient d'approche
        </Typography>
        <NumberInput source="coeffApp" label="Coefficient d'approche" min={0} defaultValue={1}/>
    </Box>
  );
};

export const AchatsCreate = () => {

  const { client } = useClient();
  const dataProvider = useDataProvider();
  const { session } = useSessionContext();
  const [taxes, setTaxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [recurringCosts, setRecurringCosts] = useState([]);
  const clientDecimal = client?.decimalRound ?? 3;
  const groupingElement = client?.groupingElement ?? "CATEGORY";
  const defaultItem = [{ product: '', quantity: '', incomingUnitPrice: '', outGoingUnitPriceHT: '' }];
  // @ts-ignore
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  
  // Détecter si le client utilise Odoo comme source de données
  const isOdoo = client?.dataSource === 'odoo';
  const productResource = isOdoo ? 'odoo_products' : 'harel_products';
  const supplierResource = 'odoo_suppliers';

  useEffect(() => {
      const fetchAllProducts = async () => {
          try {
              const allProducts = await dataProvider.getAll(productResource);
              setProducts(allProducts ?? []);
          } catch (e) {
              setProducts([]);
              console.error(`Erreur de chargement des produits (${productResource}):`, e);
          }
      };
      const fetchAllSuppliers = async () => {
          // Charger les fournisseurs uniquement si Odoo est activé
          if (!isOdoo) return;
          try {
              const allSuppliers = await dataProvider.getAll(supplierResource);
              setSuppliers(allSuppliers ?? []);
          } catch (e) {
              setSuppliers([]);
              console.error("Erreur de chargement des fournisseurs Odoo:", e);
          }
      };
      const fetchAllStatuses = async () => {
          try {
              const { data } = await dataProvider.getList("statuses", {});
              setStatuses(data ?? []);
          } catch (e) {
              setStatuses([]);
              console.error("Erreur de chargement des statuts:", e);
          }
      };
      const fetchAllTaxes = async () => {
          try {
              const { data } = await dataProvider.getList("taxes", {});
              setTaxes(data ?? []);
          } catch (e) {
              setTaxes([]);
              console.error("Erreur de chargement des taxes:", e);
          }
      };
      const fetchAllRecurringCosts = async () => {
          try {
              const { data } = await dataProvider.getList("recurring_costs", {});
              setRecurringCosts(data ?? []);
          } catch (e) {
              setRecurringCosts([]);
              console.error("Erreur de chargement des coûts récurrents:", e);
          }
      };
      fetchAllTaxes();
      fetchAllStatuses();
      fetchAllRecurringCosts();
      fetchAllProducts();
      fetchAllSuppliers();
  }, [isOdoo, productResource]);

  const getProduct = id => products.find(p => p.id === id);

  const getProductName = productId => {
    const product = getProduct(productId);
    return `${product?.code || ''} ${product?.label || ''}`
  };

  const getSelectedPackaging = (packagingId, packagings) => packagings.find(p => p?.id == packagingId);

  const getPackagings = (productId) => {
    const product = getProduct(productId);
    return product?.packagings ?? [];
  };

  const getMainPackaging = productId => {
    const packagings = getPackagings(productId);
    return packagings.find(p => p?.unit_factor == 1);
  };

  const getPackaging = (productId, packagingId) => {
    const packagings = getPackagings(productId);
    return getSelectedPackaging(packagingId, packagings);
  };

  const getDocuments = async (documents) => { 
    const docs = documents.map(document => {
        return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
    });
    return await syncDocuments(docs, session);
  };

  const getCategoryTaxes = (categoryTaxesArray, existingCategoryTaxes = [], data = null) => {
    const itemCategories = data?.items?.map(i => i?.categoryId) ?? [];
    return Object.entries(categoryTaxesArray || {})
      .filter(([categoryId, catData]) => itemCategories.some(cat => (groupingElement === "CATEGORY" && parseInt(cat) === parseInt(categoryId)) || cat == categoryId ))
      .map(([categoryId, catData]) => {
      const existing = existingCategoryTaxes?.find(c => (groupingElement === "CATEGORY" && parseInt(c.categoryId) === parseInt(categoryId)) || c.categoryId == categoryId) ?? {};
      const formattedCategoryTax = getFormatedCategoryTax(catData);
      return {...existing, ...formattedCategoryTax, categoryId: categoryId?.toString() ?? ''};
    });
  };

  const getGlobalTaxes = ( taxes, globalTaxesComputed ) => {
    if (!globalTaxesComputed) return {};
    const { globalTaxesAmount, globalTotalRate } = globalTaxesComputed;
    return { 
      globalTaxes: taxes, 
      globalTaxesAmount: parseFloat((globalTaxesAmount ?? 0).toFixed(clientDecimal)), 
      globalTotalRate: parseFloat((globalTotalRate ?? 0).toFixed(clientDecimal))
    };
  };

  // Récupérer le nom du fournisseur depuis son ID (pour Odoo)
  const getSupplierName = (supplierId) => {
    if (!supplierId || !isOdoo) return '';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name ?? '';
  };

  const getFormattedData = ({categoryTaxesArray, categoryTaxes, taxes, globalTaxesComputed, supplierId, ...data}) => {
    const formattedCategoryTaxes = (isDefined(client?.hasCategoryTaxes) && client.hasCategoryTaxes) ? getCategoryTaxes(categoryTaxesArray, categoryTaxes, data) : [];
    const globalTaxes = (isDefined(client?.hasGlobalTaxes) && client.hasGlobalTaxes) ? getGlobalTaxes(taxes, globalTaxesComputed) : {};
    
    // Si Odoo, convertir supplierId en supplier (nom)
    const supplierName = isOdoo ? getSupplierName(supplierId) : (data.supplier ?? '');
    
    return {
      ... data,
      supplier: supplierName,
      supplierId: isOdoo ? supplierId : null,
      date: new Date((new Date(data.date)).setHours(12, 0, 0)),
      deliveryDate: new Date((new Date(data.deliveryDate)).setHours(12, 0, 0)),
      totalHT: parseFloat((data.totalHT ?? 0).toFixed(clientDecimal)),
      coeffApp: parseFloat(data.coeffApp ?? 1),
      status: getFormattedValueForBackEnd(data.status),
      items: data.items.map(item => {
        const productName = getProductName(item.productId);
        const packaging = getPackaging(item.productId, item.packagingId);
        const mainPackaging = getMainPackaging(item.productId);
        const totalPriceHT = (item.quantity ?? 0) * (item.outGoingUnitPriceHT ?? 0)
        const mainQuantity = packaging.id === mainPackaging.id ? (item.quantity ?? 0) : (item.quantity ?? 0) * (packaging.unit_factor ?? 0);
        const mainOutGoingUnitPriceHT = packaging.id === mainPackaging.id ? (item.outGoingUnitPriceHT ?? 0) : (item.outGoingUnitPriceHT ?? 0) / (packaging.unit_factor ?? 1);
        return {
          ...item,
          product: productName,
          quantity: item.quantity,
          incomingUnitPrice: item.incomingUnitPrice,
          categoryId: item.categoryId?.toString() ?? '',
          outGoingUnitPriceHT: parseFloat((item.outGoingUnitPriceHT ?? 0).toFixed(clientDecimal)),
          packagingId: packaging?.id,
          packaging: packaging?.name,
          unitFactor: packaging?.unit_factor ?? 1,
          totalPriceHT: parseFloat(totalPriceHT.toFixed(clientDecimal)),
          mainQuantity: parseFloat(mainQuantity.toFixed(clientDecimal)),
          mainOutGoingUnitPriceHT: parseFloat(mainOutGoingUnitPriceHT.toFixed(clientDecimal)),
        }
      }),
      coveringCosts: data.coveringCosts.map(coveringCost => {
        return {
          ...coveringCost,
          date: new Date((new Date(coveringCost.date)).setHours(12, 0, 0)),
          amount: parseFloat((coveringCost.amount ?? 0).toFixed(clientDecimal))
        }
      }),
      groupingElement,
      categoryTaxes: formattedCategoryTaxes,
      ...globalTaxes
    };
  };

  const transform = async ({documents, ...data}) => {
    //@ts-ignore
    const formattedData = getFormattedData(data);
    const documentIds = isDefinedAndNotVoid(documents) ? await getDocuments(documents) : [];
    return {...formattedData, documents: documentIds};
  };

  return (
    <Create transform={transform} redirect="list">
        <TabbedForm
            syncWithLocation={false} 
            defaultValues={(record) => ({
                ...record,
                categoryTaxesArray: {}
            })}
          >
            <TabbedForm.Tab label={ client?.itemsPartName ?? "Produits" }>
              
              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 1: INFORMATIONS COMMANDE
                  ═══════════════════════════════════════════════════════════════════ */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  mb: 3, 
                  border: '1px solid #e0e0e0', 
                  borderLeft: '4px solid #8b4513',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocalShippingIcon sx={{ color: '#8b4513', fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#8b4513" sx={{ letterSpacing: '0.02em' }}>
                    Informations commande
                  </Typography>
                </Box>
                
                { !isSmall ? 
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%" mb={1}>
                    <Box flex={1}>
                      <SupplierInput suppliers={suppliers} isOdoo={isOdoo}/> 
                    </Box>
                    <Box flex={1}>
                      <TextInput source="shipNumber" label="N° Référence / BDC" fullWidth/>
                    </Box>
                  </Box>
                  :
                  <Box width="100%" mb={1}>
                    <SupplierInput suppliers={suppliers} isOdoo={isOdoo}/> 
                    <TextInput source="shipNumber" label="N° Référence / BDC" fullWidth/> 
                  </Box>
                }
                
                { !isSmall ? 
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%" mb={1}>
                    <Box flex={1}>
                      <DateInput source="date" defaultValue={ new Date() } label={ client?.dateRateName ?? "Date commande" } fullWidth/>
                    </Box>
                    <Box flex={1}>
                      <DateInput source="deliveryDate" defaultValue={ new Date() } label="Date livraison prévue" fullWidth/>
                    </Box>
                  </Box>
                  :
                  <Box width="100%" mb={1}>
                    <DateInput source="date" defaultValue={ new Date() } label={ client?.dateRateName ?? "Date commande" }/>
                    <DateInput source="deliveryDate" defaultValue={ new Date() } label="Date livraison prévue"/>
                  </Box>
                }

                { !isSmall ? 
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                    <Box flex={1}>
                      <CurrencySelect currencies={currencies} setCurrencies={setCurrencies}/>
                    </Box>
                    <Box flex={1}>
                      <ExchangeRateInput client={client}/>
                    </Box>
                    <Box flex={1}>
                      <TextInput source="targetCurrency" label="Devise locale" defaultValue={ client?.mainCurrency ?? 'EUR' } readOnly sx={{ '& .MuiInputBase-root': { backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#757575', fontStyle: 'italic' } }}/>
                    </Box>
                  </Box>
                  :
                  <Box width="100%">
                    <CurrencySelect currencies={currencies} setCurrencies={setCurrencies}/>
                    <ExchangeRateInput client={client}/>
                    <TextInput source="targetCurrency" label="Devise locale" defaultValue={ client?.mainCurrency ?? 'EUR' } readOnly sx={{ '& .MuiInputBase-root': { backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#757575', fontStyle: 'italic' } }}/>
                  </Box>
                }
              </Paper>

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 2: PRODUITS COMMANDÉS
                  ═══════════════════════════════════════════════════════════════════ */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  mb: 3, 
                  border: '1px solid #e0e0e0', 
                  borderLeft: '4px solid #2e7d32',
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <InventoryIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
                    <Typography variant="subtitle1" fontWeight={600} color="#2e7d32" sx={{ letterSpacing: '0.02em' }}>
                      Produits commandés
                    </Typography>
                  </Box>
                </Box>

                <ArrayInput source="items" label="" defaultValue={[defaultItem]}>
                  <SimpleFormIterator 
                    inline 
                    disableAdd={false}
                    sx={{
                      '& .RaSimpleFormIterator-line': {
                        borderBottom: '1px solid #e8e8e8',
                        paddingBottom: 1.5,
                        paddingTop: 1,
                        marginBottom: 0,
                        transition: 'background-color 0.15s ease',
                        borderRadius: 1,
                        px: 1,
                        '&:hover': { backgroundColor: '#f0faf0' },
                        '&:nth-of-type(even)': { backgroundColor: '#fafcfa' },
                        '&:nth-of-type(even):hover': { backgroundColor: '#f0faf0' },
                      },
                      '& .RaSimpleFormIterator-form': {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'flex-start',
                      },
                      '& .RaSimpleFormIterator-add button': {
                        marginTop: 2,
                        borderColor: '#2e7d32',
                        color: '#2e7d32',
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 3,
                        '&:hover': { borderColor: '#1b5e20', backgroundColor: '#e8f5e9' }
                      }
                    }}
                  >
                    <FormDataConsumer>
                        {({formData, scopedFormData}) =>
                          <Box 
                            display="flex" 
                            flexWrap="nowrap" 
                            gap={1.5} 
                            alignItems="flex-start" 
                            width="100%"
                            sx={{ 
                              '& .MuiFormControl-root': { marginBottom: 0 }
                            }}
                          >
                            {/* Produit: 30% */}
                            <Box sx={{ flex: '3 1 0', minWidth: 120 }}>
                              <ProductAutocomplete products={products}/>
                            </Box>
                            {/* Packaging: 15% */}
                            <Box sx={{ flex: '1.5 1 0', minWidth: 80 }}>
                              <PackagingInput rowValues={ scopedFormData } products={products} groupingElement={groupingElement}/>
                            </Box>
                            {/* Qté: 10% */}
                            <Box sx={{ flex: '1 1 0', minWidth: 60 }}>
                              <NumberInput source="quantity" label="Qté" fullWidth/>
                            </Box>
                            {/* Prix USD: 15% */}
                            <Box sx={{ flex: '1.5 1 0', minWidth: 90 }}>
                              <IncomingPriceInput formData={formData} client={client} rowValues={ scopedFormData }/>
                            </Box>
                            {/* Prix EUR: 15% */}
                            <Box sx={{ flex: '1.5 1 0', minWidth: 90 }}>
                              <OutgoingPriceInput exchangeRate={ formData?.exchangeRate ?? 0 } rowValues={ scopedFormData } targetCurrency={ formData?.targetCurrency } client={client}/>
                            </Box>
                          </Box>
                        }
                    </FormDataConsumer>
                  </SimpleFormIterator>
                </ArrayInput>

                <Divider sx={{ my: 2 }} />
                
                <Box 
                  display="flex" 
                  justifyContent="flex-end" 
                  alignItems="center"
                  sx={{ 
                    background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
                    p: 2.5, 
                    borderRadius: 1.5,
                    border: '1px solid #c8e6c9',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                  }}
                >
                  <TotalInput client={client} totalCurrency={totalCurrency} setTotalCurrency={setTotalCurrency}/>
                </Box>
              </Paper>

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 3: STATUT & OPTIONS
                  ═══════════════════════════════════════════════════════════════════ */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  mb: 3, 
                  border: '1px solid #e0e0e0', 
                  borderLeft: '4px solid #6d4c9e',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TuneIcon sx={{ color: '#6d4c9e', fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#6d4c9e" sx={{ letterSpacing: '0.02em' }}>
                    Statut & Options
                  </Typography>
                </Box>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="flex-start">
                  <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                    <StatusInput statuses={statuses}/>
                  </Box>
                  { (!clientWithTaxes(client) && (client?.hasCoeffApp ?? true) && !(client?.hasCoeffCalculation ?? true)) && 
                    <Box sx={{ minWidth: 150, flex: '0 1 150px' }}>
                      <NumberInput source="coeffApp" label="Coeff. approche" min={1} defaultValue={1}/>
                    </Box>
                  }
                </Box>
              </Paper>

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 4: DOCUMENTS & COMMENTAIRES
                  ═══════════════════════════════════════════════════════════════════ */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  border: '1px solid #e0e0e0', 
                  borderLeft: '4px solid #1976d2',
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AttachFileIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#1976d2" sx={{ letterSpacing: '0.02em' }}>
                    Documents & Commentaires
                  </Typography>
                </Box>

                <FileInput 
                  source="documents" 
                  multiple={ true } 
                  label=""
                  placeholder={
                    <Box 
                      sx={{ 
                        border: '2px dashed #bbdefb', 
                        borderRadius: 2, 
                        p: 3, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#fafcff',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          borderColor: '#1976d2', 
                          backgroundColor: '#e3f2fd',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 6px rgba(25,118,210,0.12)'
                        }
                      }}
                    >
                      <AttachFileIcon sx={{ color: '#90caf9', fontSize: 28, mb: 0.5 }} />
                      <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                        Glissez vos fichiers ici ou cliquez pour sélectionner
                      </Typography>
                    </Box>
                  }
                >
                  <MyFileField source="contentUrl"/>
                </FileInput>

                <TextInput 
                  source="comment" 
                  label="Commentaires / Notes" 
                  multiline 
                  fullWidth
                  sx={{ 
                    mt: 2,
                    '& .MuiInputBase-inputMultiline': { minHeight: '80px' } 
                  }}
                />
              </Paper>
            </TabbedForm.Tab>
            { clientWithCoeffCalculation(client) &&
              <TabbedForm.Tab label={ client?.coeffCalculationPartName ?? "Coûts d'approche" }>
                {/* @ts-ignore */}
                <Typography variant="p" gutterBottom>
                  Taux de couverture
                </Typography>
                <CoveringCostsInput client={client} isSmall={isSmall} totalCurrency={totalCurrency}/>
                {/* @ts-ignore */}
                <Typography variant="p" gutterBottom>
                  Autres coûts
                </Typography>
                <OtherCostsInput client={client} recurringCosts={recurringCosts}/>
                <CalculatedCoeffAppInput client={client}/>
              </TabbedForm.Tab>
            }
            { clientWithTaxes(client) &&
              <TabbedForm.Tab label={ client?.taxesPartName ?? "Autres coûts" } sx={ !clientWithTaxes(client) ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                  { ((client?.hasCoeffApp ?? true) && !(client?.hasCoeffCalculation ?? true)) && <NumberInput source="coeffApp" label="Coefficient d'approche" min={1} defaultValue={1}/> }
                  <TaxesInputs client={client} products={products} allTaxes={taxes}/>
              </TabbedForm.Tab>
            }
            { !isSmall && 
              <TabbedForm.Tab label={ client?.costPricesPartName ?? "Prix de revient" }>
                <ItemsAnalyticsForm getPackaging={ getPackaging }/>
              </TabbedForm.Tab>
            }
        </TabbedForm>
    </Create>
  )
};