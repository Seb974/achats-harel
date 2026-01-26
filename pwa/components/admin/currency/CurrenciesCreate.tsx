import { SimpleForm, TextInput, Create, required, BooleanInput } from "react-admin";

export const CurrenciesCreate = () => {

  return (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="code" label="Code" validate={required()} helperText={<a href="https://fr.wikipedia.org/wiki/ISO_4217" target="_blank">Code ISO 4217 de la devise</a>}/>
            <TextInput source="name" label="Devise" validate={required()}/>
            <TextInput source="country" label="Pays" validate={required()}/>
            <BooleanInput source="inUse" label="Sélectionnable" defaultValue={ false }/>
        </SimpleForm>
    </Create>
  )
};