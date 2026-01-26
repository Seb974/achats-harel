import { SimpleForm, TextInput, Create, required } from "react-admin";

export const TaxTypesCreate = () => {

  return (
      <Create redirect="list">
          <SimpleForm>
              <TextInput source="code" label="Code" validate={required()}/>
              <TextInput source="label" label="Label" validate={required()}/>
          </SimpleForm>
      </Create>
  )
};