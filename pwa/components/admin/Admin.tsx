"use client";

import Head from "next/head";
import { useEffect, useRef } from "react";
import { type DataProvider, defaultTheme, CustomRoutes, Resource } from "react-admin";
import { Route } from 'react-router-dom';
import { signIn } from "next-auth/react";
import SyncLoader from "react-spinners/SyncLoader";
import { fetchHydra, HydraAdmin, hydraDataProvider, ResourceGuesser } from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { type Session } from "../../app/auth";
import authProvider from "../../components/admin/authProvider";
import Layout from "./layout/Layout";
import { ENTRYPOINT } from "../../config/entrypoint";
import i18nProvider from "./i18nProvider";
import Dashboard from "../dashboard/components/Dashboard/Dashboard";
import userResourceProps from "./user";
import clientResourceProps from "./client";
import { useSessionContext, SessionContextProvider } from "../admin/SessionContextProvider";
import { ClientProvider, useClient } from "../admin/ClientProvider";
import { CustomFieldsProvider } from "../admin/CustomFieldsProvider";
import expenseResourceProps from "./expense";
import GlobalLoader from "./layout/GlobalLoader";
import { isDefined } from "../../app/lib/utils";
import productResourceProps from "./product";
import taxResourceProps from "./tax";
import customFieldResourceProps from "./customField";
import currencyResourceProps from "./currency";
import taxTypeResourceProps from "./taxType";
import achatResourceProps from "./achat";
import statusResourceProps from "./status";
import recurringCostResourceProps from "./recurringCost";
import supplierResourceProps from "./supplier";

