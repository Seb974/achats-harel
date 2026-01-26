import { type NextPage } from "next";
import { Datagrid, List, TextField, CreateButton, ExportButton, TopToolbar, EditButton, SimpleList, BooleanField } from "react-admin";
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

export const RecurringCostsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const { session } = useSessionContext();
  const user = session?.user;

  return (
    <List resource="recurring_costs" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              tertiaryText={ record => record.isFix && "Obligatoire" }
              linkType={ null }
            /> 
            :
            <Datagrid rowClick={ false } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="name" label="Nom" sortable={ true }/>
                <BooleanField source="isFix" label="Obligatoire" textAlign="center"/>
                <p className="text-right">
                    { user?.roles?.find(r => r === "admin") && <EditButton /> } 
                </p>
            </Datagrid>
        }
    </List>
  );
}