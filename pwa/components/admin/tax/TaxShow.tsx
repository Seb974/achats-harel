import { Show, SimpleShowLayout, TextField, NumberField, TopToolbar, ListButton } from 'react-admin';

const HarelShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const TaxShow = () => (
    <Show actions={<HarelShowActions />}>
        <SimpleShowLayout>
            <TextField source="code" label="Code" sortable={ true }/>
            <TextField source="label" label="Dénomination" sortable={ true }/>
            <TextField source="type.code" label="Type"/>
            <NumberField source="rate" options={{ style: 'percent' }} label="Taux appliqué"/>
        </SimpleShowLayout>
    </Show>
)