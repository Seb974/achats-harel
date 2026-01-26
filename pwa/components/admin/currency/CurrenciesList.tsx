import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  SimpleList,
  ShowButton,
  BooleanField,
  useListContext,
  Form,
  TextInput,
  BooleanInput
} from "react-admin";
import FilterListIcon from '@mui/icons-material/FilterList';
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme, Button, Box } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { useSessionContext } from "../SessionContextProvider";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect, useState } from "react";
import { isNotBlank } from "../../../app/lib/utils";
import ToggleEnabilityButton from "./ToggleEnabilityButton";

export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const CustomListActions = ({ showMore, setShowMore, isSmall}) => {
  
  const { session } = useSessionContext();
  const user = session?.user;
  const { filterValues } = useListContext();
  const params = new URLSearchParams();

  Object.entries(filterValues).forEach(([key, value]) => {
      // @ts-ignore
      if (value && typeof value === 'object' && value.after) {
          // @ts-ignore
          if (value.after) params.append(`${key}[after]`, value.after);
          // @ts-ignore
          if (value.before) params.append(`${key}[before]`, value.before);
      } else if (value != null) {
          // @ts-ignore
          params.append(key, value);
      }
  });

  return (
    <TopToolbar>
      <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
      { user?.roles?.find(r => r === "admin") && <CreateButton/> } 
      <ExportButton/>
    </TopToolbar>
  );
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
      'intitule': filterValues['intitule'] || '',
      inUse: isNotBlank(filterValues?.inUse) && filterValues?.inUse ? true : ''
      
    });

    useEffect(() => {
      handleBooleanChange({target: {name: 'inUse', checked: ''}})
    }, [showMore]);
  
    useEffect(() => {
        setFormValues({
          'intitule': filterValues['intitule'] || '',
          inUse: isNotBlank(filterValues?.inUse) && filterValues?.inUse ? true : ''
          
        });
    }, [filterValues]);
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...formValues, [name]: value };
        setFormValues(newValues);
        setFilters(newValues); 
    };

    const handleBooleanChange = (e) => {
      const { name, checked } = e.target;
      const newValue = isNotBlank(checked) && checked ? true : '';
      const newValues = { ...formValues, [name]: newValue };
      setFormValues(newValues);
      setFilters(newValues); 
  };
  
    return !showMore ? <></> :
        <Form>
            <Box display="flex" flexWrap="wrap" columnGap={isSmall ? 6 : 2} rowGap={0.5} mt={1} alignItems="flex-end">
                <TextInput
                  source="intitule"
                  label="Intitulé"
                  onChange={handleChange}
                  defaultValue={formValues['intitule']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
                <BooleanInput
                    source="inUse"
                    label="Sélectionnable"
                    onChange={handleBooleanChange}
                    //@ts-ignore
                    defaultChecked={ formValues['inUse'] ?? false }
                    sx={{ width: isSmall ? '100%' : 300, marginBottom: '0.5em' }}
                />
            </Box>
        </Form>
};

export const CurrenciesList: NextPage<Props> = ({ data, hubURL, page }) => {
  
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const { session } = useSessionContext();
  const user = session?.user;
  const defaultFilters = {}; 
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <List
      title="Devises"
      resource="currencies" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall} />}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => `${record.code} - ${record.name}` }
              secondaryText={ record => record.country }
              tertiaryText={ record => record.inUse ? <DoneIcon/> : <ClearIcon/> }  
              linkType="show"
            /> 
            :
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="Code" sortable={ true }/>
                <TextField source="name" label="Devise" sortable={ true }/>
                <TextField source="country" label="Pays"/>
                <ToggleEnabilityButton label="Sélectionnable" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    { user?.roles?.find(r => r === "admin") && <EditButton /> } 
                </p>
            </Datagrid>
        }
    </List>
  );
}