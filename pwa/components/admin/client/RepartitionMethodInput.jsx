import { required, SelectInput, TextInput } from "react-admin";
import { isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useWatch } from "react-hook-form";

const RepartitionMethodInput = ({ repartitionMethods }) => {

    const hasGlobalTaxes = useWatch({ name: "hasGlobalTaxes" });
    const hasCategoryTaxes = useWatch({ name: "hasCategoryTaxes" });


    return !isDefinedAndNotVoid(repartitionMethods) ? 
        <TextInput label="Méthode de répartition des coûts" source="repartitionMethod" readOnly/> :
        <SelectInput
            source="repartitionMethod" 
            choices={ repartitionMethods } 
            label="Méthode de répartition des coûts"
            validate={(hasCategoryTaxes || hasGlobalTaxes) && required()}
            readOnly={!hasCategoryTaxes && !hasGlobalTaxes}
        />
}

export default RepartitionMethodInput;