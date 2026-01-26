import { SimpleForm, TextInput, Create, required, BooleanInput } from "react-admin";
import ColorPreview from "./ColorPreview";

export const StatusesCreate = () => {

  return (
      <Create redirect="list">
          <SimpleForm>
              <TextInput source="code" label="Code" validate={required()}/>
              <TextInput source="label" label="Label" validate={required()}/>
              <ColorPreview />
              <BooleanInput source="isDefault" label="Statut par défaut" defaultValue={ false }/>
          </SimpleForm>
      </Create>
  )
};