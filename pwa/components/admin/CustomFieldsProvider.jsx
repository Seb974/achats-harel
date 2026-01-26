import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionContext } from './SessionContextProvider';

const CustomFieldsContext = createContext(null);

export const CustomFieldsProvider = ({ children }) => {

    const { session } = useSessionContext();
    const [customFields, setCustomFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedCustomFields = sessionStorage.getItem('customFields');
        try {
            const parsedCustomFields = JSON.parse(storedCustomFields);
            if (parsedCustomFields && typeof parsedCustomFields === 'array') {
                setCustomFields(parsedCustomFields);
                setLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Données customFields corrompues dans sessionStorage", e);
        }
        fetchCustomFields();
    }, []);

    const fetchCustomFields = async () => {
        try {
            setLoading(true);
            const res = await fetch("/harel/products/custom_fields?limit=1000&offset=0", {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json", 
                    'Authorization': `Bearer ${session?.accessToken}`
                },
            });
            const data = await res.json();
            setCustomFields(data['products/custom_fields']);
            sessionStorage.setItem("customFields", JSON.stringify(data['products/custom_fields']));
            setLoading(false);
        } catch (e) {
            setLoading(false);
            setError(e);
            console.error("Erreur de récupération des custom_fields", e);
        }
    };

    const updateCustomFields = (newCustomFields) => {
        setCustomFields(newCustomFields);
        sessionStorage.setItem("customFields", JSON.stringify(newCustomFields));
    };

    return (
        <CustomFieldsContext.Provider value={{ customFields, loading, error, updateCustomFields }}>
            { children }
        </CustomFieldsContext.Provider>
    );
};

export const useCustomFields = () => useContext(CustomFieldsContext);
