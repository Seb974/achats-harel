import { SimpleForm, TextInput, Edit, required, TopToolbar, ListButton, BooleanInput } from "react-admin"; 

const ListActions = () => (
  <TopToolbar>
      <ListButton/>
  </TopToolbar>
)


export const RecurringCostsEdit = () => {

  return (
    <Edit redirect="list" actions={ <ListActions/> }>
        <SimpleForm>
          <TextInput source="name" label="Nom" validate={required()}/>
          <BooleanInput source="isFix" label="Obligatoire" defaultValue={false}/>
        </SimpleForm>
    </Edit>
  )
};