const apiDocumentationParser = (session: Session) => async () => {
  try {
    return await parseHydraDocumentation(ENTRYPOINT, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
  } catch (result) {
    // @ts-ignore
    const { api, response, status } = result;
    if (status !== 401 || !response) {
      throw result;
    }

    return {
      api,
      response,
      status,
    };
  }
};

const myTheme = {
  ...defaultTheme,
  palette: {
      mode: 'light',
  }
};

const AdminAdapter = ({session, children}: { session: Session; children?: React.ReactNode | undefined;}) => {
  // @ts-ignore
  const dataProvider = useRef<DataProvider>();

  let harelTotalsCache: Record<string, { total: number; timestamp: number }> = {};
  let odooTotalsCache: Record<string, { total: number; timestamp: number }> = {};
  const CACHE_TTL = 30 * 60 * 1000; // 30 min

  const baseProvider = hydraDataProvider({
    entrypoint: ENTRYPOINT,
    httpClient: (url: URL, options = {}) =>
      fetchHydra(url, {
        ...options,
        headers: {Authorization: `Bearer ${session?.accessToken}`},
      }),
    apiDocumentationParser: apiDocumentationParser(session),
  });

  dataProvider.current = {
    ...baseProvider,
    // =========================================================================
    // HAREL DATA PROVIDER METHODS
    // =========================================================================
    fetchHarel: async (resource: string, limit?: number, offset?: number) => {
      const endpoint = resource.substring("harel_".length);
      const params: string[] = [];
      if (limit !== undefined) params.push(`limit=${limit}`);
      if (offset !== undefined) params.push(`offset=${offset}`);
      const query = params.length ? `?${params.join("&")}` : "";

      const response = await fetch(`${ENTRYPOINT}/harel/${endpoint}${query}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des ${endpoint}`);
      }

      const json = await response.json();
      const key = Object.keys(json)[0];
      return json[key].map((item: any, index: number) => ({
        id: item.id ?? offset + index,
        ...item,
      }));
    },
    // =========================================================================
    // ODOO DATA PROVIDER METHODS
    // =========================================================================
    fetchOdoo: async (resource: string, limit?: number, offset?: number) => {
      const endpoint = resource.substring("odoo_".length);
      const params: string[] = [];
      if (limit !== undefined) params.push(`limit=${limit}`);
      if (offset !== undefined) params.push(`offset=${offset}`);
      const query = params.length ? `?${params.join("&")}` : "";

      const response = await fetch(`${ENTRYPOINT}/odoo/${endpoint}${query}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur lors du chargement des ${endpoint} depuis Odoo`);
      }

      const json = await response.json();
      const key = Object.keys(json)[0];
      return (json[key] || []).map((item: any, index: number) => ({
        id: item.id ?? offset + index,
        ...item,
      }));
    },
    // Test de connexion Odoo
    testOdooConnection: async () => {
      const response = await fetch(`${ENTRYPOINT}/odoo/test`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
    // Création de RFQ dans Odoo
    createOdooRFQ: async (data: { supplier_id: number; lines: any[]; origin?: string; notes?: string }) => {
      const response = await fetch(`${ENTRYPOINT}/odoo/rfq`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la création du devis Odoo');
      }
      
      return response.json();
    },
    // Création de commande fournisseur confirmée dans Odoo (avec prix de revient)
    createOdooPurchaseOrder: async (data: { 
      supplier_id: number; 
      lines: any[]; 
      origin?: string; 
      date_order?: string;
      date_planned?: string;
      notes?: string 
    }) => {
      const response = await fetch(`${ENTRYPOINT}/odoo/purchase-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la création de la commande Odoo');
      }
      
      return response.json();
    },
    // =========================================================================
    // PATCH (partial update) — safe status changes without data loss
    // =========================================================================
    patchResource: async (resource: string, id: string, data: Record<string, any>) => {
      const response = await fetch(`${ENTRYPOINT}${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData['hydra:description'] || errorData.message || `Erreur PATCH ${resource}`);
      }
      return { data: await response.json() };
    },
    // =========================================================================
    // GENERIC METHODS (HAREL + ODOO)
    // =========================================================================
    getList: async (resource, params) => {
      // Handle HAREL resources
      if (resource.startsWith("harel_")) {
        const { page, perPage } = params.pagination;
        const start = (page - 1) * perPage;
        const cacheKey = resource.substring("harel_".length);
        const cached = harelTotalsCache[cacheKey];
        const isExpired = !cached || Date.now() - cached.timestamp > CACHE_TTL;

        let total = cached?.total ?? 0;

        if (isExpired) {
          const fullResponse = await dataProvider.current.getAll(resource);
          total = fullResponse.length;
          const slicedResponse = fullResponse.slice(start, start + perPage);
          harelTotalsCache[cacheKey] = { total, timestamp: Date.now() };
          return { data: slicedResponse, total }
        } else {
          const data = await dataProvider.current.fetchHarel(resource, perPage, start);
          return { data, total };
        }
      }
      
      // Handle ODOO resources
      if (resource.startsWith("odoo_")) {
        const { page, perPage } = params.pagination;
        const start = (page - 1) * perPage;
        const cacheKey = resource.substring("odoo_".length);
        const cached = odooTotalsCache[cacheKey];
        const isExpired = !cached || Date.now() - cached.timestamp > CACHE_TTL;

        let total = cached?.total ?? 0;

        if (isExpired) {
          const fullResponse = await dataProvider.current.getAll(resource);
          total = fullResponse.length;
          const slicedResponse = fullResponse.slice(start, start + perPage);
          odooTotalsCache[cacheKey] = { total, timestamp: Date.now() };
          return { data: slicedResponse, total }
        } else {
          const data = await dataProvider.current.fetchOdoo(resource, perPage, start);
          return { data, total };
        }
      }

      return baseProvider.getList(resource, params);
    },
    getAll: async (resource: string) => {
      // Handle HAREL resources
      if (resource.startsWith("harel_")) {
        let results: any[] = [];
        let offset = 0;
        const limit = 1000;
        while (true) {
          const chunk = await dataProvider.current.fetchHarel(resource, limit, offset);
          results = results.concat(chunk);
          if (chunk.length < limit) break;
          offset += limit;
        }
        return results;
      }
      
      // Handle ODOO resources
      if (resource.startsWith("odoo_")) {
        let results: any[] = [];
        let offset = 0;
        const limit = 1000;
        while (true) {
          const chunk = await dataProvider.current.fetchOdoo(resource, limit, offset);
          results = results.concat(chunk);
          if (chunk.length < limit) break;
          offset += limit;
        }
        return results;
      }
      
      throw new Error(`getAll non supporté pour la ressource ${resource}`);
    },
    getOne: async (resource, params) => {
      // Handle HAREL resources
      if (resource.startsWith("harel_")) {
        const endpoint = resource.substring("harel_".length);
        const response = await fetch(`${ENTRYPOINT}/harel/${endpoint}/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        });
        const json = await response.json();
        return { data: json.data };
      }
      
      // Handle ODOO resources
      if (resource.startsWith("odoo_")) {
        const endpoint = resource.substring("odoo_".length);
        const response = await fetch(`${ENTRYPOINT}/odoo/${endpoint}/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        });
        const json = await response.json();
        return { data: json.data };
      }

      return baseProvider.getOne(resource, params);
    }
  };

  return (
    <HydraAdmin
      requireAuth
      authProvider={authProvider}
      // @ts-ignore
      dataProvider={dataProvider.current}
      entrypoint={window.origin}
      i18nProvider={i18nProvider}
      // dashboard={ Dashboard }
      darkTheme={ null }
      layout={Layout}
    >
      {!!children && children}      
    </HydraAdmin>
  );
};

