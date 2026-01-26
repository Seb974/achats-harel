import { useCallback, useState } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { useClient } from '../components/admin/ClientProvider';
import { clientWithTaxes } from '../app/lib/client';

interface OdooRFQLine {
    product_id: number;
    quantity: number;
    price_unit: number;
    name?: string;
    product_uom?: number;
}

interface OdooRFQData {
    supplier_id: number;
    lines: OdooRFQLine[];
    origin?: string;
    notes?: string;
}

interface OdooRFQResult {
    success: boolean;
    rfq_id?: number;
    rfq_name?: string;
    supplier?: string;
    amount_total?: number;
    state?: string;
    lines_count?: number;
    error?: string;
    message?: string;
}

// Interfaces pour Purchase Order (commande confirmée)
interface OdooPurchaseOrderLine {
    product_id: number;
    product_qty: number;
    price_unit: number;
    product_uom?: number;
    name?: string;
}

interface OdooPurchaseOrderData {
    supplier_id: number;
    lines: OdooPurchaseOrderLine[];
    origin?: string;
    date_order?: string;
    date_planned?: string;
    notes?: string;
}

interface OdooPurchaseOrderResult {
    success: boolean;
    order_id?: number;
    order_name?: string;
    supplier?: string;
    amount_untaxed?: number;
    amount_total?: number;
    state?: string;
    origin?: string;
    lines_count?: number;
    error?: string;
    message?: string;
}

// Interface pour les données de prix de revient calculées
interface CostPriceItem {
    productId: number;
    product: string;
    category: string;
    packaging: string;
    packagingId: number;
    mainPackaging: string;
    mainPackagingId: number;
    quantity: number;
    mainQuantity: number;
    unitFactor: number;
    incomingUnitPrice: number;
    outGoingUnitPriceHT: number;
    ht: number;
    ttc: number;
    pr: number;
    mainPr: number;
}

interface UseOdooReturn {
    // État
    loading: boolean;
    error: string | null;
    
    // Vérification de configuration
    isOdooConfigured: boolean;
    dataSource: string;
    
    // Méthodes
    testConnection: () => Promise<boolean>;
    getProducts: (limit?: number, offset?: number) => Promise<any[]>;
    getSuppliers: (limit?: number, offset?: number) => Promise<any[]>;
    createRFQ: (data: OdooRFQData) => Promise<OdooRFQResult>;
    createPurchaseOrder: (data: OdooPurchaseOrderData) => Promise<OdooPurchaseOrderResult>;
    
    // Helper pour convertir un achat en RFQ
    convertAchatToRFQ: (achat: any) => OdooRFQData | null;
    
    // Helper pour convertir un achat en Purchase Order avec prix de revient
    convertAchatToPurchaseOrder: (achat: any) => OdooPurchaseOrderData | null;
    
    // Helper pour calculer les prix de revient
    calculateCostPrices: (achat: any) => CostPriceItem[];
}

/**
 * Hook personnalisé pour l'intégration Odoo
 * 
 * @example
 * const { isOdooConfigured, createRFQ, loading } = useOdoo();
 * 
 * const handleSendToOdoo = async () => {
 *   if (!isOdooConfigured) return;
 *   const result = await createRFQ(rfqData);
 *   console.log('RFQ créé:', result.rfq_name);
 * };
 */
