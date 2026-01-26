import { Show, SimpleShowLayout, TextField, NumberField, TopToolbar, ListButton, FunctionField, ArrayField, Datagrid, BooleanField, DateField } from 'react-admin';
import { chipColors } from '../../../app/lib/client';
import { getShipStyle, isDefined } from '../../../app/lib/utils';
import Chip from '@mui/material/Chip';
import { useCustomFields } from '../CustomFieldsProvider';

const HarelShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const ProductShow = () => {

    const { customFields } = useCustomFields();

    const getCustomFieldList = productCustomFields => {
        const fields = Object.entries(productCustomFields)
            .map(([key, value]) => ({key, value}))
            .filter(f => f.value !== "");
        return fields.map(({key, value}, i) => {
            const fieldWithColor = chipColors.find(p => p.id === key);
            const field = customFields?.find(c => c.id == key);
            const fieldName = isDefined(field) ? field.name : '';
            const separator = fieldName.length > 0 ? ' : ' : '';
            const name = `${fieldName}${separator}${value}`;
            // @ts-ignore
            return <Chip key={i} label={name.toUpperCase()} size="small" sx={ getShipStyle(fieldWithColor) }/>
        });
    };

    const getTaxList = taxes => {
        return taxes.map(({ name }, i) => {
            const coloredTax = chipColors.find(p => p.id == i)
            // @ts-ignore
            return <Chip key={i} label={name.toUpperCase()} size="small" sx={ getShipStyle(coloredTax) }/>
        });
    };

    function extractDecimal(text) {
        const match = text.match(/(\d+([.,]\d+)?)/);
        if (!match) return null;

        const number = parseFloat(match[0].replace(',', '.'));
        return number;
    }

    return (
        <Show actions={<HarelShowActions />}>
            <SimpleShowLayout>
                <TextField source="code" label="Code"/>
                <TextField source="label" label="Libellé"/>
                <FunctionField
                    label="Catégorie"
                    source="name"
                    render={(record) =>  record?.category?.name ?? ''}
                />
                <FunctionField
                    source="custom_fields"
                    label="Tags"
                    render={({ custom_fields }) => getCustomFieldList(custom_fields)}
                />
                <ArrayField source="packagings">
                    <Datagrid
                        optimized
                        bulkActionButtons={false}
                        sx={{
                            '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                            '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                        }}
                    >
                        <TextField source="name" label="Packaging"/>
                        <FunctionField
                            source="unit_factor"
                            label="Contenance"
                            render={ record => <>{ `${ record?.unit_factor ?? '' } ${ isDefined(record?.unit_factor) ? (record?.unit === 'unit' ? 'U' : record?.unit) ?? '' : '' }` }</> }
                        />
                        <FunctionField
                            source="unit_factor"
                            label="Poids"
                            render={ record => <>{ `${ record?.poids ?? extractDecimal(record?.name) } Kg` }</> }
                        />  
                        <BooleanField source="sales" label="Article vendu" textAlign="center"/>
                    </Datagrid>
                </ArrayField>
                <FunctionField
                    source="taxes"
                    label="Taxes"
                    render={({ taxes }) => getTaxList(taxes)}
                />
                <DateField 
                    source="updatedAt" 
                    label="Dernière modification" 
                    showTime 
                    options={{
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }}
                    locales="fr-FR"
                />
                <BooleanField source="stockManagement" label="Gestion du stock" textAlign="center"/>
                <NumberField source="availableQuantity" options={{ style: 'decimal' }} label="Quantité disponible"/>
            </SimpleShowLayout>
        </Show>
    )
}