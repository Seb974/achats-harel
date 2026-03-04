<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration Kanban Transit Maritime :
 * - Contrainte UNIQUE sur status.code
 * - Colonne odoo_location_id sur status
 * - Renommage DRAFT → BROUILLON, VALIDATED → ENVOYE
 * - Suppression ISSUED (si non utilisé)
 * - Ajout statuts : EN_MER, AU_PORT, DOUANE, A_RECEPTIONNER, RECU
 * - Colonnes Odoo sur achat : odoo_purchase_order_id, odoo_purchase_order_name, odoo_picking_id
 */
final class Version20260226_AddTransitStatuses extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Kanban transit maritime : statuts, contrainte UNIQUE, champs Odoo sur achat';
    }

    public function up(Schema $schema): void
    {
        // 1. Ajouter colonne odoo_location_id sur status
        $this->addSql('ALTER TABLE status ADD COLUMN odoo_location_id INTEGER DEFAULT NULL');

        // 2. Ajouter colonnes Odoo sur achat
        $this->addSql('ALTER TABLE achat ADD COLUMN odoo_purchase_order_id INTEGER DEFAULT NULL');
        $this->addSql('ALTER TABLE achat ADD COLUMN odoo_purchase_order_name VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE achat ADD COLUMN odoo_picking_id INTEGER DEFAULT NULL');

        // 3. Renommer DRAFT → BROUILLON
        $this->addSql("UPDATE status SET code = 'BROUILLON', label = 'Brouillon', color = '#6c757d' WHERE code = 'DRAFT'");

        // 4. Renommer VALIDATED → ENVOYE
        $this->addSql("UPDATE status SET code = 'ENVOYE', label = 'Envoyé', color = '#0d6efd', is_default = false WHERE code = 'VALIDATED'");

        // 5. Supprimer ISSUED s'il n'est utilisé par aucun achat
        $this->addSql("DELETE FROM status WHERE code = 'ISSUED' AND id NOT IN (SELECT DISTINCT status_id FROM achat WHERE status_id IS NOT NULL)");

        // 6. Contrainte UNIQUE sur code (après les renommages pour éviter les conflits)
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7B00651C77153098 ON status (code)');

        // 7. Insérer les nouveaux statuts de transit
        $statusData = [
            ['EN_MER', 'En mer', '#0077b6', 'false', '22'],
            ['AU_PORT', 'Au port', '#ffc107', 'false', '23'],
            ['DOUANE', 'Dédouanement', '#fd7e14', 'false', '24'],
            ['A_RECEPTIONNER', 'A réceptionner', '#6f42c1', 'false', '19'],
            ['RECU', 'Reçu', '#28a745', 'false', 'NULL'],
        ];

        foreach ($statusData as [$code, $label, $color, $isDefault, $odooLocId]) {
            $exists = $this->connection->fetchOne(
                'SELECT COUNT(*) FROM status WHERE code = ?',
                [$code]
            );

            if ((int) $exists === 0) {
                $odooVal = $odooLocId === 'NULL' ? 'NULL' : $odooLocId;
                $this->addSql(
                    "INSERT INTO status (code, label, color, is_default, odoo_location_id) VALUES ('$code', '$label', '$color', $isDefault, $odooVal)"
                );
            }
        }

        // 8. Mettre à jour odoo_location_id pour les statuts existants renommés
        $this->addSql("UPDATE status SET odoo_location_id = NULL WHERE code IN ('BROUILLON', 'ENVOYE')");
    }

    public function down(Schema $schema): void
    {
        // Supprimer les nouveaux statuts (seulement s'ils ne sont pas utilisés)
        $this->addSql("DELETE FROM status WHERE code IN ('EN_MER', 'AU_PORT', 'DOUANE', 'A_RECEPTIONNER', 'RECU') AND id NOT IN (SELECT DISTINCT status_id FROM achat WHERE status_id IS NOT NULL)");

        // Supprimer la contrainte UNIQUE
        $this->addSql('DROP INDEX IF EXISTS UNIQ_7B00651C77153098');

        // Restaurer les noms originaux
        $this->addSql("UPDATE status SET code = 'DRAFT', label = 'Brouillon', color = '#f87171' WHERE code = 'BROUILLON'");
        $this->addSql("UPDATE status SET code = 'VALIDATED', label = 'Validé', color = '#fb923c' WHERE code = 'ENVOYE'");

        // Supprimer les colonnes ajoutées
        $this->addSql('ALTER TABLE status DROP COLUMN IF EXISTS odoo_location_id');
        $this->addSql('ALTER TABLE achat DROP COLUMN IF EXISTS odoo_purchase_order_id');
        $this->addSql('ALTER TABLE achat DROP COLUMN IF EXISTS odoo_purchase_order_name');
        $this->addSql('ALTER TABLE achat DROP COLUMN IF EXISTS odoo_picking_id');
    }
}
