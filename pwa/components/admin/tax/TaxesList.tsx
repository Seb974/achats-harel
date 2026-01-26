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
  NumberField
} from "react-admin";
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

export const TaxesList: NextPage<Props> = ({ data, hubURL, page }) => {
  
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const { session } = useSessionContext();
  const user = session?.user;

  return (
    <List resource="taxes" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => `${record.code} - ${record.label}` }
              secondaryText={ record => record.type?.code ?? '' }
              tertiaryText={ record => (record.rate * 100).toFixed(2) + '%' }  
              linkType="show"
            /> 
            :
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="Code" sortable={ true }/>
                <TextField source="label" label="Dénomination" sortable={ true }/>
                <TextField source="type.code" label="Type"/>
                <NumberField source="rate" options={{ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }} label="Taux appliqué"/>
                <p className="text-right">
                    <ShowButton />
                    { user?.roles?.find(r => r === "admin") && <EditButton /> } 
                </p>
            </Datagrid>
        }
    </List>
  );
}