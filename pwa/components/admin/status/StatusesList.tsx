import { type NextPage } from "next";
import { Datagrid, List, TextField, CreateButton, ExportButton, TopToolbar, EditButton, SimpleList, BooleanField, FunctionField } from "react-admin";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme, Chip } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { useSessionContext } from "../SessionContextProvider";
import StarIcon from '@mui/icons-material/Star';
import { colors, getColor } from "../../../app/lib/colors";
import { getShipStyle, isDefined } from "../../../app/lib/utils";

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

export const StatusesList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const { session } = useSessionContext();
  const user = session?.user;

  const getChipMode = color => {
    const selectedColor = colors.find(c => c.id === color);
    // @ts-ignore
    return !isDefined(selectedColor) ? null : <Chip label={selectedColor.name} size="small" sx={ getShipStyle({color}) }/>
  };


  return (
    <List resource="statuses" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.label }
              secondaryText={ record => <>{ record.code }{ record.isDefault && <StarIcon className="ml-1 h-[15px] w-[15px] text-amber-400"/> }</> }
              tertiaryText={ record => getChipMode(record.color) }
              linkType={ null }
            /> 
            :
            <Datagrid rowClick={ false } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="Code" sortable={ true }/>
                <TextField source="label" label="Label"/>
                <FunctionField
                  source="color"
                  label="Couleur"
                  render={({color}) => getChipMode(color)}
                />
                <BooleanField source="isDefault" label="Statut par défaut" textAlign="center"/>
                <p className="text-right">
                    { user?.roles?.find(r => r === "admin") && <EditButton /> } 
                </p>
            </Datagrid>
        }
    </List>
  );
}