import { type NextPage } from "next";
import { Datagrid, List, TextField, TopToolbar, SimpleList, ShowButton, FunctionField } from "react-admin";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";


export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

export const ProductsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  // Ne PAS spécifier resource= ici pour que React Admin utilise la ressource du contexte
  // Cela permet au même composant de fonctionner pour harel_products ET odoo_products
  return (
    <List actions={false}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.code }
              secondaryText={ record => record.label}
              linkType="show"
            /> 
            :
            <Datagrid rowClick="show" bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="Code" sortable={ true }/>
                <TextField source="label" label="Label"/>
            </Datagrid>
        }
    </List>
  );
}