export const useOdoo = (): UseOdooReturn => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const { client } = useClient();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Vérifier si Odoo est configuré pour ce client
    // Note: odooApiKey n'est pas exposé en lecture (sécurité), 
    // donc on vérifie seulement les autres champs
    const isOdooConfigured = !!(
        client?.odooUrl && 
        client?.odooDatabase && 
        client?.odooUsername
    );
    
    const dataSource = client?.dataSource || 'harel';

    /**
     * Teste la connexion à Odoo
     */
    const testConnection = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        try {
            // @ts-ignore
            const result = await dataProvider.testOdooConnection();
            
            if (result.success) {
                notify('Connexion Odoo réussie', { type: 'success' });
                return true;
            } else {
                const errorMsg = result.error || 'Échec de la connexion';
                setError(errorMsg);
                notify(errorMsg, { type: 'error' });
                return false;
            }
        } catch (e: any) {
            const errorMsg = e.message || 'Erreur de connexion Odoo';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
            return false;
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    /**
     * Récupère les produits depuis Odoo
     */
    const getProducts = useCallback(async (limit = 1000, offset = 0): Promise<any[]> => {
        setLoading(true);
        setError(null);
        
        try {
            // @ts-ignore
            const products = await dataProvider.fetchOdoo('odoo_products', limit, offset);
            return products;
        } catch (e: any) {
            const errorMsg = e.message || 'Erreur lors de la récupération des produits';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
            return [];
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    /**
     * Récupère les fournisseurs depuis Odoo
     */
    const getSuppliers = useCallback(async (limit = 1000, offset = 0): Promise<any[]> => {
        setLoading(true);
        setError(null);
        
        try {
            // @ts-ignore
            const suppliers = await dataProvider.fetchOdoo('odoo_suppliers', limit, offset);
            return suppliers;
        } catch (e: any) {
            const errorMsg = e.message || 'Erreur lors de la récupération des fournisseurs';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
            return [];
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    /**
     * Crée une demande de devis (RFQ) dans Odoo
     */
    const createRFQ = useCallback(async (data: OdooRFQData): Promise<OdooRFQResult> => {
        setLoading(true);
        setError(null);
        
        try {
            // @ts-ignore
            const result = await dataProvider.createOdooRFQ(data);
            
            if (result.success) {
                notify(`Devis ${result.rfq_name} créé avec succès dans Odoo`, { type: 'success' });
            }
            
            return result;
        } catch (e: any) {
            const errorMsg = e.message || 'Erreur lors de la création du devis';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    /**
     * Convertit un achat de l'application en données RFQ Odoo
     */
    const convertAchatToRFQ = useCallback((achat: any): OdooRFQData | null => {
        if (!achat || !achat.items || achat.items.length === 0) {
            notify('Aucun article dans cet achat', { type: 'warning' });
            return null;
        }

        // Note: Le supplierId doit correspondre à un fournisseur Odoo
        // Vous devrez peut-être créer un mapping entre les fournisseurs locaux et Odoo
        const supplierId = achat.supplierId || achat.supplier?.id;
        
        if (!supplierId) {
            notify('Aucun fournisseur sélectionné', { type: 'warning' });
            return null;
        }

        const lines: OdooRFQLine[] = achat.items.map((item: any) => ({
            product_id: item.productId || item.product?.id,
            quantity: item.quantity || 1,
            // Utiliser le prix de revient rapproché si disponible
            price_unit: item.costPrice || item.unitPrice || item.price || 0,
            name: item.productLabel || item.label || item.name,
        }));

        return {
            supplier_id: supplierId,
            lines,
            origin: `ACHAT-${achat.id}`,
            notes: achat.notes || `Importé depuis l'application d'achats le ${new Date().toLocaleDateString('fr-FR')}`,
        };
    }, [notify]);

    /**
     * Crée une commande fournisseur confirmée dans Odoo
     */
    const createPurchaseOrder = useCallback(async (data: OdooPurchaseOrderData): Promise<OdooPurchaseOrderResult> => {
        setLoading(true);
        setError(null);
        
        try {
            // @ts-ignore
            const result = await dataProvider.createOdooPurchaseOrder(data);
            
            if (result.success) {
                notify(`Commande ${result.order_name} créée et confirmée dans Odoo`, { type: 'success' });
            }
            
            return result;
        } catch (e: any) {
            const errorMsg = e.message || 'Erreur lors de la création de la commande';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    /**
     * Calcule les prix de revient pour chaque item d'un achat
     * (Logique identique à ItemsAnalytics.jsx)
     */
    const calculateCostPrices = useCallback((achat: any): CostPriceItem[] => {
        if (!achat?.items) return [];

        const clientDecimal = client?.decimalRound ?? 3;
        const groupingElement = achat?.groupingElement ?? (client?.groupingElement ?? "CATEGORY");
        const repartitionMethod = client?.repartitionMethod ?? "QUANTITY";

        const round = (value: number) => parseFloat(value.toFixed(clientDecimal));

        // Calcul du facteur total
        const totalFactor = achat.items.reduce((sum: number, item: any) => {
            switch(repartitionMethod) {
                case "COST":
                    return sum + ((item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0));
                case "WEIGHT":
                    return sum + ((item.weight ?? 0) * (item.quantity ?? 0));
                case "QUANTITY":
                default:
                    return sum + (item.quantity ?? 0);
            }
        }, 0);

        // Calcul pour chaque item
        return achat.items.map((item: any) => {
            const categoryTax = Object.values(achat.categoryTaxes ?? {}).find((cat: any) => 
                (groupingElement === "CATEGORY" && parseInt(cat.categoryId) === parseInt(item.categoryId)) || 
                cat.categoryId == item.categoryId
            ) as any;
            
            const itemFactor = (() => {
                switch(repartitionMethod) {
                    case "COST":
                        return (item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0);
                    case "WEIGHT":
                        return (item.weight ?? 0) * (item.quantity ?? 0);
                    case "QUANTITY":
                    default:
                        return item.quantity ?? 0;
                }
            })();

            const categoryTotalFactor = (() => {
                switch(repartitionMethod) {
                    case "COST":
                        return categoryTax?.totalHT ?? 1;
                    case "WEIGHT":
                        return categoryTax?.totalWeight ?? 1;
                    case "QUANTITY":
                    default:
                        return categoryTax?.totalQty ?? 1;
                }
            })();

            const coeffAppFactor = (() => {
                if (isNaN(achat?.coeffApp) || achat?.coeffApp === 1) return 1;
                return achat?.coeffApp;    
            })();

            const categoryTaxAmountPerItem = clientWithTaxes(client) && categoryTax 
                ? round((categoryTax.taxesAmount ?? 0) / categoryTotalFactor * itemFactor) 
                : 0;
            const globalTaxAmountPerItem = clientWithTaxes(client) && achat?.globalTaxesAmount 
                ? round((achat.globalTaxesAmount ?? 0) / (totalFactor || 1) * itemFactor) 
                : 0;
            const baseHt = round((item.outGoingUnitPriceHT ?? 0) * (item.quantity ?? 0));
            const ht = clientWithTaxes(client) ? round(baseHt * coeffAppFactor) : baseHt;
            const baseTtc = round(ht + (!isNaN(categoryTaxAmountPerItem) ? categoryTaxAmountPerItem : 0) + (!isNaN(globalTaxAmountPerItem) ? globalTaxAmountPerItem : 0));
            const ttc = clientWithTaxes(client) ? baseTtc : round(baseTtc * coeffAppFactor);
            const pr = round((ttc ?? 0) / (item.quantity ?? 1));
            const mainPr = round((ttc ?? 0) / (item.mainQuantity ?? 1));

            return {
                productId: item.productId,
                product: item.product,
                category: item.category,
                packaging: item.packaging,
                packagingId: item.packagingId,
                mainPackaging: item.mainPackaging,
                mainPackagingId: item.mainPackagingId,
                quantity: item.quantity,
                mainQuantity: item.mainQuantity,
                unitFactor: item.unitFactor,
                incomingUnitPrice: item.incomingUnitPrice,
                outGoingUnitPriceHT: item.outGoingUnitPriceHT,
                ht,
                ttc,
                pr,
                mainPr,
            };
        });
    }, [client]);

    /**
     * Génère les notes détaillées pour Odoo
     */
    const generateOdooNotes = useCallback((achat: any, costPriceItems: CostPriceItem[]): string => {
        const formatDate = (date: string | Date | null) => {
            if (!date) return 'Non définie';
            return new Date(date).toLocaleDateString('fr-FR');
        };

        const formatNumber = (value: number | null | undefined, decimals = 2) => {
            if (value === null || value === undefined || isNaN(value)) return '0';
            return value.toFixed(decimals);
        };

        // Calcul des totaux
        const totalHT = costPriceItems.reduce((sum, item) => sum + item.ht, 0);
        const totalTTC = costPriceItems.reduce((sum, item) => sum + item.ttc, 0);
        const totalCoveringEur = (achat.coveringCosts ?? []).reduce((sum: number, c: any) => 
            sum + ((c?.amount ?? 0) / (c?.exchangeRate ?? 1)), 0);
        const totalOtherCosts = (achat.otherCosts ?? []).reduce((sum: number, c: any) => 
            sum + (c?.value ?? 0), 0);

        let notes = `═══════════════════════════════════════════════════════
IMPORTATION HAREL - Achat #${achat.id ?? ''}
═══════════════════════════════════════════════════════

INFORMATIONS GENERALES
──────────────────────
• Fournisseur : ${achat.supplier ?? 'Non spécifié'}
• Référence : ${achat.shipNumber ?? 'Non spécifié'}
• Date d'achat : ${formatDate(achat.date)}
• Date de livraison : ${formatDate(achat.deliveryDate)}
• Statut HAREL : ${achat.status?.label ?? 'Non défini'}

DEVISES ET TAUX DE CHANGE
─────────────────────────
• Devise d'origine : ${achat.baseCurrency ?? 'EUR'}
• Devise cible : ${achat.targetCurrency ?? 'EUR'}
• Taux de change : ${achat.exchangeRate ?? 1}
`;

        // Coûts d'approche si présents
        if (achat.coeffApp && achat.coeffApp !== 1) {
            notes += `
COUTS D'APPROCHE
────────────────
• Coefficient d'approche : ${formatNumber(achat.coeffApp, 4)}
`;
        }

        // Couverture de change
        if (achat.coveringCosts && achat.coveringCosts.length > 0) {
            notes += `
  Couverture de change :
`;
            achat.coveringCosts.forEach((c: any) => {
                const valueEur = (c.amount ?? 0) / (c.exchangeRate ?? 1);
                notes += `  - ${formatDate(c.date)} : ${formatNumber(c.amount)} @ ${formatNumber(c.exchangeRate, 4)} = ${formatNumber(valueEur)} EUR\n`;
            });
            notes += `  → Total couverture : ${formatNumber(totalCoveringEur)} EUR
  → Gain/Perte de change : ${formatNumber(achat.totalCoveringHT)} EUR
`;
        }

        // Autres coûts
        if (achat.otherCosts && achat.otherCosts.length > 0) {
            notes += `
  Autres couts :
`;
            achat.otherCosts.forEach((c: any) => {
                notes += `  - ${c.name ?? 'Coût'} : ${formatNumber(c.value)} ${c.currency ?? 'EUR'}\n`;
            });
            notes += `  → Total autres couts : ${formatNumber(totalOtherCosts)} EUR
`;
        }

        notes += `
TOTAUX
──────
• Total HT (avec coeff) : ${formatNumber(totalHT)} EUR
• Total TTC (avec taxes) : ${formatNumber(totalTTC)} EUR
• Nombre d'articles : ${costPriceItems.length}
`;

        // Commentaires
        if (achat.comment) {
            notes += `
COMMENTAIRES
────────────
${achat.comment}
`;
        }

        notes += `
═══════════════════════════════════════════════════════
Importé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
═══════════════════════════════════════════════════════`;

        return notes;
    }, []);

    /**
     * Convertit un achat en données Purchase Order Odoo avec prix de revient
     */
    const convertAchatToPurchaseOrder = useCallback((achat: any): OdooPurchaseOrderData | null => {
        if (!achat || !achat.items || achat.items.length === 0) {
            notify('Aucun article dans cet achat', { type: 'warning' });
            return null;
        }

        const supplierId = achat.supplierId || achat.supplier?.id;
        
        if (!supplierId) {
            notify('Aucun fournisseur Odoo sélectionné', { type: 'warning' });
            return null;
        }

        // Calculer les prix de revient
        const costPriceItems = calculateCostPrices(achat);

        // Créer les lignes avec les prix de revient
        const lines: OdooPurchaseOrderLine[] = costPriceItems.map((item) => {
            // Description enrichie pour la ligne
            const description = `${item.product}
─────────────────────────────
• Catégorie : ${item.category ?? 'Non définie'}
• Conditionnement achat : ${item.quantity} x ${item.packaging}
• Prix unitaire converti : ${item.outGoingUnitPriceHT?.toFixed(4) ?? 0} EUR
• Total HT ligne : ${item.ht?.toFixed(2) ?? 0} EUR
• Total TTC ligne : ${item.ttc?.toFixed(2) ?? 0} EUR
• Prix de revient/unité : ${item.mainPr?.toFixed(4) ?? 0} EUR/${item.mainPackaging ?? 'Unit'}`;

            return {
                product_id: item.productId,
                product_qty: item.mainQuantity, // Quantité en unités de base
                price_unit: item.mainPr, // Prix de revient par unité de base
                product_uom: item.mainPackagingId, // UDM de base
                name: description,
            };
        });

        // Générer les notes détaillées
        const notes = generateOdooNotes(achat, costPriceItems);

        // Formater les dates
        const formatDateTime = (date: string | Date | null) => {
            if (!date) return undefined;
            const d = new Date(date);
            return d.toISOString().slice(0, 19).replace('T', ' ');
        };

        const formatDate = (date: string | Date | null) => {
            if (!date) return undefined;
            const d = new Date(date);
            return d.toISOString().slice(0, 10);
        };

        return {
            supplier_id: supplierId,
            lines,
            origin: achat.shipNumber || `HAREL-${achat.id}`,
            date_order: formatDateTime(achat.date),
            date_planned: formatDate(achat.deliveryDate),
            notes,
        };
    }, [notify, calculateCostPrices, generateOdooNotes]);

    return {
        loading,
        error,
        isOdooConfigured,
        dataSource,
        testConnection,
        getProducts,
        getSuppliers,
        createRFQ,
        createPurchaseOrder,
        convertAchatToRFQ,
        convertAchatToPurchaseOrder,
        calculateCostPrices,
    };
};

export default useOdoo;
