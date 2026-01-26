import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionContext } from './SessionContextProvider';

const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {

    const { session } = useSessionContext();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Toujours recharger le client depuis l'API pour avoir les données à jour
        // Le cache sessionStorage sera mis à jour après le rechargement
        sessionStorage.removeItem('client');
        fetchClientData();
    }, []);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/clients?page=1&itemsPerPage=1&order[id]=asc", {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json", 
                    'Authorization': `Bearer ${session?.accessToken}`
                },
            });
            const data = await res.json();
            setClient(data['hydra:member'][0]);
            sessionStorage.setItem("client", JSON.stringify(data['hydra:member'][0]));
            setLoading(false);
        } catch (e) {
            setLoading(false);
            console.error("Erreur de récupération client", e);
        }
    };

    const updateClient = (newClient) => {
        setClient(newClient);
        sessionStorage.setItem("client", JSON.stringify(newClient));
    };

    return (
        <ClientContext.Provider value={{ client, loading, error, updateClient }}>
            { children }
        </ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext);
