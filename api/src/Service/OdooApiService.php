<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Client;
use Psr\Log\LoggerInterface;

/**
 * Service pour communiquer avec l'API XML-RPC d'Odoo
 * 
 * Documentation Odoo External API:
 * https://www.odoo.com/documentation/17.0/developer/reference/external_api.html
 */
class OdooApiService
{
    private ?string $url = null;
    private ?string $db = null;
    private ?string $username = null;
    private ?string $password = null;
    private ?int $uid = null;

    public function __construct(
        private LoggerInterface $logger
    ) {}

    /**
     * Configure le service avec les paramètres du client
     */
    public function configure(Client $client): self
    {
        $this->url = $client->getOdooUrl();
        $this->db = $client->getOdooDatabase();
        $this->username = $client->getOdooUsername();
        $this->password = $client->getOdooApiKey();
        $this->uid = null; // Reset UID pour forcer une nouvelle authentification
        
        return $this;
    }

    /**
     * Vérifie si le service est correctement configuré
     */
    public function isConfigured(): bool
    {
        return $this->url && $this->db && $this->username && $this->password;
    }

    /**
     * Authentification auprès d'Odoo et récupération de l'UID
     */
    public function authenticate(): ?int
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('OdooApiService non configuré. Appelez configure() d\'abord.');
        }

        if ($this->uid !== null) {
            return $this->uid;
        }

        try {
            $commonUrl = rtrim($this->url, '/') . '/xmlrpc/2/common';
            
            $this->uid = $this->xmlRpcCall($commonUrl, 'authenticate', [
                $this->db,
                $this->username,
                $this->password,
                []
            ]);

            if (!$this->uid || $this->uid === false) {
                $this->logger->error('Odoo authentication failed', [
                    'url' => $this->url,
                    'db' => $this->db,
                    'username' => $this->username
                ]);
                return null;
            }

            $this->logger->info('Odoo authentication successful', ['uid' => $this->uid]);
            return $this->uid;

        } catch (\Throwable $e) {
            $this->logger->error('Odoo authentication error', [
                'error' => $e->getMessage(),
                'url' => $this->url
            ]);
            throw $e;
        }
    }

    /**
     * Récupère les informations de version d'Odoo
     */
    public function getVersion(): array
    {
        $commonUrl = rtrim($this->url, '/') . '/xmlrpc/2/common';
        return $this->xmlRpcCall($commonUrl, 'version', []);
    }

    /**
     * Exécute une requête sur un modèle Odoo
     */
    public function execute(string $model, string $method, array $args = [], array $kwargs = []): mixed
    {
        $uid = $this->authenticate();
        if (!$uid) {
            throw new \RuntimeException('Échec de l\'authentification Odoo');
        }

        $objectUrl = rtrim($this->url, '/') . '/xmlrpc/2/object';
        
        return $this->xmlRpcCall($objectUrl, 'execute_kw', [
            $this->db,
            $uid,
            $this->password,
            $model,
            $method,
            $args,
            $kwargs
        ]);
    }

    /**
     * Recherche des enregistrements
     */
    public function search(string $model, array $domain = [], int $limit = 0, int $offset = 0): array
    {
        $kwargs = [];
        if ($limit > 0) $kwargs['limit'] = $limit;
        if ($offset > 0) $kwargs['offset'] = $offset;
        
        return $this->execute($model, 'search', [$domain], $kwargs);
    }

    /**
     * Recherche et lecture des enregistrements en une seule requête
     */
    public function searchRead(string $model, array $domain = [], array $fields = [], int $limit = 0, int $offset = 0): array
    {
        $kwargs = [];
        if (!empty($fields)) $kwargs['fields'] = $fields;
        if ($limit > 0) $kwargs['limit'] = $limit;
        if ($offset > 0) $kwargs['offset'] = $offset;
        
        return $this->execute($model, 'search_read', [$domain], $kwargs);
    }

    /**
     * Lecture d'enregistrements par leurs IDs
     */
    public function read(string $model, array $ids, array $fields = []): array
    {
        $kwargs = [];
        if (!empty($fields)) $kwargs['fields'] = $fields;
        
        return $this->execute($model, 'read', [$ids], $kwargs);
    }

    /**
     * Compte les enregistrements
     */
    public function searchCount(string $model, array $domain = []): int
    {
        return $this->execute($model, 'search_count', [$domain]);
    }

    /**
     * Crée un enregistrement
     */
    public function create(string $model, array $values): int
    {
        return $this->execute($model, 'create', [$values]);
    }

    /**
     * Met à jour des enregistrements
     */
    public function write(string $model, array $ids, array $values): bool
    {
        return $this->execute($model, 'write', [$ids, $values]);
    }

    /**
     * Supprime des enregistrements
     */
    public function unlink(string $model, array $ids): bool
    {
        return $this->execute($model, 'unlink', [$ids]);
    }

    // =========================================================================
    // MÉTHODES MÉTIER SPÉCIFIQUES
    // =========================================================================

    /**
     * Récupère la liste des produits avec leurs packagings
     * 
     * @return array Liste des produits formatés pour l'application
     */
    public function getProducts(int $limit = 1000, int $offset = 0): array
    {
        // Récupérer les produits (product.product pour les variantes)
        // Champs compatibles Odoo 17/18/19
        // Note: uom_ids contient les conditionnements (packagings) dans Odoo 19
        $products = $this->searchRead(
            'product.product',
            [['purchase_ok', '=', true]], // Produits achetables
            [
                'id',
                'default_code',       // Code produit
                'name',               // Libellé
                'categ_id',           // Catégorie
                'qty_available',      // Quantité disponible
                'uom_id',             // Unité de mesure de base
                'uom_ids',            // Conditionnements (packagings) - Odoo 19
                'list_price',         // Prix de vente
                'standard_price',     // Prix d'achat standard
                'active',
            ],
            $limit,
            $offset
        );

        // Collecter tous les IDs de UoM (conditionnements) pour les récupérer en une seule requête
        $allUomIds = [];
        foreach ($products as $product) {
            if (!empty($product['uom_ids']) && is_array($product['uom_ids'])) {
                $allUomIds = array_merge($allUomIds, $product['uom_ids']);
            }
            // Ajouter aussi l'UoM de base
            if (!empty($product['uom_id'])) {
                $baseUomId = is_array($product['uom_id']) ? $product['uom_id'][0] : $product['uom_id'];
                $allUomIds[] = $baseUomId;
            }
        }
        $allUomIds = array_unique($allUomIds);

        // Récupérer les détails des UoM (conditionnements)
        $uomMap = [];
        if (!empty($allUomIds)) {
            try {
                $uoms = $this->read('uom.uom', array_values($allUomIds), ['id', 'name', 'factor', 'relative_factor']);
                foreach ($uoms as $uom) {
                    $uomMap[$uom['id']] = [
                        'id' => $uom['id'],
                        'name' => $uom['name'],
                        // relative_factor ou factor contient le nombre d'unités (ex: 6 pour "Sachet de 6")
                        'unit_factor' => $uom['relative_factor'] ?? $uom['factor'] ?? 1,
                        'unit' => 'unit',
                        'barcode' => null,
                    ];
                }
            } catch (\Throwable $e) {
                $this->logger->info('Could not fetch UoM details: ' . $e->getMessage());
            }
        }

        // Récupérer les catégories
        $categoryIds = array_filter(array_map(fn($p) => is_array($p['categ_id']) ? $p['categ_id'][0] : $p['categ_id'], $products));
        $categoriesMap = [];
        if (!empty($categoryIds)) {
            $categories = $this->read('product.category', array_unique($categoryIds), ['id', 'name', 'complete_name']);
            foreach ($categories as $cat) {
                $categoriesMap[$cat['id']] = [
                    'id' => $cat['id'],
                    'name' => $cat['name'],
                    'complete_name' => $cat['complete_name'] ?? $cat['name'],
                ];
            }
        }

        // Formater les produits pour correspondre au format attendu par l'application
        $formattedProducts = [];
        foreach ($products as $product) {
            $categoryId = is_array($product['categ_id']) ? $product['categ_id'][0] : $product['categ_id'];
            
            // Construire les packagings à partir de uom_ids (Odoo 19)
            $productPackagings = [];
            
            // Ajouter l'unité de base en premier
            $baseUomId = is_array($product['uom_id']) ? $product['uom_id'][0] : ($product['uom_id'] ?? 0);
            $baseUomName = is_array($product['uom_id']) ? ($product['uom_id'][1] ?? 'Unité') : 'Unité';
            
            $productPackagings[] = [
                'id' => $baseUomId,
                'name' => $baseUomName,
                'unit_factor' => 1,
                'unit' => 'unit',
                'barcode' => null,
            ];
            
            // Ajouter les conditionnements supplémentaires depuis uom_ids
            if (!empty($product['uom_ids']) && is_array($product['uom_ids'])) {
                foreach ($product['uom_ids'] as $uomId) {
                    // Ne pas dupliquer l'unité de base
                    if ($uomId != $baseUomId && isset($uomMap[$uomId])) {
                        $productPackagings[] = $uomMap[$uomId];
                    }
                }
            }
            
            $formattedProducts[] = [
                'id' => $product['id'],
                'code' => $product['default_code'] ?? '',
                'label' => $product['name'],
                'category' => $categoriesMap[$categoryId] ?? null,
                'availableQuantity' => $product['qty_available'] ?? 0,
                'packagings' => $productPackagings,
                'taxes' => [], // À enrichir si nécessaire
                'custom_fields' => [], // Odoo utilise des champs personnalisés différemment
                'stockManagement' => true,
                'deleted' => !($product['active'] ?? true),
                'unitPrice' => $product['standard_price'] ?? 0,
            ];
        }

        return $formattedProducts;
    }

    /**
     * Récupère un produit par son ID
     */
    public function getProduct(int $id): ?array
    {
        // Recherche spécifique par ID
        // Note: uom_ids contient les conditionnements (packagings) dans Odoo 19
        $product = $this->searchRead(
            'product.product',
            [['id', '=', $id]],
            [
                'id', 'default_code', 'name', 'categ_id', 'qty_available',
                'uom_id', 'uom_ids', 'list_price', 'standard_price', 'active'
            ],
            1
        );

        if (empty($product)) {
            return null;
        }

        $p = $product[0];
        $categoryId = is_array($p['categ_id']) ? $p['categ_id'][0] : $p['categ_id'];
        
        $category = null;
        if ($categoryId) {
            $cats = $this->read('product.category', [$categoryId], ['id', 'name']);
            $category = !empty($cats) ? ['id' => $cats[0]['id'], 'name' => $cats[0]['name']] : null;
        }

        // Construire les packagings à partir de uom_ids (Odoo 19)
        $packagings = [];
        
        // Ajouter l'unité de base en premier
        $baseUomId = is_array($p['uom_id']) ? $p['uom_id'][0] : ($p['uom_id'] ?? 0);
        $baseUomName = is_array($p['uom_id']) ? ($p['uom_id'][1] ?? 'Unité') : 'Unité';
        
        $packagings[] = [
            'id' => $baseUomId,
            'name' => $baseUomName,
            'unit_factor' => 1,
            'unit' => 'unit',
            'barcode' => null,
        ];
        
        // Ajouter les conditionnements supplémentaires depuis uom_ids
        if (!empty($p['uom_ids']) && is_array($p['uom_ids'])) {
            try {
                $uoms = $this->read('uom.uom', $p['uom_ids'], ['id', 'name', 'factor', 'relative_factor']);
                foreach ($uoms as $uom) {
                    // Ne pas dupliquer l'unité de base
                    if ($uom['id'] != $baseUomId) {
                        $packagings[] = [
                            'id' => $uom['id'],
                            'name' => $uom['name'],
                            'unit_factor' => $uom['relative_factor'] ?? $uom['factor'] ?? 1,
                            'unit' => 'unit',
                            'barcode' => null,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                $this->logger->info('Could not fetch UoM details for product ' . $id . ': ' . $e->getMessage());
            }
        }

        return [
            'id' => $p['id'],
            'code' => $p['default_code'] ?? '',
            'label' => $p['name'],
            'category' => $category,
            'availableQuantity' => $p['qty_available'] ?? 0,
            'packagings' => $packagings,
            'taxes' => [],
            'custom_fields' => [],
            'stockManagement' => true,
            'deleted' => !($p['active'] ?? true),
            'unitPrice' => $p['standard_price'] ?? 0,
        ];
    }

    /**
     * Récupère la liste des fournisseurs
     */
    public function getSuppliers(int $limit = 1000, int $offset = 0): array
    {
        // Récupérer tous les partenaires qui peuvent être utilisés comme fournisseurs
        // On inclut les entreprises ET les contacts avec supplier_rank > 0
        // Le filtre '|' est un OR dans Odoo
        $suppliers = $this->searchRead(
            'res.partner',
            [
                '|',
                ['supplier_rank', '>', 0],  // Partenaires marqués comme fournisseurs
                ['is_company', '=', true],  // Ou toutes les entreprises
            ],
            [
                'id',
                'name',
                'ref',           // Référence interne
                'email',
                'phone',
                'street',
                'city',
                'zip',
                'country_id',
                'vat',           // Numéro de TVA
                'active',
            ],
            $limit,
            $offset
        );

        $formattedSuppliers = [];
        foreach ($suppliers as $supplier) {
            $formattedSuppliers[] = [
                'id' => $supplier['id'],
                'name' => $supplier['name'],
                'ref' => $supplier['ref'] ?? '',
                'email' => $supplier['email'] ?? '',
                'phone' => $supplier['phone'] ?? '',
                'address' => $supplier['street'] ?? '',
                'city' => $supplier['city'] ?? '',
                'zip' => $supplier['zip'] ?? '',
                'country' => is_array($supplier['country_id']) ? $supplier['country_id'][1] : null,
                'vat' => $supplier['vat'] ?? '',
                'active' => $supplier['active'] ?? true,
            ];
        }

        return $formattedSuppliers;
    }

    /**
     * Crée une demande de devis (Request For Quotation) dans Odoo
     * 
     * @param int $supplierId ID du fournisseur
     * @param array $lines Lignes de commande [['product_id' => int, 'quantity' => float, 'price_unit' => float], ...]
     * @param array $options Options supplémentaires (date_order, notes, etc.)
     * @return array Informations sur le RFQ créé
     */
    public function createRFQ(int $supplierId, array $lines, array $options = []): array
    {
        // Créer l'en-tête du bon de commande fournisseur
        // Note: Dans Odoo 19, le champ s'appelle 'note' (singulier) pas 'notes'
        $orderData = [
            'partner_id' => $supplierId,
            'state' => 'draft',  // RFQ = brouillon
            'date_order' => $options['date_order'] ?? date('Y-m-d H:i:s'),
        ];
        
        // Ajouter les notes si fournies
        if (!empty($options['notes'])) {
            $orderData['note'] = $options['notes'];
        }

        // Ajouter la référence origine si fournie
        if (!empty($options['origin'])) {
            $orderData['origin'] = $options['origin'];
        }

        // Créer le bon de commande
        $orderId = $this->create('purchase.order', $orderData);

        // Créer les lignes de commande
        foreach ($lines as $line) {
            $lineData = [
                'order_id' => $orderId,
                'product_id' => $line['product_id'],
                'product_qty' => $line['quantity'],
                'price_unit' => $line['price_unit'],  // Prix de revient rapproché
            ];

            // Ajouter la description si fournie
            if (!empty($line['name'])) {
                $lineData['name'] = $line['name'];
            }

            // Ajouter l'unité de mesure si fournie
            // Note: Dans Odoo 19, le champ s'appelle 'product_uom_id' pas 'product_uom'
            if (!empty($line['product_uom'])) {
                $lineData['product_uom_id'] = $line['product_uom'];
            }

            $this->create('purchase.order.line', $lineData);
        }

        // Récupérer les informations du RFQ créé
        $rfq = $this->read('purchase.order', [$orderId], [
            'id', 'name', 'partner_id', 'date_order', 'amount_total', 'state', 'order_line'
        ]);

        return [
            'success' => true,
            'rfq_id' => $orderId,
            'rfq_name' => $rfq[0]['name'] ?? "PO{$orderId}",
            'supplier' => is_array($rfq[0]['partner_id']) ? $rfq[0]['partner_id'][1] : $rfq[0]['partner_id'],
            'amount_total' => $rfq[0]['amount_total'] ?? 0,
            'state' => $rfq[0]['state'] ?? 'draft',
            'lines_count' => count($lines),
        ];
    }

    /**
     * Confirme un RFQ en bon de commande
     */
    public function confirmRFQ(int $orderId): bool
    {
        $this->safeExecute('purchase.order', 'button_confirm', [[$orderId]]);
        return true;
    }

    /**
     * Crée une commande fournisseur confirmée dans Odoo
     * 
     * Cette méthode crée directement un bon de commande avec les prix de revient calculés.
     * La commande est automatiquement confirmée (state = 'purchase').
     * 
     * @param int $supplierId ID du fournisseur dans Odoo
     * @param array $lines Lignes de commande avec prix de revient
     *        [['product_id' => int, 'product_qty' => float, 'price_unit' => float, 'product_uom' => int, 'name' => string], ...]
     * @param array $options Options (date_order, date_planned, origin, notes)
     * @return array Informations sur la commande créée
     */
    public function createPurchaseOrder(int $supplierId, array $lines, array $options = []): array
    {
        // Créer l'en-tête du bon de commande fournisseur
        // Note: Dans Odoo 19, le champ s'appelle 'note' (singulier) pas 'notes'
        $orderData = [
            'partner_id' => $supplierId,
            'date_order' => $options['date_order'] ?? date('Y-m-d H:i:s'),
        ];
        
        // Ajouter les notes si fournies (champ 'note' dans Odoo 19)
        if (!empty($options['notes'])) {
            $orderData['note'] = $options['notes'];
        }

        // Ajouter la date de livraison prévue si fournie
        if (!empty($options['date_planned'])) {
            $orderData['date_planned'] = $options['date_planned'];
        }

        // Ajouter la référence origine si fournie
        if (!empty($options['origin'])) {
            $orderData['origin'] = $options['origin'];
        }

        // Créer le bon de commande en brouillon d'abord
        $orderId = $this->create('purchase.order', $orderData);

        // Créer les lignes de commande (tolérant aux produits manquants)
        $skippedLines = [];
        $addedLines = 0;
        foreach ($lines as $line) {
            $lineData = [
                'order_id' => $orderId,
                'product_id' => $line['product_id'],
                'product_qty' => $line['product_qty'],
                'price_unit' => $line['price_unit'],
            ];

            if (!empty($line['name'])) {
                $lineData['name'] = $line['name'];
            }

            try {
                $this->create('purchase.order.line', $lineData);
                $addedLines++;
            } catch (\Throwable $e) {
                $productDesc = $line['name'] ?? "product_id={$line['product_id']}";
                $skippedLines[] = "Produit #{$line['product_id']} ignoré : {$e->getMessage()}";
                $this->logger->warning("PO line skipped for product {$line['product_id']}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($addedLines === 0) {
            try {
                $this->safeExecute('purchase.order', 'button_cancel', [[$orderId]]);
                $this->execute('purchase.order', 'unlink', [[$orderId]]);
            } catch (\Throwable $e) {
                // ignore cleanup errors
            }
            throw new \RuntimeException(
                "Aucune ligne n'a pu être ajoutée au PO. " . implode(' | ', $skippedLines)
            );
        }

        // Lire le PO AVANT confirmation pour garantir qu'on a le nom même si confirm échoue
        $order = $this->read('purchase.order', [$orderId], [
            'id', 'name', 'partner_id', 'date_order', 'date_planned',
            'amount_untaxed', 'amount_total', 'state', 'order_line', 'origin'
        ]);

        // Confirmer la commande (tolérant aux erreurs XML-RPC "cannot marshal None")
        try {
            $this->confirmRFQ($orderId);
        } catch (\Throwable $e) {
            $this->logger->warning('PO confirmation error (PO still created)', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);
        }

        // Relire pour avoir le state à jour après confirmation
        try {
            $order = $this->read('purchase.order', [$orderId], [
                'id', 'name', 'partner_id', 'date_order', 'date_planned',
                'amount_untaxed', 'amount_total', 'state', 'order_line', 'origin'
            ]);
        } catch (\Throwable $e) {
            // Garder les données d'avant confirmation
        }

        $result = [
            'success' => true,
            'order_id' => $orderId,
            'order_name' => $order[0]['name'] ?? "PO{$orderId}",
            'supplier' => is_array($order[0]['partner_id']) ? $order[0]['partner_id'][1] : $order[0]['partner_id'],
            'amount_untaxed' => $order[0]['amount_untaxed'] ?? 0,
            'amount_total' => $order[0]['amount_total'] ?? 0,
            'state' => $order[0]['state'] ?? 'draft',
            'origin' => $order[0]['origin'] ?? '',
            'lines_count' => $addedLines,
        ];

        if (!empty($skippedLines)) {
            $result['warnings'] = $skippedLines;
            $result['skipped_count'] = count($skippedLines);
        }

        return $result;
    }

    // =========================================================================
    // MÉTHODES TRANSIT / STOCK
    // =========================================================================

    /**
     * Récupère les emplacements de stock
     */
    public function getStockLocations(): array
    {
        return $this->searchRead(
            'stock.location',
            [['usage', 'in', ['internal', 'transit']]],
            ['id', 'name', 'complete_name', 'usage', 'active']
        );
    }

    /**
     * Crée et valide un transfert de stock interne entre deux emplacements
     *
     * @param int $locationSrcId Emplacement source
     * @param int $locationDestId Emplacement destination
     * @param array $products Produits à transférer [['product_id' => int, 'qty' => float], ...]
     * @param string $origin Référence d'origine (ex: "HAREL-42")
     */
    public function createStockTransfer(int $locationSrcId, int $locationDestId, array $products, string $origin = ''): array
    {
        $pickingTypeId = $this->getInternalPickingTypeId();

        // Ensure source location has stock before creating the transfer.
        // Without this, Odoo creates negative quants at source.
        $this->ensureSourceStock($locationSrcId, $products);

        $picking = $this->create('stock.picking', [
            'picking_type_id' => $pickingTypeId,
            'location_id' => $locationSrcId,
            'location_dest_id' => $locationDestId,
            'origin' => $origin,
            'scheduled_date' => date('Y-m-d H:i:s'),
        ]);

        $moveIds = [];
        foreach ($products as $p) {
            $moveIds[] = $this->create('stock.move', [
                'picking_id' => $picking,
                'product_id' => $p['product_id'],
                'product_uom_qty' => $p['qty'],
                'location_id' => $locationSrcId,
                'location_dest_id' => $locationDestId,
            ]);
        }

        $this->safeExecute('stock.picking', 'action_confirm', [[$picking]]);

        foreach ($moveIds as $moveId) {
            $this->write('stock.move', [$moveId], ['quantity' => 0]);
        }
        $moves = $this->read('stock.move', $moveIds, ['id', 'product_uom_qty']);
        foreach ($moves as $move) {
            $this->write('stock.move', [$move['id']], [
                'quantity' => $move['product_uom_qty'],
            ]);
        }

        $this->safeExecute('stock.picking', 'button_validate', [[$picking]]);

        $result = $this->read('stock.picking', [$picking], ['id', 'name', 'state', 'origin']);
        $state = $result[0]['state'] ?? 'unknown';

        if ($state !== 'done') {
            $this->logger->warning('Picking not done after validate, attempting force', [
                'picking_id' => $picking, 'state' => $state,
            ]);
            try {
                $this->safeExecute('stock.picking', 'action_set_quantities_to_reservation', [[$picking]]);
                $this->safeExecute('stock.picking', 'button_validate', [[$picking]]);
                $result = $this->read('stock.picking', [$picking], ['id', 'name', 'state', 'origin']);
                $state = $result[0]['state'] ?? 'unknown';
            } catch (\Throwable $e) {
                $this->logger->warning('Force validate failed', ['error' => $e->getMessage()]);
            }
        }

        // Reconcile quants: zero out source, set correct qty at destination
        $this->reconcileTransitQuants($locationSrcId, $locationDestId, $products);

        return [
            'success' => true,
            'picking_id' => $picking,
            'picking_name' => $result[0]['name'] ?? '',
            'state' => $state,
        ];
    }

    /**
     * Ensures products have sufficient stock at source before a transfer.
     * Uses inventory adjustments to create stock if missing.
     */
    private function ensureSourceStock(int $locationId, array $products): void
    {
        $ctx = ['context' => ['inventory_mode' => true]];

        foreach ($products as $p) {
            $productId = $p['product_id'];
            $requiredQty = $p['qty'];

            $quants = $this->searchRead('stock.quant', [
                ['product_id', '=', $productId],
                ['location_id', '=', $locationId],
            ], ['id', 'quantity'], 1);

            $currentQty = $quants[0]['quantity'] ?? 0;

            if ($currentQty >= $requiredQty) {
                continue;
            }

            try {
                if (!empty($quants)) {
                    $this->execute('stock.quant', 'write', [
                        [$quants[0]['id']], ['inventory_quantity' => $requiredQty],
                    ], $ctx);
                    $this->safeExecute('stock.quant', 'action_apply_inventory', [[$quants[0]['id']]], $ctx);
                } else {
                    $qId = $this->execute('stock.quant', 'create', [
                        ['product_id' => $productId, 'location_id' => $locationId, 'inventory_quantity' => $requiredQty],
                    ], $ctx);
                    $this->safeExecute('stock.quant', 'action_apply_inventory', [[$qId]], $ctx);
                }
            } catch (\Throwable $e) {
                $this->logger->warning('ensureSourceStock failed', [
                    'product_id' => $productId, 'location_id' => $locationId,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * After a transit transfer, reconcile quants to guarantee coherence:
     * source location → 0, destination location → expected qty.
     */
    private function reconcileTransitQuants(int $srcLocationId, int $destLocationId, array $products): void
    {
        $ctx = ['context' => ['inventory_mode' => true]];

        foreach ($products as $p) {
            $productId = $p['product_id'];
            $expectedQty = $p['qty'];

            // Zero out source
            $srcQuants = $this->searchRead('stock.quant', [
                ['product_id', '=', $productId],
                ['location_id', '=', $srcLocationId],
            ], ['id', 'quantity'], 1);

            if (!empty($srcQuants) && $srcQuants[0]['quantity'] != 0) {
                try {
                    $this->execute('stock.quant', 'write', [
                        [$srcQuants[0]['id']], ['inventory_quantity' => 0],
                    ], $ctx);
                    $this->safeExecute('stock.quant', 'action_apply_inventory', [[$srcQuants[0]['id']]], $ctx);
                } catch (\Throwable $e) {
                    $this->logger->warning('Reconcile: zero source failed', [
                        'quant_id' => $srcQuants[0]['id'], 'error' => $e->getMessage(),
                    ]);
                }
            }

            // Set correct qty at destination
            $destQuants = $this->searchRead('stock.quant', [
                ['product_id', '=', $productId],
                ['location_id', '=', $destLocationId],
            ], ['id', 'quantity'], 1);

            try {
                if (!empty($destQuants)) {
                    if ($destQuants[0]['quantity'] != $expectedQty) {
                        $this->execute('stock.quant', 'write', [
                            [$destQuants[0]['id']], ['inventory_quantity' => $expectedQty],
                        ], $ctx);
                        $this->safeExecute('stock.quant', 'action_apply_inventory', [[$destQuants[0]['id']]], $ctx);
                    }
                } else {
                    $qId = $this->execute('stock.quant', 'create', [
                        ['product_id' => $productId, 'location_id' => $destLocationId, 'inventory_quantity' => $expectedQty],
                    ], $ctx);
                    $this->safeExecute('stock.quant', 'action_apply_inventory', [[$qId]], $ctx);
                }
            } catch (\Throwable $e) {
                $this->logger->warning('Reconcile: set dest failed', [
                    'product_id' => $productId, 'location_id' => $destLocationId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->logger->info('Transit quants reconciled', [
            'src' => $srcLocationId, 'dest' => $destLocationId,
            'products' => count($products),
        ]);
    }

    /**
     * Execute an Odoo method, treating "cannot marshal None" errors as success
     */
    private function safeExecute(string $model, string $method, array $args = [], array $kwargs = []): mixed
    {
        try {
            return $this->execute($model, $method, $args, $kwargs);
        } catch (\RuntimeException $e) {
            if (str_contains($e->getMessage(), 'cannot marshal None')) {
                $this->logger->info("$model.$method returned None (treated as success)");
                return true;
            }
            throw $e;
        }
    }

    /**
     * Annule un bon de commande dans Odoo
     */
    public function cancelPurchaseOrder(int $orderId): bool
    {
        $this->safeExecute('purchase.order', 'button_cancel', [[$orderId]]);
        return true;
    }

    /**
     * Met à jour les prix des lignes d'un bon de commande existant
     *
     * @param int $orderId ID du PO
     * @param array $lines [['line_id' => int, 'price_unit' => float], ...] ou [['product_id' => int, 'price_unit' => float], ...]
     */
    public function updatePurchaseOrderLines(int $orderId, array $lines): bool
    {
        $orderLines = $this->searchRead(
            'purchase.order.line',
            [['order_id', '=', $orderId]],
            ['id', 'product_id', 'price_unit']
        );

        foreach ($lines as $update) {
            $targetLine = null;

            if (!empty($update['line_id'])) {
                $targetLine = array_filter($orderLines, fn($l) => $l['id'] === $update['line_id']);
                $targetLine = reset($targetLine) ?: null;
            } elseif (!empty($update['product_id'])) {
                $productId = $update['product_id'];
                $targetLine = array_filter($orderLines, function ($l) use ($productId) {
                    $lpId = is_array($l['product_id']) ? $l['product_id'][0] : $l['product_id'];
                    return $lpId === $productId;
                });
                $targetLine = reset($targetLine) ?: null;
            }

            if ($targetLine) {
                $this->write('purchase.order.line', [$targetLine['id']], [
                    'price_unit' => $update['price_unit'],
                ]);
            }
        }

        return true;
    }

    /**
     * Récupère les stock.picking liés à un PO via son champ origin
     */
    public function getStockPickingsByOrigin(string $origin): array
    {
        return $this->searchRead(
            'stock.picking',
            [['origin', 'ilike', $origin]],
            ['id', 'name', 'state', 'origin', 'scheduled_date', 'date_done', 'picking_type_id', 'location_id', 'location_dest_id']
        );
    }

    /**
     * Récupère l'état d'un picking et ses mouvements
     */
    public function getStockPickingState(int $pickingId): array
    {
        $picking = $this->read('stock.picking', [$pickingId], [
            'id', 'name', 'state', 'origin', 'date_done',
            'move_ids', 'backorder_id'
        ]);

        if (empty($picking)) {
            return ['found' => false];
        }

        $p = $picking[0];
        $moves = [];
        if (!empty($p['move_ids'])) {
            $moves = $this->read('stock.move', $p['move_ids'], [
                'id', 'product_id', 'product_uom_qty', 'quantity', 'state'
            ]);
        }

        return [
            'found' => true,
            'id' => $p['id'],
            'name' => $p['name'],
            'state' => $p['state'],
            'date_done' => $p['date_done'] ?? null,
            'has_backorder' => !empty($p['backorder_id']),
            'backorder_id' => is_array($p['backorder_id']) ? $p['backorder_id'][0] : $p['backorder_id'],
            'moves' => array_map(fn($m) => [
                'product_id' => is_array($m['product_id']) ? $m['product_id'][0] : $m['product_id'],
                'product_name' => is_array($m['product_id']) ? $m['product_id'][1] : '',
                'qty_expected' => $m['product_uom_qty'] ?? 0,
                'qty_done' => $m['quantity'] ?? 0,
                'state' => $m['state'] ?? '',
            ], $moves),
        ];
    }

    /**
     * Récupère le stock dans un emplacement.
     * Essaie stock.quant d'abord, fallback sur stock.move si vide.
     */
    public function getStockAtLocation(int $locationId): array
    {
        $location = $this->read('stock.location', [$locationId], ['id', 'name', 'complete_name', 'usage']);
        $locationName = $location[0]['complete_name'] ?? $location[0]['name'] ?? "Location #$locationId";
        $usage = $location[0]['usage'] ?? 'unknown';

        $quants = $this->searchRead(
            'stock.quant',
            [['location_id', '=', $locationId], ['quantity', '>', 0]],
            ['product_id', 'quantity', 'reserved_quantity', 'in_date']
        );

        if (!empty($quants)) {
            $products = [];
            foreach ($quants as $q) {
                $pid = is_array($q['product_id']) ? $q['product_id'][0] : $q['product_id'];
                $pname = is_array($q['product_id']) ? $q['product_id'][1] : '';
                $products[] = [
                    'product_id' => $pid,
                    'product_name' => $pname,
                    'quantity' => $q['quantity'] ?? 0,
                    'reserved' => $q['reserved_quantity'] ?? 0,
                    'available' => ($q['quantity'] ?? 0) - ($q['reserved_quantity'] ?? 0),
                    'since' => $q['in_date'] ?? null,
                ];
            }
            return [
                'location_id' => $locationId,
                'location_name' => $locationName,
                'location_usage' => $usage,
                'source' => 'stock.quant',
                'products' => $products,
                'total_products' => count($products),
                'total_quantity' => array_sum(array_column($products, 'quantity')),
            ];
        }

        return $this->getStockAtLocationViaMoves($locationId, $locationName, $usage);
    }

    /**
     * Calcul du stock logique via stock.move (fallback quand stock.quant est vide)
     */
    private function getStockAtLocationViaMoves(int $locationId, string $locationName, string $usage): array
    {
        $inMoves = $this->searchRead(
            'stock.move',
            [['location_dest_id', '=', $locationId], ['state', '=', 'done']],
            ['product_id', 'quantity', 'date']
        );

        $outMoves = $this->searchRead(
            'stock.move',
            [['location_id', '=', $locationId], ['state', '=', 'done']],
            ['product_id', 'quantity']
        );

        $stock = [];
        foreach ($inMoves as $m) {
            $pid = is_array($m['product_id']) ? $m['product_id'][0] : $m['product_id'];
            $pname = is_array($m['product_id']) ? $m['product_id'][1] : '';
            if (!isset($stock[$pid])) {
                $stock[$pid] = ['product_id' => $pid, 'product_name' => $pname, 'in' => 0, 'out' => 0, 'last_in' => null];
            }
            $stock[$pid]['in'] += $m['quantity'] ?? 0;
            $date = $m['date'] ?? null;
            if ($date && (!$stock[$pid]['last_in'] || $date > $stock[$pid]['last_in'])) {
                $stock[$pid]['last_in'] = $date;
            }
        }
        foreach ($outMoves as $m) {
            $pid = is_array($m['product_id']) ? $m['product_id'][0] : $m['product_id'];
            $pname = is_array($m['product_id']) ? $m['product_id'][1] : '';
            if (!isset($stock[$pid])) {
                $stock[$pid] = ['product_id' => $pid, 'product_name' => $pname, 'in' => 0, 'out' => 0, 'last_in' => null];
            }
            $stock[$pid]['out'] += $m['quantity'] ?? 0;
        }

        $products = [];
        foreach ($stock as $s) {
            $balance = $s['in'] - $s['out'];
            if ($balance > 0) {
                $products[] = [
                    'product_id' => $s['product_id'],
                    'product_name' => $s['product_name'],
                    'quantity' => $balance,
                    'reserved' => 0,
                    'available' => $balance,
                    'since' => $s['last_in'],
                ];
            }
        }

        return [
            'location_id' => $locationId,
            'location_name' => $locationName,
            'location_usage' => $usage,
            'source' => 'stock.move',
            'products' => $products,
            'total_products' => count($products),
            'total_quantity' => array_sum(array_column($products, 'quantity')),
        ];
    }

    /**
     * Valide le picking de réception d'un PO (fait passer receipt_status à "full")
     */
    public function validatePurchaseOrderReceipt(int $orderId): array
    {
        $order = $this->read('purchase.order', [$orderId], ['name', 'receipt_status']);
        $poName = $order[0]['name'] ?? "PO#$orderId";

        $pickings = $this->searchRead(
            'stock.picking',
            [['origin', '=', $poName], ['state', 'not in', ['done', 'cancel']]],
            ['id', 'name', 'state', 'move_ids']
        );

        if (empty($pickings)) {
            return [
                'success' => false,
                'message' => 'Aucun picking de réception en attente pour ce PO',
                'receipt_status' => $order[0]['receipt_status'] ?? 'unknown',
            ];
        }

        $validated = [];
        foreach ($pickings as $picking) {
            $pickingId = $picking['id'];
            $moveIds = $picking['move_ids'] ?? [];

            if (!empty($moveIds)) {
                $moves = $this->read('stock.move', $moveIds, ['id', 'product_uom_qty']);
                foreach ($moves as $move) {
                    $this->write('stock.move', [$move['id']], [
                        'quantity' => $move['product_uom_qty'],
                    ]);
                }
            }

            if ($picking['state'] === 'draft') {
                $this->safeExecute('stock.picking', 'action_confirm', [[$pickingId]]);
            }

            $this->safeExecute('stock.picking', 'button_validate', [[$pickingId]]);

            $result = $this->read('stock.picking', [$pickingId], ['id', 'name', 'state']);
            $validated[] = [
                'picking_id' => $pickingId,
                'picking_name' => $result[0]['name'] ?? '',
                'state' => $result[0]['state'] ?? 'unknown',
            ];
        }

        $updatedOrder = $this->read('purchase.order', [$orderId], ['receipt_status']);

        return [
            'success' => true,
            'pickings_validated' => $validated,
            'receipt_status' => $updatedOrder[0]['receipt_status'] ?? 'unknown',
        ];
    }

    /**
     * Récupère l'historique des mouvements pour un emplacement
     */
    public function getMovementHistory(int $locationId, int $limit = 50): array
    {
        $moves = $this->searchRead(
            'stock.move',
            [['|', ['location_id', '=', $locationId], ['location_dest_id', '=', $locationId]], ['state', '=', 'done']],
            ['product_id', 'quantity', 'date', 'origin', 'location_id', 'location_dest_id', 'picking_id'],
            $limit
        );

        return array_map(function ($m) use ($locationId) {
            $isIncoming = (is_array($m['location_dest_id']) ? $m['location_dest_id'][0] : $m['location_dest_id']) === $locationId;
            return [
                'product_id' => is_array($m['product_id']) ? $m['product_id'][0] : $m['product_id'],
                'product_name' => is_array($m['product_id']) ? $m['product_id'][1] : '',
                'quantity' => $m['quantity'] ?? 0,
                'date' => $m['date'] ?? null,
                'origin' => $m['origin'] ?? '',
                'picking' => is_array($m['picking_id']) ? $m['picking_id'][1] : '',
                'direction' => $isIncoming ? 'in' : 'out',
                'from' => is_array($m['location_id']) ? $m['location_id'][1] : '',
                'to' => is_array($m['location_dest_id']) ? $m['location_dest_id'][1] : '',
            ];
        }, $moves);
    }

    private const TRANSIT_STATUS_MAP = [
        'BROUILLON' => 'brouillon',
        'ENVOYE' => 'envoye',
        'EN_MER' => 'en_mer',
        'AU_PORT' => 'au_port',
        'DOUANE' => 'douane',
        'A_RECEPTIONNER' => 'a_receptionner',
        'RECU' => 'recu',
    ];

    /**
     * Met à jour le champ x_statut_transit sur le PO Odoo
     */
    public function updatePurchaseOrderTransitStatus(int $orderId, string $appStatusCode): void
    {
        $odooValue = self::TRANSIT_STATUS_MAP[$appStatusCode] ?? null;
        if (!$odooValue) {
            $this->logger->warning('Unknown transit status code', ['code' => $appStatusCode]);
            return;
        }

        try {
            $this->write('purchase.order', [$orderId], ['x_statut_transit' => $odooValue]);
        } catch (\Throwable $e) {
            $this->logger->warning('Failed to update transit status on PO', [
                'order_id' => $orderId,
                'status' => $odooValue,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Retourne les produits des PO ayant un x_statut_transit donné
     */
    public function getStockByTransitStatus(string $appStatusCode): array
    {
        $odooValue = self::TRANSIT_STATUS_MAP[$appStatusCode] ?? null;
        if (!$odooValue) {
            return ['transit_status' => $appStatusCode, 'purchase_orders' => 0, 'products' => [], 'total_products' => 0, 'total_quantity' => 0];
        }

        $pos = $this->searchRead('purchase.order', [
            ['x_statut_transit', '=', $odooValue],
            ['state', 'in', ['draft', 'purchase', 'done']],
        ], ['id', 'name', 'order_line']);

        $products = [];
        foreach ($pos as $po) {
            $lineIds = $po['order_line'] ?? [];
            if (empty($lineIds)) continue;

            $lines = $this->read('purchase.order.line', $lineIds, [
                'product_id', 'product_qty', 'price_unit', 'price_subtotal',
            ]);

            foreach ($lines as $line) {
                $pid = is_array($line['product_id']) ? $line['product_id'][0] : $line['product_id'];
                $pname = is_array($line['product_id']) ? $line['product_id'][1] : '?';
                $products[] = [
                    'product_id' => $pid,
                    'product_name' => $pname,
                    'quantity' => $line['product_qty'] ?? 0,
                    'price_unit' => $line['price_unit'] ?? 0,
                    'price_subtotal' => $line['price_subtotal'] ?? 0,
                    'po_name' => $po['name'],
                    'po_id' => $po['id'],
                ];
            }
        }

        return [
            'transit_status' => $odooValue,
            'purchase_orders' => count($pos),
            'products' => $products,
            'total_products' => count($products),
            'total_quantity' => array_sum(array_column($products, 'quantity')),
        ];
    }

    /**
     * Poste un message dans le chatter d'un bon de commande Odoo
     */
    public function postPurchaseOrderMessage(int $orderId, string $body): void
    {
        try {
            $this->execute('purchase.order', 'message_post', [[$orderId]], [
                'body' => $body,
                'message_type' => 'comment',
                'subtype_xmlid' => 'mail.mt_note',
            ]);
        } catch (\Throwable $e) {
            $this->logger->warning('Failed to post message on PO', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Récupère les compteurs de stock pour plusieurs emplacements.
     * Essaie stock.quant d'abord, fallback stock.move pour les locations vides.
     *
     * @param int[] $locationIds
     * @return array<int, array{total_products: int, total_quantity: float}>
     */
    public function getStockCountsBatch(array $locationIds): array
    {
        if (empty($locationIds)) {
            return [];
        }

        $quants = $this->searchRead(
            'stock.quant',
            [['location_id', 'in', $locationIds], ['quantity', '>', 0]],
            ['product_id', 'quantity', 'location_id']
        );

        $stock = [];
        foreach ($locationIds as $locId) {
            $stock[$locId] = [];
        }

        foreach ($quants as $q) {
            $locId = is_array($q['location_id']) ? $q['location_id'][0] : $q['location_id'];
            $pid = is_array($q['product_id']) ? $q['product_id'][0] : $q['product_id'];
            $stock[$locId][$pid] = ($stock[$locId][$pid] ?? 0) + ($q['quantity'] ?? 0);
        }

        $emptyLocIds = array_values(array_filter($locationIds, fn($id) => empty($stock[$id])));

        if (!empty($emptyLocIds)) {
            $inMoves = $this->searchRead(
                'stock.move',
                [['location_dest_id', 'in', $emptyLocIds], ['state', '=', 'done']],
                ['product_id', 'quantity', 'location_dest_id']
            );
            $outMoves = $this->searchRead(
                'stock.move',
                [['location_id', 'in', $emptyLocIds], ['state', '=', 'done']],
                ['product_id', 'quantity', 'location_id']
            );
            foreach ($inMoves as $m) {
                $locId = is_array($m['location_dest_id']) ? $m['location_dest_id'][0] : $m['location_dest_id'];
                $pid = is_array($m['product_id']) ? $m['product_id'][0] : $m['product_id'];
                $stock[$locId][$pid] = ($stock[$locId][$pid] ?? 0) + ($m['quantity'] ?? 0);
            }
            foreach ($outMoves as $m) {
                $locId = is_array($m['location_id']) ? $m['location_id'][0] : $m['location_id'];
                $pid = is_array($m['product_id']) ? $m['product_id'][0] : $m['product_id'];
                $stock[$locId][$pid] = ($stock[$locId][$pid] ?? 0) - ($m['quantity'] ?? 0);
            }
        }

        $result = [];
        foreach ($locationIds as $locId) {
            $products = array_filter($stock[$locId] ?? [], fn($qty) => $qty > 0);
            $result[$locId] = [
                'total_products' => count($products),
                'total_quantity' => array_sum($products),
            ];
        }

        return $result;
    }

    /**
     * Recherche un fournisseur par nom (côté serveur)
     */
    public function findSupplierByName(string $name): ?array
    {
        $suppliers = $this->searchRead(
            'res.partner',
            [['name', 'ilike', trim($name)], '|', ['supplier_rank', '>', 0], ['is_company', '=', true]],
            ['id', 'name'],
            5
        );

        $normalizedName = mb_strtolower(trim($name));
        foreach ($suppliers as $s) {
            if (mb_strtolower(trim($s['name'])) === $normalizedName) {
                return ['id' => $s['id'], 'name' => $s['name']];
            }
        }

        return !empty($suppliers) ? ['id' => $suppliers[0]['id'], 'name' => $suppliers[0]['name']] : null;
    }

    /**
     * Récupère l'ID du type de picking interne
     */
    private function getInternalPickingTypeId(): int
    {
        $types = $this->searchRead(
            'stock.picking.type',
            [['code', '=', 'internal']],
            ['id'],
            1
        );

        if (empty($types)) {
            throw new \RuntimeException('Aucun type de picking interne trouvé dans Odoo');
        }

        return $types[0]['id'];
    }

    // =========================================================================
    // MÉTHODES UTILITAIRES PRIVÉES
    // =========================================================================

    /**
     * Effectue un appel XML-RPC (implémentation sans extension xmlrpc)
     */
    private function xmlRpcCall(string $url, string $method, array $params): mixed
    {
        $request = $this->encodeXmlRpcRequest($method, $params);
        $maxRetries = 3;

        for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $request,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: text/xml; charset=utf-8',
                    'Content-Length: ' . strlen($request),
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($response === false) {
                throw new \RuntimeException("XML-RPC call failed: " . $error);
            }

            if ($httpCode === 429 && $attempt < $maxRetries) {
                $wait = (int) pow(2, $attempt + 1);
                $this->logger->warning("Odoo rate limit (429), retry in {$wait}s (attempt " . ($attempt + 1) . "/$maxRetries)");
                sleep($wait);
                continue;
            }

            if ($httpCode >= 400) {
                throw new \RuntimeException("XML-RPC HTTP error: $httpCode");
            }

            return $this->decodeXmlRpcResponse($response);
        }

        throw new \RuntimeException("XML-RPC failed after $maxRetries retries (429 rate limit)");
    }

    /**
     * Encode une requête XML-RPC
     */
    private function encodeXmlRpcRequest(string $method, array $params): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<methodCall>';
        $xml .= '<methodName>' . htmlspecialchars($method) . '</methodName>';
        $xml .= '<params>';
        
        foreach ($params as $param) {
            $xml .= '<param>' . $this->encodeValue($param) . '</param>';
        }
        
        $xml .= '</params>';
        $xml .= '</methodCall>';
        
        return $xml;
    }

    /**
     * Encode une valeur pour XML-RPC
     */
    private function encodeValue(mixed $value): string
    {
        if ($value === null) {
            return '<value><nil/></value>';
        }
        
        if (is_bool($value)) {
            return '<value><boolean>' . ($value ? '1' : '0') . '</boolean></value>';
        }
        
        if (is_int($value)) {
            return '<value><int>' . $value . '</int></value>';
        }
        
        if (is_float($value)) {
            return '<value><double>' . $value . '</double></value>';
        }
        
        if (is_string($value)) {
            return '<value><string>' . htmlspecialchars($value, ENT_XML1, 'UTF-8') . '</string></value>';
        }
        
        if (is_array($value)) {
            // Vérifier si c'est un tableau associatif (struct) ou indexé (array)
            if ($this->isAssociativeArray($value)) {
                $xml = '<value><struct>';
                foreach ($value as $key => $val) {
                    $xml .= '<member>';
                    $xml .= '<name>' . htmlspecialchars((string)$key, ENT_XML1, 'UTF-8') . '</name>';
                    $xml .= $this->encodeValue($val);
                    $xml .= '</member>';
                }
                $xml .= '</struct></value>';
                return $xml;
            } else {
                $xml = '<value><array><data>';
                foreach ($value as $val) {
                    $xml .= $this->encodeValue($val);
                }
                $xml .= '</data></array></value>';
                return $xml;
            }
        }
        
        return '<value><string>' . htmlspecialchars((string)$value, ENT_XML1, 'UTF-8') . '</string></value>';
    }

    /**
     * Vérifie si un tableau est associatif
     */
    private function isAssociativeArray(array $array): bool
    {
        if (empty($array)) {
            return false;
        }
        return array_keys($array) !== range(0, count($array) - 1);
    }

    /**
     * Décode une réponse XML-RPC
     */
    private function decodeXmlRpcResponse(string $xml): mixed
    {
        libxml_use_internal_errors(true);
        $doc = simplexml_load_string($xml);
        
        if ($doc === false) {
            $errors = libxml_get_errors();
            libxml_clear_errors();
            throw new \RuntimeException("Invalid XML-RPC response: " . ($errors[0]->message ?? 'Parse error'));
        }

        // Vérifier si c'est une erreur (fault)
        if (isset($doc->fault)) {
            $fault = $this->decodeValue($doc->fault->value);
            throw new \RuntimeException("XML-RPC fault [{$fault['faultCode']}]: " . ($fault['faultString'] ?? 'Unknown error'));
        }

        // Extraire la valeur de retour
        if (isset($doc->params->param->value)) {
            return $this->decodeValue($doc->params->param->value);
        }

        return null;
    }

    /**
     * Décode une valeur XML-RPC
     */
    private function decodeValue(\SimpleXMLElement $value): mixed
    {
        // Si la valeur contient directement du texte (pas de type spécifié = string)
        $children = $value->children();
        if (count($children) === 0) {
            return (string)$value;
        }

        $child = $children[0];
        $type = $child->getName();

        switch ($type) {
            case 'nil':
                return null;
            case 'boolean':
                return (string)$child === '1' || strtolower((string)$child) === 'true';
            case 'int':
            case 'i4':
            case 'i8':
                return (int)$child;
            case 'double':
                return (float)$child;
            case 'string':
                return (string)$child;
            case 'array':
                $result = [];
                if (isset($child->data->value)) {
                    foreach ($child->data->value as $val) {
                        $result[] = $this->decodeValue($val);
                    }
                }
                return $result;
            case 'struct':
                $result = [];
                if (isset($child->member)) {
                    foreach ($child->member as $member) {
                        $name = (string)$member->name;
                        $result[$name] = $this->decodeValue($member->value);
                    }
                }
                return $result;
            case 'base64':
                return base64_decode((string)$child);
            case 'dateTime.iso8601':
                return (string)$child;
            default:
                return (string)$child;
        }
    }
}
