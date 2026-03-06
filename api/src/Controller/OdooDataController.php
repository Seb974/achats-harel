<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\ClientGetter;
use App\Service\OdooApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

/**
 * Contrôleur proxy pour l'API Odoo
 * 
 * Expose les endpoints Odoo de manière similaire au contrôleur HAREL
 * pour faciliter l'intégration avec le frontend existant.
 */
#[Route('/odoo', name: 'odoo_')]
class OdooDataController extends AbstractController
{
    public function __construct(
        private ClientGetter $clientGetter,
        private OdooApiService $odooService,
        private LoggerInterface $logger
    ) {}

    /**
     * Test de connexion à Odoo
     */
    #[Route('/test', name: 'test_connection', methods: ['GET'])]
    public function testConnection(): JsonResponse
    {
        try {
            $client = $this->clientGetter->get();
            if (!$client) {
                return $this->json(['error' => 'Client non trouvé'], 400);
            }

            // Vérifier que les paramètres Odoo sont configurés
            if (!$client->getOdooUrl() || !$client->getOdooDatabase() || 
                !$client->getOdooUsername() || !$client->getOdooApiKey()) {
                return $this->json([
                    'error' => 'Configuration Odoo incomplète',
                    'missing' => array_filter([
                        !$client->getOdooUrl() ? 'odooUrl' : null,
                        !$client->getOdooDatabase() ? 'odooDatabase' : null,
                        !$client->getOdooUsername() ? 'odooUsername' : null,
                        !$client->getOdooApiKey() ? 'odooApiKey' : null,
                    ])
                ], 400);
            }

            $this->odooService->configure($client);
            
            // Tester la connexion en récupérant la version
            $version = $this->odooService->getVersion();
            $uid = $this->odooService->authenticate();

            return $this->json([
                'success' => true,
                'message' => 'Connexion Odoo réussie',
                'odoo_version' => $version['server_version'] ?? 'unknown',
                'user_id' => $uid,
                'database' => $client->getOdooDatabase(),
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('Odoo connection test failed', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Échec de la connexion Odoo',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère la liste des produits Odoo
     */
    #[Route('/products', name: 'get_products', methods: ['GET'])]
    public function getProducts(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $limit = $request->query->getInt('limit', 1000);
            $offset = $request->query->getInt('offset', 0);

            $products = $this->odooService->getProducts($limit, $offset);

            return $this->json([
                'products' => $products,
                'count' => count($products),
                'limit' => $limit,
                'offset' => $offset,
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch Odoo products', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des produits',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère un produit par son ID
     */
    #[Route('/products/{id}', name: 'get_product', methods: ['GET'])]
    public function getProduct(int $id): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $product = $this->odooService->getProduct($id);

            if (!$product) {
                return $this->json(['error' => 'Produit non trouvé'], 404);
            }

            return $this->json(['data' => $product]);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch Odoo product', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération du produit',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère la liste des fournisseurs Odoo
     */
    #[Route('/suppliers', name: 'get_suppliers', methods: ['GET'])]
    public function getSuppliers(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $limit = $request->query->getInt('limit', 1000);
            $offset = $request->query->getInt('offset', 0);

            $suppliers = $this->odooService->getSuppliers($limit, $offset);

            return $this->json([
                'suppliers' => $suppliers,
                'count' => count($suppliers),
                'limit' => $limit,
                'offset' => $offset,
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch Odoo suppliers', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des fournisseurs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée une demande de devis (RFQ) dans Odoo
     * 
     * Body JSON attendu:
     * {
     *   "supplier_id": 123,
     *   "lines": [
     *     {"product_id": 1, "quantity": 10, "price_unit": 25.50, "name": "Description optionnelle"},
     *     ...
     *   ],
     *   "origin": "ACHAT-2024-001",  // Optionnel: référence de l'achat dans votre app
     *   "notes": "Notes pour le fournisseur"  // Optionnel
     * }
     */
    #[Route('/rfq', name: 'create_rfq', methods: ['POST'])]
    public function createRFQ(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $data = json_decode($request->getContent(), true);

            // Validation des données
            if (empty($data['supplier_id'])) {
                return $this->json(['error' => 'supplier_id est requis'], 400);
            }

            if (empty($data['lines']) || !is_array($data['lines'])) {
                return $this->json(['error' => 'lines doit être un tableau non vide'], 400);
            }

            // Valider chaque ligne
            foreach ($data['lines'] as $index => $line) {
                if (empty($line['product_id'])) {
                    return $this->json(['error' => "product_id requis pour la ligne $index"], 400);
                }
                if (!isset($line['quantity']) || $line['quantity'] <= 0) {
                    return $this->json(['error' => "quantity invalide pour la ligne $index"], 400);
                }
                if (!isset($line['price_unit'])) {
                    return $this->json(['error' => "price_unit requis pour la ligne $index"], 400);
                }
            }

            $options = [
                'origin' => $data['origin'] ?? null,
                'notes' => $data['notes'] ?? '',
                'date_order' => $data['date_order'] ?? null,
            ];

            $result = $this->odooService->createRFQ(
                (int) $data['supplier_id'],
                $data['lines'],
                array_filter($options)
            );

            $this->logger->info('RFQ created in Odoo', $result);

            return $this->json($result, 201);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to create RFQ in Odoo', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la création du devis',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirme un RFQ en bon de commande
     */
    #[Route('/rfq/{id}/confirm', name: 'confirm_rfq', methods: ['POST'])]
    public function confirmRFQ(int $id): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $this->odooService->confirmRFQ($id);

            return $this->json([
                'success' => true,
                'message' => 'Bon de commande confirmé',
                'order_id' => $id
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to confirm RFQ', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la confirmation du devis',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée une commande fournisseur confirmée dans Odoo avec les prix de revient
     * 
     * Body JSON attendu:
     * {
     *   "supplier_id": 123,
     *   "lines": [
     *     {
     *       "product_id": 1, 
     *       "product_qty": 4000, 
     *       "price_unit": 2.39538, 
     *       "product_uom": 1,
     *       "name": "ANC000 Anchois - Conditionnement: 200 Carton de 20"
     *     },
     *     ...
     *   ],
     *   "origin": "EXP-2024-001",
     *   "date_order": "2024-01-26 10:00:00",
     *   "date_planned": "2024-02-15",
     *   "notes": "Notes détaillées avec informations de l'achat HAREL"
     * }
     */
    #[Route('/purchase-order', name: 'create_purchase_order', methods: ['POST'])]
    public function createPurchaseOrder(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $data = json_decode($request->getContent(), true);

            // Validation des données
            if (empty($data['supplier_id'])) {
                return $this->json(['error' => 'supplier_id est requis'], 400);
            }

            if (empty($data['lines']) || !is_array($data['lines'])) {
                return $this->json(['error' => 'lines doit être un tableau non vide'], 400);
            }

            // Valider chaque ligne
            foreach ($data['lines'] as $index => $line) {
                if (empty($line['product_id'])) {
                    return $this->json(['error' => "product_id requis pour la ligne $index"], 400);
                }
                if (!isset($line['product_qty']) || $line['product_qty'] <= 0) {
                    return $this->json(['error' => "product_qty invalide pour la ligne $index"], 400);
                }
                if (!isset($line['price_unit'])) {
                    return $this->json(['error' => "price_unit requis pour la ligne $index"], 400);
                }
            }

            $options = [
                'origin' => $data['origin'] ?? null,
                'notes' => $data['notes'] ?? '',
                'date_order' => $data['date_order'] ?? null,
                'date_planned' => $data['date_planned'] ?? null,
            ];

            $result = $this->odooService->createPurchaseOrder(
                (int) $data['supplier_id'],
                $data['lines'],
                array_filter($options)
            );

            $this->logger->info('Purchase Order created in Odoo', $result);

            return $this->json($result, 201);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to create Purchase Order in Odoo', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la création de la commande fournisseur',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // =========================================================================
    // ENDPOINTS TRANSIT / STOCK
    // =========================================================================

    /**
     * Récupère les emplacements de stock
     */
    #[Route('/stock-locations', name: 'get_stock_locations', methods: ['GET'])]
    public function getStockLocations(): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $locations = $this->odooService->getStockLocations();

            return $this->json([
                'locations' => $locations,
                'count' => count($locations),
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch stock locations', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des emplacements',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée un transfert de stock interne
     *
     * Body JSON: { "location_src_id": 22, "location_dest_id": 23, "products": [...], "origin": "HAREL-42" }
     */
    #[Route('/stock-transfer', name: 'create_stock_transfer', methods: ['POST'])]
    public function createStockTransfer(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $data = json_decode($request->getContent(), true);

            if (empty($data['location_src_id']) || empty($data['location_dest_id'])) {
                return $this->json(['error' => 'location_src_id et location_dest_id sont requis'], 400);
            }

            if (empty($data['products']) || !is_array($data['products'])) {
                return $this->json(['error' => 'products doit être un tableau non vide'], 400);
            }

            $result = $this->odooService->createStockTransfer(
                (int) $data['location_src_id'],
                (int) $data['location_dest_id'],
                $data['products'],
                $data['origin'] ?? ''
            );

            $this->logger->info('Stock transfer created', $result);

            return $this->json($result, 201);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to create stock transfer', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors du transfert de stock',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour les prix des lignes d'un bon de commande Odoo
     *
     * Body JSON: { "lines": [{"product_id": 1, "price_unit": 2.50}, ...] }
     */
    #[Route('/purchase-order/{id}/lines', name: 'update_purchase_order_lines', methods: ['PUT'])]
    public function updatePurchaseOrderLines(int $id, Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $data = json_decode($request->getContent(), true);

            if (empty($data['lines']) || !is_array($data['lines'])) {
                return $this->json(['error' => 'lines doit être un tableau non vide'], 400);
            }

            $this->odooService->updatePurchaseOrderLines($id, $data['lines']);

            return $this->json([
                'success' => true,
                'message' => 'Prix mis à jour',
                'order_id' => $id,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to update PO lines', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la mise à jour des prix',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les pickings liés à un PO
     */
    #[Route('/purchase-order/{id}/pickings', name: 'get_purchase_order_pickings', methods: ['GET'])]
    public function getPurchaseOrderPickings(int $id): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $order = $this->odooService->read('purchase.order', [$id], ['name', 'origin']);
            $origin = $order[0]['name'] ?? '';

            $pickings = $this->odooService->getStockPickingsByOrigin($origin);

            return $this->json([
                'pickings' => $pickings,
                'count' => count($pickings),
                'purchase_order_name' => $origin,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch PO pickings', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des réceptions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère l'état d'un picking (pour vérification de réception)
     */
    #[Route('/picking/{id}/state', name: 'get_picking_state', methods: ['GET'])]
    public function getPickingState(int $id): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $state = $this->odooService->getStockPickingState($id);

            return $this->json($state);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch picking state', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la vérification du picking',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retourne les produits des PO dans un statut transit donné
     */
    #[Route('/stock-by-transit/{statusCode}', name: 'stock_by_transit_status', methods: ['GET'])]
    public function getStockByTransitStatus(string $statusCode): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $result = $this->odooService->getStockByTransitStatus($statusCode);
            return $this->json($result);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to get stock by transit status', ['status' => $statusCode, 'error' => $e->getMessage()]);
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Met à jour x_statut_transit sur le PO Odoo
     */
    #[Route('/purchase-order/{id}/transit-status', name: 'update_transit_status', methods: ['POST'])]
    public function updateTransitStatus(int $id, Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $data = json_decode($request->getContent(), true);
            $statusCode = $data['status_code'] ?? null;
            if (!$statusCode) {
                return $this->json(['error' => 'status_code requis'], 400);
            }

            $this->odooService->updatePurchaseOrderTransitStatus($id, $statusCode);

            return $this->json(['success' => true, 'status_code' => $statusCode]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to update transit status', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Valide le picking de réception d'un PO (passage receipt_status → full)
     */
    #[Route('/purchase-order/{id}/validate-receipt', name: 'validate_purchase_order_receipt', methods: ['POST'])]
    public function validatePurchaseOrderReceipt(int $id): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $result = $this->odooService->validatePurchaseOrderReceipt($id);

            $this->logger->info('PO receipt validation', $result);

            return $this->json($result);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to validate PO receipt', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la validation de la réception',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annule un bon de commande dans Odoo
     */
    #[Route('/purchase-order/{id}/cancel', name: 'cancel_purchase_order', methods: ['POST'])]
    public function cancelPurchaseOrder(int $id): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $this->odooService->cancelPurchaseOrder($id);

            return $this->json([
                'success' => true,
                'message' => 'Commande annulée',
                'order_id' => $id,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to cancel PO', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de l\'annulation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère le stock présent dans un emplacement Odoo (via stock.quant)
     */
    #[Route('/stock-at-location/{locationId}', name: 'stock_at_location', methods: ['GET'])]
    public function getStockAtLocation(int $locationId): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $result = $this->odooService->getStockAtLocation($locationId);

            return $this->json($result);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch stock at location', [
                'locationId' => $locationId,
                'error' => $e->getMessage(),
            ]);
            return $this->json([
                'error' => 'Erreur lors de la récupération du stock',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Historique des mouvements pour un emplacement
     */
    #[Route('/movement-history/{locationId}', name: 'movement_history', methods: ['GET'])]
    public function getMovementHistory(int $locationId): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $history = $this->odooService->getMovementHistory($locationId);

            return $this->json([
                'movements' => $history,
                'count' => count($history),
                'location_id' => $locationId,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch movement history', [
                'locationId' => $locationId,
                'error' => $e->getMessage(),
            ]);
            return $this->json([
                'error' => 'Erreur lors de la récupération de l\'historique',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Poste un message sur le chatter d'un PO
     */
    #[Route('/purchase-order/{id}/message', name: 'post_purchase_order_message', methods: ['POST'])]
    public function postPurchaseOrderMessage(int $id, Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $data = json_decode($request->getContent(), true);
            $body = $data['body'] ?? '';

            if (empty($body)) {
                return $this->json(['error' => 'body est requis'], 400);
            }

            $this->odooService->postPurchaseOrderMessage($id, $body);

            return $this->json(['success' => true]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to post PO message', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
            return $this->json([
                'error' => 'Erreur lors de l\'envoi du message',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Récupère les compteurs de stock pour plusieurs emplacements en un seul appel
     *
     * Query: ?locations=22,23,24,28,19
     */
    #[Route('/stock-counts-batch', name: 'stock_counts_batch', methods: ['GET'])]
    public function getStockCountsBatch(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $locationsParam = $request->query->get('locations', '');
            $locationIds = array_filter(array_map('intval', explode(',', $locationsParam)));

            if (empty($locationIds)) {
                return $this->json(['error' => 'locations query parameter requis (ex: ?locations=22,23,24)'], 400);
            }

            $counts = $this->odooService->getStockCountsBatch($locationIds);

            return $this->json(['counts' => $counts]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch batch stock counts', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des compteurs de stock',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Recherche un fournisseur par nom (côté serveur, pas besoin de charger tous les fournisseurs)
     */
    #[Route('/suppliers/search', name: 'search_supplier', methods: ['GET'])]
    public function searchSupplier(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $name = $request->query->get('name', '');
            if (empty($name)) {
                return $this->json(['error' => 'name query parameter requis'], 400);
            }

            $supplier = $this->odooService->findSupplierByName($name);

            return $this->json([
                'found' => $supplier !== null,
                'supplier' => $supplier,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to search supplier', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la recherche du fournisseur',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================================
    // ENDPOINTS DONNÉES DE RÉFÉRENCE
    // =========================================================================

    /**
     * Récupère les catégories de produits
     */
    #[Route('/categories', name: 'get_categories', methods: ['GET'])]
    public function getCategories(Request $request): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $categories = $this->odooService->searchRead(
                'product.category',
                [],
                ['id', 'name', 'complete_name', 'parent_id'],
                $request->query->getInt('limit', 500),
                $request->query->getInt('offset', 0)
            );

            return $this->json([
                'categories' => $categories,
                'count' => count($categories)
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch Odoo categories', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des catégories',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les unités de mesure
     */
    #[Route('/uom', name: 'get_uom', methods: ['GET'])]
    public function getUnitOfMeasure(): JsonResponse
    {
        try {
            $config = $this->configureOdoo();
            if ($config instanceof JsonResponse) {
                return $config;
            }

            $uoms = $this->odooService->searchRead(
                'uom.uom',
                [],
                ['id', 'name', 'category_id', 'factor', 'rounding']
            );

            return $this->json([
                'units' => $uoms,
                'count' => count($uoms)
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('Failed to fetch Odoo UoM', ['error' => $e->getMessage()]);
            return $this->json([
                'error' => 'Erreur lors de la récupération des unités de mesure',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Configure le service Odoo avec les paramètres du client actif
     */
    private function configureOdoo(): ?JsonResponse
    {
        $client = $this->clientGetter->get();
        
        if (!$client) {
            return $this->json(['error' => 'Client non trouvé'], 400);
        }

        if (!$client->getOdooUrl()) {
            return $this->json(['error' => 'URL Odoo non configurée pour ce client'], 400);
        }

        if (!$client->getOdooDatabase()) {
            return $this->json(['error' => 'Base de données Odoo non configurée'], 400);
        }

        if (!$client->getOdooUsername()) {
            return $this->json(['error' => 'Utilisateur Odoo non configuré'], 400);
        }

        if (!$client->getOdooApiKey()) {
            return $this->json(['error' => 'Clé API Odoo non configurée'], 400);
        }

        $this->odooService->configure($client);
        
        return null;
    }
}
