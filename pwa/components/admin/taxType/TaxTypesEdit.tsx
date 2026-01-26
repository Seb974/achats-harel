import { SimpleForm, TextInput, Edit, required, TopToolbar, ListButton } from "react-admin"; 

const ListActions = () => (
  <TopToolbar>
      <ListButton/>
  </TopToolbar>
)


export const TaxTypesEdit = () => {

  return (
    <Edit redirect="list" actions={ <ListActions/> }>
        <SimpleForm>
          <TextInput source="code" label="Code" validate={required()}/>
          <TextInput source="label" label="Label" validate={required()}/>
        </SimpleForm>
    </Edit>
  )
};