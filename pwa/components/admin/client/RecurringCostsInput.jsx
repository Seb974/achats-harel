import { useEffect } from "react";
import { ArrayInput, BooleanInput, SimpleFormIterator, TextInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

const RecurringCostsInput = () => {

    const { setValue } = useFormContext();
    const recurringCosts = useWatch({ name: "recurringCosts" });
    const hasCoeffCalculation = useWatch({ name: "hasCoeffCalculation" });

    useEffect(() => {
        if (!hasCoeffCalculation) {
            setValue("recurringCosts", []);
        } else {
            if (recurringCosts.length <= 0)
                setValue("recurringCosts", [{name: "", isFix: true}]);
        }
    }, [hasCoeffCalculation, setValue])

    return (
        <ArrayInput source="recurringCosts" label="Coûts récurrents">
            <SimpleFormIterator inline disableClear disableReordering disabled={!hasCoeffCalculation}>
                <TextInput source="name" label="Nom" defaultValue={""} disabled={!hasCoeffCalculation}/>
                <BooleanInput source="isFix" label="Obligatoire" defaultValue={true} disabled={!hasCoeffCalculation} className="my-auto"/>      {/*  sx={{display: 'none'}} */}
            </SimpleFormIterator>
        </ArrayInput>
    );
}

export default RecurringCostsInput;