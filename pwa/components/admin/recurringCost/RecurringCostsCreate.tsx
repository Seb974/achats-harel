import { SimpleForm, TextInput, Create, required, BooleanInput } from "react-admin";

export const RecurringCostsCreate = () => {

  return (
      <Create redirect="list">
          <SimpleForm>
              <TextInput source="name" label="Nom" validate={required()}/>
              <BooleanInput source="isFix" label="Obligatoire" defaultValue={false}/>
          </SimpleForm>
      </Create>
  )
};