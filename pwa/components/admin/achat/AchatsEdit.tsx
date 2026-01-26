import {  TextInput, NumberInput, Edit, required, SelectInput, useDataProvider, AutocompleteInput, useSourceContext, DateInput, ArrayInput, SimpleFormIterator, FormDataConsumer, useRecordContext, FileInput, TabbedForm, BooleanInput } from "react-admin"; 
import { clientWithCategoryTaxes, clientWithCoeffCalculation, clientWithGlobalTaxes, clientWithTaxes, getFormatedCategoryTax, syncDocuments } from "../../../app/lib/client";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid, isNotBlank } from "../../../app/lib/utils";
import { useSessionContext } from "../SessionContextProvider"
import { useFormContext, useWatch } from "react-hook-form";
import { ItemsAnalyticsForm } from "./ItemsAnalyticsForm";
import { useEffect, useMemo, useRef, useState } from "react";
import CategoryTaxInput from "./CategoryTaxInput";
import { useClient } from "../ClientProvider";
import { Box, Button, Link, Theme, Typography, useMediaQuery } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import GlobalTaxInput from "./GlobalTaxes";

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

const InitGroupingElement = ({ client }) => {
  const record = useRecordContext(); 
  const { setValue } = useFormContext();

  useEffect(() => {
    const groupingElement = record?.groupingElement ?? (client?.groupingElement ?? "CATEGORY");
    requestAnimationFrame(() => {
      setValue("groupingElement", groupingElement, { shouldValidate: false, shouldDirty: false });
    });

  }, [record, setValue, client]);

  return null;
};

const InitCategoryTaxes = ({ backendArrayFieldName = "categoryTaxes" }) => {
  const record = useRecordContext(); 
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!record) return;

    const current = record[backendArrayFieldName];
    if (!current) return;

    const map = {};
    if (Array.isArray(current)) {
      current.forEach((c) => {
        if (c?.categoryId) {
          map[c.categoryId] = {
            totalQty: c.totalQty ?? 0,
            totalHT: c.totalHT ?? 0,
            taxIds: c.taxIds ?? [],
            taxesAmount: c.taxesAmount ?? 0,
            totalTTC: c.totalTTC ?? 0,
            totalRate: c.totalRate ?? 0,
            categoryName: c.categoryName,
          };
        }
      });
    } else {
      Object.assign(map, current);
    }

    requestAnimationFrame(() => {
      setValue("categoryTaxesArray", map, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    });

  }, [record, setValue, backendArrayFieldName]);

  return null;
};

const InitGlobalTaxes = ({ backendFieldName = "globalTaxes" }) => {
  const record = useRecordContext(); 
  const { setValue, getValues } = useFormContext();

  useEffect(() => {
    if (!record) return;

    const current = record[backendFieldName];
    if (!current) return;
  
    requestAnimationFrame(() => {
      const taxIds = current.map(t => t['@id'] ?? t).filter(Boolean);
        setValue("taxes", taxIds, { shouldValidate: false, shouldDirty: false });
    });
    
  }, [record, setValue, backendFieldName, getValues]);

  return null;
};

const TaxesInputs = ({ client, products, allTaxes, globalTaxName, categoryTaxName }) => {
  return (
    <>
      { clientWithCategoryTaxes(client) &&
        <>
          <InitGroupingElement client={client}/>
          <InitCategoryTaxes backendArrayFieldName={categoryTaxName}/>
          <CategoryTaxInput client={client} products={products} allTaxes={allTaxes}/>
        </>
      }
      { clientWithGlobalTaxes(client) &&
        <>
          <InitGlobalTaxes backendFieldName={globalTaxName} />
          <GlobalTaxInput client={client} allTaxes={allTaxes}/>
        </>
      }
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
  const { setValue, getValues } = useFormContext();
  const date = useWatch({ name: "date" });
  const baseCurrency = useWatch({ name: "baseCurrency" });
  const targetCurrency = useWatch({ name: "targetCurrency" });

  const didInit = useRef(false);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!date || !baseCurrency || !targetCurrency) return;

      if (!didInit.current) {
        const existingRate = getValues("exchangeRate");

        if (existingRate !== undefined && existingRate !== null && existingRate !== "") {
          didInit.current = true;
          return;
        }
        didInit.current = true;
      }

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

  return <NumberInput source="exchangeRate" label="Taux de change" readOnly={!(client?.rateEditable ?? false)}/>
};


