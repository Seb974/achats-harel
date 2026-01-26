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

export const CustomFieldsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="harel_products/custom_fields" actions={ false }>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              tertiaryText={ record => record.id}
              linkType={ null }
            /> 
            :
            <Datagrid rowClick={null} bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="id" label="Id"/>
                <TextField source="name" label="Valeur"/>
            </Datagrid>
        }
    </List>
  );
}