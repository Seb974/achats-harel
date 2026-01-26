import { Datagrid, List, TextField, SimpleList, BooleanField, FunctionField } from "react-admin";
import { useMediaQuery, Theme } from '@mui/material';

// Helper pour afficher une valeur ou "-" si false/null/undefined
const displayValue = (value: any) => value && value !== false ? value : '-';

export const SuppliersList = () => {
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List actions={false}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              secondaryText={ record => record.city || record.country }
              linkType={false}
            /> 
            :
            <Datagrid bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="name" label="Nom" sortable={true}/>
                <FunctionField source="ref" label="Référence" render={record => displayValue(record?.ref)}/>
                <FunctionField source="email" label="Email" render={record => displayValue(record?.email)}/>
                <FunctionField source="phone" label="Téléphone" render={record => displayValue(record?.phone)}/>
                <TextField source="city" label="Ville"/>
                <TextField source="country" label="Pays"/>
                <FunctionField source="vat" label="TVA" render={record => displayValue(record?.vat)}/>
                <BooleanField source="active" label="Actif"/>
            </Datagrid>
        }
    </List>
  );
}
