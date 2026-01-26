import { type NextPage } from "next";
import { Datagrid, List, TextField, CreateButton, ExportButton, TopToolbar, EditButton, SimpleList } from "react-admin";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { useSessionContext } from "../SessionContextProvider";

export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => {
  const { session } = useSessionContext();
  const user = session?.user;
  return (
    <TopToolbar>
        { user?.roles?.find(r => r === "admin") && <CreateButton/> } 
        <ExportButton/>
    </TopToolbar>
  )
};

export const TaxTypesList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const { session } = useSessionContext();
  const user = session?.user;

  return (
    <List resource="tax_types" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.label }
              tertiaryText={ record => record.code }
              linkType={ null }
            /> 
            :
            <Datagrid rowClick={ false } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="Code" sortable={ true }/>
                <TextField source="label" label="Label"/>
                <p className="text-right">
                    { user?.roles?.find(r => r === "admin") && <EditButton /> } 
                </p>
            </Datagrid>
        }
    </List>
  );
}