const TotalInput = ({ client, totalCurrency, setTotalCurrency }) => {
  const { setValue } = useFormContext();
  const items = useWatch({ name: "items" });
  const baseCurrency = useWatch({ name: "baseCurrency" });
  const clientDecimal = client?.decimalRound ?? 3;

  useEffect(() => {
    const total = items?.reduce((sum, current) => sum += (current.quantity ?? 0) * (current.outGoingUnitPriceHT ?? 0), 0) ?? 0;
    const totalIncoming = items?.reduce((sum, current) => sum += (current.quantity ?? 0) * (current.incomingUnitPrice ?? 0), 0) ?? 0;
    setValue("totalHT", parseFloat(total.toFixed(clientDecimal)));
    setTotalCurrency(totalIncoming);
  }, [items]);

  return (
    <NumberInput 
      source="totalHT" 
      label={ `Total HT ${ isDefined(client?.mainCurrency) ? ' en ' + client?.mainCurrency : '' }`} 
      helperText={ baseCurrency ? `${ totalCurrency.toFixed(clientDecimal) } ${ baseCurrency }` : '' }
    />
  );
};

const HarelProductAutocomplete = ({ products }) => {
  const richProducts = products.map(p => ({...p, name: `${p.code} - ${p.label}`}));
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

const StatusInput = ({ statuses }) => {
  const { setValue } = useFormContext();
  const currentStatus = useWatch({ name: "status" });

  useEffect(() => {
    if (currentStatus || !statuses?.length) return;

    const defaultStatus = statuses.find(s => s.isDefault);
    if (defaultStatus) setValue("status", defaultStatus["@id"]);

  }, [statuses, currentStatus, setValue]);

  return <SelectInput source="status.@id" choices={statuses} optionValue="@id" optionText="label" label="Statut"/>
};

const OutgoingPriceInput = ({ exchangeRate, rowValues, targetCurrency, client }) => {
  
  const { setValue } = useFormContext();
  const sourceContext = useSourceContext();
  const [convertedPrice, setConvertedPrice] = useState(0);
  const price = rowValues?.incomingUnitPrice ?? 0;
  const rate = exchangeRate ?? 0;
  const currency = targetCurrency ?? "devise principale";
  const quantity = rowValues?.quantity ?? 0;
  const clientDecimal = client?.decimalRound ?? 3;
  
  // Référence pour tracker si c'est le premier rendu (chargement initial)
  const isInitialMount = useRef(true);
  const previousPrice = useRef(price);
  const previousRate = useRef(rate);

  useEffect(() => {
    // Ne pas recalculer au chargement initial si une valeur existe déjà
    // Recalculer seulement si le prix ou le taux a réellement changé par l'utilisateur
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPrice.current = price;
      previousRate.current = rate;
      // Utiliser la valeur existante pour l'affichage du helper text
      if (rowValues?.outGoingUnitPriceHT) {
        setConvertedPrice(rowValues.outGoingUnitPriceHT);
      } else if (rate > 0) {
        const newConvertedPrice = price / rate;
        setConvertedPrice(newConvertedPrice);
        setValue(sourceContext.getSource('outGoingUnitPriceHT'), parseFloat(newConvertedPrice.toFixed(clientDecimal)));
      }
      return;
    }
    
    // Recalculer seulement si le prix ou le taux a changé après le chargement initial
    if (price !== previousPrice.current || rate !== previousRate.current) {
      previousPrice.current = price;
      previousRate.current = rate;
      if (rate > 0) {
        const newConvertedPrice = price / rate;
        setConvertedPrice(newConvertedPrice);
        setValue(sourceContext.getSource('outGoingUnitPriceHT'), parseFloat(newConvertedPrice.toFixed(clientDecimal)));
      }
    }
  }, [price, rate]);

  return <NumberInput 
            source="outGoingUnitPriceHT" 
            label={`Prix en ${ currency }`} 
            readOnly={ !(client?.convertedPriceEditable ?? false) }
            helperText={ convertedPrice > 0 ? `Total : ${ (quantity * convertedPrice).toFixed(clientDecimal) } ${ currency }` : '' }
        />;
};

