import { SimpleForm, TextInput, NumberInput, Edit, required, SelectInput, ReferenceInput } from "react-admin"; 
import { getFormattedValueForBackEnd } from "../../../app/lib/utils";

export const TaxesEdit = () => {

  const transform = ({type, ...data}) => ({...data, type: getFormattedValueForBackEnd(type)});

  return (
    <Edit transform={transform} redirect="list">
        <SimpleForm>
          <TextInput source="code" label="Code" validate={required()}/>
          <TextInput source="label" label="Dénomination" validate={required()}/>
          <ReferenceInput reference="tax_types" source="type.@id" >
            <SelectInput label="Type de taxe"/>
          </ReferenceInput>
          <NumberInput source="rate" label="Taux appliqué" validate={required()} parse={v => v / 100} format={v => v * 100}/>
        </SimpleForm>
    </Edit>
  )
};