const AdminWithOIDC = () => {
  const { session, status } = useSessionContext();
  const { loading, client } = useClient();

  // Attendre que la session ET le client soient chargés
  if (status === "loading" || loading || (isDefined(session?.accessToken) && !client)) {
    return <GlobalLoader/>;
  }

  // @ts-ignore
  if (!session || session?.error === "RefreshAccessTokenError") {
    (async () => await signIn("keycloak"))();

    return;
  }

  // Déterminer la source de données: "odoo" si configuré, sinon "harel" par défaut
  const dataSource = client?.dataSource === 'odoo' ? 'odoo' : 'harel';
  const isOdoo = dataSource === 'odoo';
  
  console.log('[AdminWithOIDC] Client:', client?.name, '| dataSource:', dataSource, '| isOdoo:', isOdoo);

  // Utiliser la source de données comme préfixe pour les ressources produits
  const productResource = isOdoo ? 'odoo_products' : 'harel_products';
  const productLabel = isOdoo ? 'Produits (Odoo)' : 'Produits';

  return (
      // @ts-ignore
      // Utiliser key pour forcer le re-rendu quand dataSource change
      <AdminAdapter session={session} key={`admin-${dataSource}`}>
        <ResourceGuesser name="achats" {...achatResourceProps}/>
        <ResourceGuesser name="clients" {...clientResourceProps}/>
        <ResourceGuesser name="users" {...userResourceProps}/>
        <ResourceGuesser name="taxes" {...taxResourceProps}/>
        <ResourceGuesser name="currencies" {...currencyResourceProps}/>
        <ResourceGuesser name="tax_types" {...taxTypeResourceProps}/>
        <ResourceGuesser name="statuses" {...statusResourceProps}/>
        <ResourceGuesser name="recurring_costs" {...recurringCostResourceProps}/>
        
        {/* Produits - ressource dynamique selon la source de données */}
        <Resource 
          name={productResource} 
          {...productResourceProps} 
          // @ts-ignore
          options={{ ...productResourceProps.options, label: productLabel }}
        />
        
        {/* Ressources additionnelles selon la source */}
        {isOdoo ? (
          <Resource 
            name="odoo_suppliers" 
            {...supplierResourceProps}
            options={{ label: "Fournisseurs (Odoo)" }} 
          />
        ) : (
          <Resource name="harel_custom_fields" {...customFieldResourceProps} />
        )}
      </AdminAdapter>
  );
};

const Admin = () => {

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.has("error")) {
        url.searchParams.delete("error");
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : "") + url.hash);
    }
  }, []);

  return (
  <>
    <Head>
      <title>{"CRÉAZOT - Achats"}</title>
    </Head>  

    <SessionContextProvider>
        <ClientProvider>
          <CustomFieldsProvider>
            {/*@ts-ignore*/}
            <AdminWithOIDC />
          </CustomFieldsProvider>
        </ClientProvider>
    </SessionContextProvider>
  </>
)};

export default Admin;