const PackagingInput = ({ rowValues, products, groupingElement }) => {
  const { setValue } = useFormContext();
  const sourceContext = useSourceContext();
  const product = rowValues?.productId ?? null;
  const [packagings, setPackagings] = useState([]);

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

      setValue(sourceContext.getSource('mainPackaging'), mainPackaging?.name ?? (productPackagings?.[0]?.name ?? ''));
      setValue(sourceContext.getSource('mainPackagingId'), mainPackaging?.id ?? (productPackagings?.[0]?.id ?? ''));
      setValue(sourceContext.getSource('category'),  groupingCategory?.name ?? '');
      setValue(sourceContext.getSource('categoryId'),  groupingCategory?.id ?? '');
      setValue(sourceContext.getSource('product'), selection?.label ?? '');
      setPackagings(productPackagings);
    }
  }, [product, products]);

  return !isDefinedAndNotVoid(products) ? 
    <TextInput label="Packaging" source="packaging" readOnly/> :
    <SelectInput source="packagingId" label="Packaging" optionText="name" choices={packagings} validate={required()}/>;
}

const IncomingPriceInput = ({ formData, rowValues, client }) => {
  const baseCurrency = formData?.baseCurrency ?? "devise entrante";
  const price = rowValues?.incomingUnitPrice ?? 0;
  const quantity = rowValues?.quantity ?? 0;
  const clientDecimal = client?.decimalRound ?? 3;

  return (
    <NumberInput 
      source="incomingUnitPrice" 
      label={`Prix en ${ baseCurrency }`}
      helperText={ price > 0 ? `Total : ${ (quantity * price).toFixed(clientDecimal) } ${ baseCurrency }` : '' }
    />
  )
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
    <ArrayInput source="otherCosts" label="" defaultValue={ mandatoryCosts.map(c => ({...c, value: 0, currency: client?.mainCurrency ?? ''})) }>
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
                  <NumberInput source="exchangeRate" label="Taux de change" defaultValue={exchangeRate}/>
                  <NumberInput source="amount" label={`Montant ${isDefined(baseCurrency) ? `en ${baseCurrency}` : ''}`} defaultValue={ getDefaultAmount() } helperText={ getConvertedAmountString(scopedFormData) }/>
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

export const AchatsEdit = () => {

  const { client } = useClient();
  const dataProvider = useDataProvider();
  const { session } = useSessionContext();
  const [taxes, setTaxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [recurringCosts, setRecurringCosts] = useState([]);
  const clientDecimal = client?.decimalRound ?? 3;
  const groupingElement = client?.groupingElement ?? "CATEGORY";
  const defaultItem = [{ product: '', quantity: '', incomingUnitPrice: '', outGoingUnitPriceHT: '' }];
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  
  // Détecter si le client utilise Odoo comme source de données
  const isOdoo = client?.dataSource === 'odoo';
  const productResource = isOdoo ? 'odoo_products' : 'harel_products';

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
  }, [productResource]);

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

  const getGlobalTaxes = (taxes, globalTaxesComputed) => {
    if (!globalTaxesComputed) return {};
    const { globalTaxesAmount, globalTotalRate } = globalTaxesComputed;
    return { 
      globalTaxes: taxes, 
      globalTaxesAmount: globalTaxesAmount ?? 0, 
      globalTotalRate: globalTotalRate ?? 0
    };
  };

  const getFormattedData = ({categoryTaxesArray, categoryTaxes, taxes, globalTaxesComputed, ...data}) => {
    const formattedCategoryTaxes = (isDefined(client?.hasCategoryTaxes) && client.hasCategoryTaxes) ? getCategoryTaxes(categoryTaxesArray, categoryTaxes, data) : [];
    const globalTaxes = (isDefined(client?.hasGlobalTaxes) && client.hasGlobalTaxes) ? getGlobalTaxes(taxes, globalTaxesComputed) : (data?.globalTaxes ? { globalTaxes: data?.globalTaxes?.map(t => getFormattedValueForBackEnd(t)) } : {});
    return {
      ... data,
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
    <Edit transform={transform} redirect="list">
          <TabbedForm
            syncWithLocation={false} 
            defaultValues={(record) => ({
                ...record,
                categoryTaxesArray: {}
            })}
          >
            <TabbedForm.Tab label={ client?.itemsPartName ?? "Produits" }>
                { !isSmall ? 
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                      <Box flex={1} display="flex" alignItems="center">
                          <DateInput source="date" defaultValue={ new Date() } label={ client?.dateRateName ?? "Date d'achat" }/>
                      </Box>
                      <Box flex={1}>
                          <DateInput source="deliveryDate" defaultValue={ new Date() } label="Date de livraison"/>
                      </Box>
                  </Box>
                  :
                  <Box flexWrap="nowrap" width="100%" className="mt-4">
                      <DateInput source="date" defaultValue={ new Date() } label={ client?.dateRateName ?? "Date d'achat" }/>
                      <DateInput source="deliveryDate" defaultValue={ new Date() } label="Date de livraison"/>
                  </Box>
                }
                { !isSmall ? 
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                      <Box flex={1} display="flex" alignItems="center">
                          <TextInput source="supplier" label="Fournisseur"/> 
                      </Box>
                      <Box flex={1}>
                          <TextInput source="shipNumber" label="Référence"/>
                      </Box>
                  </Box>
                  :
                  <Box flexWrap="nowrap" width="100%" className="mt-4">
                      <TextInput source="supplier" label="Fournisseur"/> 
                      <TextInput source="shipNumber" label="Référence"/> 
                  </Box>
                }
                { !isSmall ? 
                  <Box display="flex" gap={3} flexWrap="nowrap" width="100%">
                      <Box flex={1} display="flex" alignItems="center">
                          <CurrencySelect currencies={currencies} setCurrencies={setCurrencies}/>
                      </Box>
                      <Box flex={1}>
                          <TextInput source="targetCurrency" label="Devise entrante" defaultValue={ client?.mainCurrency ?? '' } readOnly/>
                      </Box>
                      <Box flex={1}>
                          <ExchangeRateInput client={client}/>
                      </Box>
                  </Box>
                  :
                  <Box flexWrap="nowrap" width="100%" className="mt-4">
                      <CurrencySelect currencies={currencies} setCurrencies={setCurrencies}/>
                      <TextInput source="targetCurrency" label="Devise entrante" defaultValue={ client?.mainCurrency ?? '' } readOnly/>
                      <ExchangeRateInput client={client}/>
                  </Box>
                }
                <ArrayInput source="items" label="" defaultValue={[defaultItem]}>
                  <SimpleFormIterator inline disableAdd={false}>
                    <FormDataConsumer>
                        {({formData, scopedFormData}) =>
                          <>
                            <HarelProductAutocomplete products={products}/>
                            <PackagingInput rowValues={ scopedFormData } products={products} groupingElement={groupingElement}/>
                            <NumberInput source="quantity" label="Quantité" />
                            <IncomingPriceInput formData={formData} rowValues={ scopedFormData } client={client}/>
                            <OutgoingPriceInput exchangeRate={ formData?.exchangeRate ?? 0 } rowValues={ scopedFormData } targetCurrency={ formData?.targetCurrency } client={client}/>
                          </>
                        }
                    </FormDataConsumer>
                  </SimpleFormIterator>
                </ArrayInput>
                <TotalInput client={client} totalCurrency={totalCurrency} setTotalCurrency={setTotalCurrency}/>
                { (!clientWithTaxes(client) && (client?.hasCoeffApp ?? true) && !(client?.hasCoeffCalculation ?? true)) && <NumberInput source="coeffApp" label="Coefficient d'approche" min={1} defaultValue={1}/> }
                <StatusInput statuses={statuses}/>
                <FileInput source="documents" multiple={ true } label="Documents associés">
                    <MyFileField source="contentUrl"/>
                </FileInput>
                <TextInput source="comment" label="Commentaire(s)" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
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
                  <TaxesInputs client={client} products={products} allTaxes={taxes} globalTaxName={"globalTaxes"} categoryTaxName={"categoryTaxes"}/>
              </TabbedForm.Tab>
            }
            { !isSmall && 
              <TabbedForm.Tab label={ client?.costPricesPartName ?? "Prix de revient" }>
                <ItemsAnalyticsForm getPackaging={ getPackaging }/>
              </TabbedForm.Tab>
            }
      </TabbedForm>
    </Edit>
  )
};