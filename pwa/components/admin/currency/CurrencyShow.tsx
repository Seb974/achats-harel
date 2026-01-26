import { Show, SimpleShowLayout, TextField, NumberField, TopToolbar, ListButton, BooleanField } from 'react-admin';

const HarelShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const CurrencyShow = () => (
    <Show actions={<HarelShowActions />}>
        <SimpleShowLayout>
            <TextField source="code" label="Code"/>
            <TextField source="name" label="Devise"/>
            <TextField source="country" label="Pays"/>
            <BooleanField source="inUse" label="Sélectionnable"/>
        </SimpleShowLayout>
    </Show>
)