import { AutocompleteInput, required, TextInput } from "react-admin";
import { isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useWatch } from "react-hook-form";

const GroupingElementInput = ({ customFields }) => {

    const hasCategoryTaxes = useWatch({ name: "hasCategoryTaxes" });

    const filterProducts = (searchText) => {
        if (!searchText) return customFields;
        return customFields.filter(f => f.name.toLowerCase().includes(searchText.toLowerCase()));
    };

    return !isDefinedAndNotVoid(customFields) ? 
        <TextInput label="Critère de regroupement" source="groupingElement" readOnly/> :
        <AutocompleteInput
            label="Critère de regroupement"
            source="groupingElement"
            validate={hasCategoryTaxes && required()}
            choices={customFields}
            optionText="name"
            optionValue="id"
            filterToQuery={filterProducts}
            readOnly={!hasCategoryTaxes}
        />
}

export default GroupingElementInput;