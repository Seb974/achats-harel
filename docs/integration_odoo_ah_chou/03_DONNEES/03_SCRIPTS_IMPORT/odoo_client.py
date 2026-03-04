#!/usr/bin/env python3
"""
Client Odoo XML-RPC pour les imports
"""

import xmlrpc.client
import logging
from config import ODOO_CONFIG, DRY_RUN

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OdooClient:
    """Client XML-RPC pour Odoo"""
    
    def __init__(self, config=None):
        self.config = config or ODOO_CONFIG
        self.uid = None
        self.models = None
        self._connect()
    
    def _connect(self):
        """Établit la connexion avec Odoo"""
        try:
            common = xmlrpc.client.ServerProxy(f"{self.config['url']}/xmlrpc/2/common")
            
            # Test version
            version = common.version()
            logger.info(f"Connexion à Odoo {version.get('server_version', 'inconnu')}")
            
            # Authentification
            self.uid = common.authenticate(
                self.config['database'],
                self.config['username'],
                self.config['api_key'],
                {}
            )
            
            if not self.uid:
                raise Exception("Authentification échouée")
            
            logger.info(f"Authentifié avec UID: {self.uid}")
            
            # Client models
            self.models = xmlrpc.client.ServerProxy(f"{self.config['url']}/xmlrpc/2/object")
            
        except Exception as e:
            logger.error(f"Erreur de connexion: {e}")
            raise
    
    def search(self, model, domain, limit=None, offset=0):
        """Recherche des enregistrements"""
        kwargs = {'offset': offset}
        if limit:
            kwargs['limit'] = limit
        
        return self.models.execute_kw(
            self.config['database'],
            self.uid,
            self.config['api_key'],
            model, 'search',
            [domain],
            kwargs
        )
    
    def read(self, model, ids, fields=None):
        """Lit des enregistrements"""
        kwargs = {}
        if fields:
            kwargs['fields'] = fields
        
        return self.models.execute_kw(
            self.config['database'],
            self.uid,
            self.config['api_key'],
            model, 'read',
            [ids],
            kwargs
        )
    
    def search_read(self, model, domain, fields=None, limit=None, offset=0):
        """Recherche et lit en une seule opération"""
        kwargs = {'offset': offset}
        if fields:
            kwargs['fields'] = fields
        if limit:
            kwargs['limit'] = limit
        
        return self.models.execute_kw(
            self.config['database'],
            self.uid,
            self.config['api_key'],
            model, 'search_read',
            [domain],
            kwargs
        )
    
    def create(self, model, values):
        """Crée un enregistrement"""
        if DRY_RUN:
            logger.info(f"[DRY-RUN] Création {model}: {values.get('name', values)}")
            return -1
        
        return self.models.execute_kw(
            self.config['database'],
            self.uid,
            self.config['api_key'],
            model, 'create',
            [values]
        )
    
    def write(self, model, ids, values):
        """Met à jour des enregistrements"""
        if DRY_RUN:
            logger.info(f"[DRY-RUN] MAJ {model} {ids}: {values}")
            return True
        
        return self.models.execute_kw(
            self.config['database'],
            self.uid,
            self.config['api_key'],
            model, 'write',
            [ids, values]
        )
    
    def unlink(self, model, ids):
        """Supprime des enregistrements"""
        if DRY_RUN:
            logger.info(f"[DRY-RUN] Suppression {model} {ids}")
            return True
        
        return self.models.execute_kw(
            self.config['database'],
            self.uid,
            self.config['api_key'],
            model, 'unlink',
            [ids]
        )
    
    def find_or_create(self, model, domain, values):
        """Trouve un enregistrement ou le crée s'il n'existe pas"""
        existing = self.search(model, domain, limit=1)
        if existing:
            logger.debug(f"Trouvé {model} existant: {existing[0]}")
            return existing[0], False
        
        new_id = self.create(model, values)
        logger.debug(f"Créé {model}: {new_id}")
        return new_id, True
    
    def get_or_create_category(self, name, parent_id=None):
        """Trouve ou crée une catégorie client"""
        domain = [('name', '=', name)]
        
        existing = self.search('res.partner.category', domain, limit=1)
        if existing:
            return existing[0]
        
        values = {'name': name}
        if parent_id:
            values['parent_id'] = parent_id
        
        return self.create('res.partner.category', values)
    
    def get_or_create_product_category(self, name, parent_id=None):
        """Trouve ou crée une catégorie produit"""
        domain = [('name', '=', name)]
        if parent_id:
            domain.append(('parent_id', '=', parent_id))
        
        existing = self.search('product.category', domain, limit=1)
        if existing:
            return existing[0]
        
        values = {'name': name}
        if parent_id:
            values['parent_id'] = parent_id
        
        return self.create('product.category', values)
    
    def get_tax_id(self, tax_name):
        """Récupère l'ID d'une taxe par son nom"""
        existing = self.search('account.tax', [('name', 'ilike', tax_name)], limit=1)
        return existing[0] if existing else None
    
    def get_account_id(self, code):
        """Récupère l'ID d'un compte comptable par son code"""
        existing = self.search('account.account', [('code', '=', code)], limit=1)
        return existing[0] if existing else None
    
    def get_pricelist_id(self, name):
        """Récupère l'ID d'une liste de prix par son nom"""
        existing = self.search('product.pricelist', [('name', 'ilike', name)], limit=1)
        return existing[0] if existing else None
    
    def get_payment_term_id(self, name):
        """Récupère l'ID d'une condition de paiement par son nom"""
        existing = self.search('account.payment.term', [('name', 'ilike', name)], limit=1)
        return existing[0] if existing else None


def test_connection():
    """Teste la connexion Odoo"""
    try:
        client = OdooClient()
        print("✅ Connexion réussie!")
        
        # Test lecture
        companies = client.search_read('res.company', [], ['name'], limit=1)
        if companies:
            print(f"   Société: {companies[0]['name']}")
        
        return True
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False


if __name__ == '__main__':
    test_connection()
