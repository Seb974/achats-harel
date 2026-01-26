import { Datagrid, List, TextField, CreateButton, ExportButton, TopToolbar, EditButton, SimpleList, ShowButton, NumberField, DateField, ArrayField, FunctionField, useListContext, Form, TextInput, DateInput } from "react-admin";
import { formatNumber, getShipStyle, isDefined, toLocalDateString } from "../../../app/lib/utils";
import { type PagedCollection } from "../../../types/collection";
import { useSessionContext } from "../SessionContextProvider";
import { useMediaQuery, Theme, Chip, Button, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { type Contact } from "../../../types/Contact";
import { colors } from "../../../app/lib/colors";
import { type NextPage } from "next";
import { useEffect, useState } from "react";

export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = ({ showMore, setShowMore, isSmall }) => {
  const { session } = useSessionContext();
  const user = session?.user;
  return (
    <TopToolbar>
        <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
        { user?.roles?.find(r => r === "admin") && <CreateButton/> } 
        <ExportButton/>
    </TopToolbar>
  )
};

const CustomFilterButton = ({ showMore, setShowMore, isSmall }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => setShowMore(!showMore)}
      startIcon={<FilterListIcon className={`${isSmall && 'mb-3'}`}/>}
    >
      {!isSmall && 'FILTRER'}
    </Button>
  );
};

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
        'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
        'supplier': filterValues['supplier'] || '',
        'status': filterValues['status'] || '',
    });

    useEffect(() => {
        setFormValues({
            'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
            'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
            'supplier': filterValues['supplier'] || '',
            'status': filterValues['status'] || '',
        });
    }, [filterValues]);
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...formValues, [name]: value };
        setFormValues(newValues);
        setFilters(newValues); 
    };
  
    return !showMore ? <></> :
      <Form>
          <Box display="flex" flexWrap="wrap" columnGap={isSmall ? 6 : 2} rowGap={0.5} mt={1} alignItems="flex-end">
              <TextInput
                  source="supplier"
                  label="Fournisseur"
                  onChange={handleChange}
                  defaultValue={formValues['supplier']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <TextInput
                  source="status"
                  label="Statut"
                  onChange={handleChange}
                  defaultValue={formValues['status']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <DateInput
                  source="date[after]"
                  label="Date Min"
                  onChange={handleChange}
                  defaultValue={formValues['date[after]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <DateInput
                  source="date[before]"
                  label="Date Max"
                  onChange={handleChange}
                  defaultValue={formValues['date[before]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
          </Box>
      </Form>
};


const ItemsExpansion = () => {

  return (
    <ArrayField source="items">
      <Datagrid isRowSelectable={record => false} rowClick={false} bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }} className="text-xs italic">
        <TextField source="product" label="Produit"/>
        <TextField source="packaging" label="Packaging"/>
        <NumberField source="quantity" label="Quantité" />
        <FunctionField
          source="outGoingUnitPriceHT"
          label="Prix U HT"
          render={({outGoingUnitPriceHT, targetCurrency}) => `${ outGoingUnitPriceHT ? formatNumber(outGoingUnitPriceHT) : '' } ${ outGoingUnitPriceHT && targetCurrency ? targetCurrency : '' }`}
        />
        <FunctionField
          source="totalPriceHT"
          label="Prix U HT"
          render={({totalPriceHT, targetCurrency}) => `${ totalPriceHT ? formatNumber(totalPriceHT) : '' } ${ totalPriceHT && targetCurrency ? targetCurrency : '' }`}
        />
      </Datagrid>
    </ArrayField>
  );
};

export const AchatsList: NextPage<Props> = ({ data, hubURL, page }) => {
  
  const defaultFilters = {};
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const getChipMode = status => {
    const selectedColor = colors.find(c => c.id === (status?.color ?? '#9ca3af'));
    // @ts-ignore
    return !isDefined(selectedColor) || !isDefined(status?.label) ? (status?.label ?? '') : <Chip label={status.label} size="small" sx={ getShipStyle({color: selectedColor.id}) }/>
  };

  return (
    <List 
      resource="achats" 
      actions={<ListActions isSmall={isSmall} showMore={showMore} setShowMore={setShowMore}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.supplier  }
              secondaryText={ record => <><span className="text-xs text-gray-500">{ `Le ${(new Date(record.date)).toLocaleDateString()} - ` }</span>{ `${ (record.totalHT ?? 0).toFixed(2) + (record.targetCurrency ?? '') }`}</>}  
              tertiaryText={ record => <><span className="ml-1">{ getChipMode(record.status) }</span></>}
              linkType="show"
            /> 
            :
            <Datagrid expand={<ItemsExpansion/>} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date d'achat" sortable={false} />
                <TextField source="supplier" label="Fournisseur" sortable={ false }/>
                <FunctionField
                  source="totalHT"
                  label="Total HT"
                  render={({totalHT, targetCurrency}) => `${ totalHT ? formatNumber(totalHT) : '' } ${ totalHT && targetCurrency ? targetCurrency : '' }`}
                />
                <DateField source="deliveryDate" sortable={false} label="Livraison"/>
                <FunctionField
                  source="status"
                  label="Statut"
                  render={({status}) => getChipMode(status)}
                />
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}