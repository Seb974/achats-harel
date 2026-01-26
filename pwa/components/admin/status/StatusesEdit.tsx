import { SimpleForm, TextInput, Edit, required, TopToolbar, ListButton, BooleanInput } from "react-admin"; 
import ColorPreview from "./ColorPreview";

const ListActions = () => (
  <TopToolbar>
      <ListButton/>
  </TopToolbar>
)


export const StatusesEdit = () => {

  return (
    <Edit redirect="list" actions={ <ListActions/> }>
        <SimpleForm>
          <TextInput source="code" label="Code" validate={required()}/>
          <TextInput source="label" label="Label" validate={required()}/>
          <ColorPreview />
          <BooleanInput source="isDefault" label="Statut par défaut"/>
        </SimpleForm>
    </Edit>
  )
};