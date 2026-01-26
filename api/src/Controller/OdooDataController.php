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
