import { SimpleForm, TextInput, Create, required, NumberInput, SelectInput, ReferenceInput } from "react-admin";

export const TaxesCreate = () => {

  return (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="code" label="Code" validate={required()}/>
            <TextInput source="label" label="Dénomination" validate={required()}/>
            <ReferenceInput reference="tax_types" source="type" >
              <SelectInput label="Type de taxe"/>
            </ReferenceInput>
            <NumberInput source="rate" label="Taux appliqué" validate={required()} parse={v => v / 100} format={v => v * 100}/> 
        </SimpleForm>
    </Create>
  )
};