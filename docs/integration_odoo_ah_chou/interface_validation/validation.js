/**
 * Validation des données import - AH CHOU vers Odoo
 */

// Configuration des mappings Excel -> Odoo
const MAPPINGS = {
    clients: {
        sheetName: 'trame client',
        odooModel: 'res.partner',
        fields: [
            { excel: 'Code interne', odoo: 'ref', required: false, type: 'char' },
            { excel: 'Nom Client', odoo: 'name', required: true, type: 'char' },
            { excel: 'Raison sociale', odoo: 'company_name', required: false, type: 'char' },
            { excel: 'Téléphone', odoo: 'phone', required: false, type: 'char' },
            { excel: 'GSM', odoo: 'mobile', required: false, type: 'char' },
            { excel: 'E-Mail', odoo: 'email', required: false, type: 'email' },
            { excel: 'Site Web', odoo: 'website', required: false, type: 'url' },
            { excel: 'Siret', odoo: 'siret', required: false, type: 'char' },
            { excel: 'Plafond d\'encours', odoo: 'credit_limit', required: false, type: 'float' },
            { excel: 'Nom Gr. clients', odoo: 'x_groupe_client', required: false, type: 'selection', 
              values: ['gbh', 'smdis', 'cellule_u', 'caille', 'distrimascareignes', 'ibl', 'tk', 'lot'] },
            { excel: 'Nom Enseigne', odoo: 'x_enseigne', required: false, type: 'selection',
              values: ['auchan', 'carrefour', 'carrefour_market', 'carrefour_city', 'promocash', 'u', 'leclerc', 'intermark', 'run_market', 'cocci_market', 'leader_price', 'gel_oi', 'independant'] },
            { excel: 'Nom catégorie', odoo: 'category_id', required: false, type: 'many2one' },
            { excel: 'Code tarif', odoo: 'property_product_pricelist', required: false, type: 'many2one' },
            { excel: 'Code règlement', odoo: 'property_payment_term_id', required: false, type: 'many2one' },
            { excel: 'Tx remise', odoo: 'x_taux_remise', required: false, type: 'float' },
            { excel: 'Tx RFA', odoo: 'x_taux_rfa', required: false, type: 'float' },
            { excel: 'Blocage', odoo: 'x_blocage', required: false, type: 'selection',
              values: ['non', 'oui_toujours', 'oui_depassement'] },
            { excel: 'N° Compta', odoo: 'x_compte_comptable', required: false, type: 'char' },
            { excel: 'Responsable 1', odoo: 'x_responsable_1', required: false, type: 'char' },
            { excel: 'Responsable 2', odoo: 'x_responsable_2', required: false, type: 'char' },
            { excel: 'Resp. Cpta.', odoo: 'x_resp_compta', required: false, type: 'char' },
            { excel: 'Tél. Cpta.', odoo: 'x_tel_compta', required: false, type: 'char' },
            { excel: 'Email Cpta.', odoo: 'x_email_compta', required: false, type: 'email' },
            { excel: 'Groupe Fact.', odoo: 'x_groupe_facturation', required: false, type: 'char' },
        ]
    },
    produits: {
        sheetName: 'Trame articles',
        odooModel: 'product.template',
        fields: [
            { excel: 'C. Puit', odoo: 'default_code', required: false, type: 'char' },
            { excel: 'Désignation', odoo: 'name', required: true, type: 'char' },
            { excel: 'Nom long', odoo: 'x_nom_long', required: false, type: 'char' },
            { excel: 'Ean 13', odoo: 'barcode', required: false, type: 'barcode' },
            { excel: 'Contenu', odoo: 'x_contenu', required: false, type: 'float' },
            { excel: 'Condt.', odoo: 'x_conditionnement', required: false, type: 'float' },
            { excel: 'PCB', odoo: 'x_pcb', required: false, type: 'float' },
            { excel: 'Poids brut', odoo: 'x_poids_brut', required: false, type: 'float' },
            { excel: 'Poids net', odoo: 'weight', required: false, type: 'float' },
            { excel: 'Volume', odoo: 'volume', required: false, type: 'float' },
            { excel: 'Tx. TVA', odoo: 'taxes_id', required: false, type: 'many2many' },
            { excel: 'PV HT', odoo: 'list_price', required: false, type: 'float' },
            { excel: 'PR HT', odoo: 'standard_price', required: false, type: 'float' },
            { excel: 'PRMUP', odoo: 'x_prmup', required: false, type: 'float' },
            { excel: 'Coef. App.', odoo: 'x_coef_approche', required: false, type: 'float' },
            { excel: 'T1 HT', odoo: 'x_tarif_t1_ht', required: false, type: 'float' },
            { excel: 'T2 HT', odoo: 'x_tarif_t2_ht', required: false, type: 'float' },
            { excel: 'T3 HT', odoo: 'x_tarif_t3_ht', required: false, type: 'float' },
            { excel: 'T4 HT', odoo: 'x_tarif_t4_ht', required: false, type: 'float' },
            { excel: 'T5 HT', odoo: 'x_tarif_t5_ht', required: false, type: 'float' },
            { excel: 'T6 HT', odoo: 'x_tarif_t6_ht', required: false, type: 'float' },
            { excel: 'Nom ONU', odoo: 'x_zone_peche', required: false, type: 'char' },
            { excel: 'Détails NSA', odoo: 'x_nom_scientifique', required: false, type: 'char' },
            { excel: 'Origine', odoo: 'x_origine', required: false, type: 'char' },
            { excel: 'Marque', odoo: 'x_marque', required: false, type: 'char' },
            { excel: 'Rayon', odoo: 'categ_id', required: false, type: 'many2one' },
            { excel: 'Nom GR', odoo: 'x_groupe_article', required: false, type: 'char' },
            { excel: 'Nom SGR', odoo: 'x_sous_groupe', required: false, type: 'char' },
            { excel: 'Nom Seg.', odoo: 'x_segment', required: false, type: 'char' },
        ]
    },
    fournisseurs: {
        sheetName: 'TRAME FRS',
        odooModel: 'res.partner',
        fields: [
            { excel: 'Code fournisseur', odoo: 'ref', required: false, type: 'char' },
            { excel: 'Nom fournisseur', odoo: 'name', required: true, type: 'char' },
            { excel: 'Raison sociale', odoo: 'company_name', required: false, type: 'char' },
            { excel: 'Adresse', odoo: 'street', required: false, type: 'char' },
            { excel: 'Code postal', odoo: 'zip', required: false, type: 'char' },
            { excel: 'Ville', odoo: 'city', required: false, type: 'char' },
            { excel: 'Téléphone', odoo: 'phone', required: false, type: 'char' },
            { excel: 'E-Mail', odoo: 'email', required: false, type: 'email' },
            { excel: 'Site Web', odoo: 'website', required: false, type: 'url' },
            { excel: 'Grp. Frs', odoo: 'x_groupe_fournisseur', required: false, type: 'selection',
              values: ['asie_inde', 'europe', 'local', 'afrique', 'amerique', 'oceanie', 'autres'] },
            { excel: 'Transitaire', odoo: 'x_is_transitaire', required: false, type: 'boolean' },
            { excel: 'Nb Jrs Dispo', odoo: 'x_delai_livraison', required: false, type: 'integer' },
            { excel: 'Condi. livraison', odoo: 'x_incoterm', required: false, type: 'char' },
            { excel: 'Condi. achats', odoo: 'x_conditions_achat', required: false, type: 'text' },
            { excel: 'Responsable 1', odoo: 'x_responsable_1', required: false, type: 'char' },
            { excel: 'Responsable 2', odoo: 'x_responsable_2', required: false, type: 'char' },
            { excel: 'N° Client', odoo: 'x_numero_client_chez_frs', required: false, type: 'char' },
            { excel: 'N° Cpte. Cpta.', odoo: 'x_compte_auxiliaire', required: false, type: 'char' },
            { excel: 'Commentaires', odoo: 'comment', required: false, type: 'text' },
        ]
    }
};

// État global
let uploadedData = {
    clients: null,
    produits: null,
    fournisseurs: null
};

// Gestion des onglets
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    document.querySelector(`.tab:nth-child(${tabName === 'clients' ? 1 : tabName === 'produits' ? 2 : 3})`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Upload de fichier
function handleFileUpload(input, type) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            processWorkbook(workbook, type);
        } catch (error) {
            alert('Erreur lors de la lecture du fichier: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Traitement du workbook
function processWorkbook(workbook, type) {
    const config = MAPPINGS[type];
    const sheetName = config.sheetName;
    
    // Vérifier que la feuille existe
    if (!workbook.SheetNames.includes(sheetName)) {
        // Chercher une feuille similaire
        const found = workbook.SheetNames.find(s => 
            s.toLowerCase().includes(sheetName.toLowerCase().split(' ')[0])
        );
        
        if (found) {
            console.log(`Feuille "${sheetName}" non trouvée, utilisation de "${found}"`);
        } else {
            alert(`Feuille "${sheetName}" non trouvée.\nFeuilles disponibles: ${workbook.SheetNames.join(', ')}`);
            return;
        }
    }
    
    const sheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Extraire les en-têtes et les données
    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));
    
    uploadedData[type] = {
        headers: headers,
        rows: rows,
        workbook: workbook
    };
    
    // Mettre à jour les étapes
    updateStep(2);
    
    // Valider et afficher les résultats
    validateAndDisplay(type);
}

// Validation et affichage
function validateAndDisplay(type) {
    const data = uploadedData[type];
    const config = MAPPINGS[type];
    
    if (!data) return;
    
    const results = {
        total: data.rows.length,
        valid: 0,
        warnings: 0,
        errors: 0,
        errorDetails: [],
        mappedFields: [],
        unmappedExcel: [],
        unmappedOdoo: []
    };
    
    // Mapper les colonnes Excel aux champs Odoo
    const columnMapping = {};
    config.fields.forEach(field => {
        const colIndex = data.headers.findIndex(h => 
            h && h.toString().toLowerCase().trim() === field.excel.toLowerCase().trim()
        );
        
        if (colIndex !== -1) {
            columnMapping[field.excel] = {
                index: colIndex,
                odoo: field.odoo,
                type: field.type,
                required: field.required,
                values: field.values
            };
            results.mappedFields.push(field);
        } else {
            results.unmappedOdoo.push(field);
        }
    });
    
    // Colonnes Excel non mappées
    data.headers.forEach((header, idx) => {
        if (!header) return;
        const isMapped = Object.keys(columnMapping).some(k => 
            k.toLowerCase() === header.toString().toLowerCase()
        );
        if (!isMapped) {
            results.unmappedExcel.push({ header, index: idx });
        }
    });
    
    // Valider chaque ligne
    data.rows.forEach((row, rowIdx) => {
        let rowValid = true;
        let rowWarnings = [];
        
        // Vérifier les champs requis
        config.fields.filter(f => f.required).forEach(field => {
            const mapping = columnMapping[field.excel];
            if (mapping) {
                const value = row[mapping.index];
                if (value === null || value === undefined || value === '') {
                    rowValid = false;
                    results.errorDetails.push({
                        row: rowIdx + 2,
                        field: field.excel,
                        message: 'Champ requis vide',
                        type: 'error'
                    });
                }
            }
        });
        
        // Valider les types
        Object.entries(columnMapping).forEach(([excelField, mapping]) => {
            const value = row[mapping.index];
            if (value === null || value === undefined || value === '') return;
            
            const validation = validateValue(value, mapping.type, mapping.values);
            if (!validation.valid) {
                if (validation.warning) {
                    rowWarnings.push({
                        row: rowIdx + 2,
                        field: excelField,
                        message: validation.message,
                        type: 'warning'
                    });
                } else {
                    rowValid = false;
                    results.errorDetails.push({
                        row: rowIdx + 2,
                        field: excelField,
                        message: validation.message,
                        value: value,
                        type: 'error'
                    });
                }
            }
        });
        
        if (rowValid) {
            results.valid++;
            if (rowWarnings.length > 0) {
                results.warnings++;
                results.errorDetails.push(...rowWarnings);
            }
        } else {
            results.errors++;
        }
    });
    
    // Afficher les résultats
    displayResults(type, results, columnMapping);
    
    // Mettre à jour les étapes
    if (results.errors === 0) {
        updateStep(4);
    } else {
        updateStep(3);
    }
}

// Validation des valeurs
function validateValue(value, type, allowedValues) {
    switch (type) {
        case 'email':
            if (typeof value === 'string' && value.includes('@')) {
                return { valid: true };
            }
            return { valid: false, warning: true, message: 'Format email invalide' };
            
        case 'float':
            const num = parseFloat(value);
            if (isNaN(num)) {
                return { valid: false, warning: true, message: 'Nombre attendu' };
            }
            return { valid: true };
            
        case 'integer':
            const int = parseInt(value);
            if (isNaN(int)) {
                return { valid: false, warning: true, message: 'Entier attendu' };
            }
            return { valid: true };
            
        case 'boolean':
            return { valid: true };
            
        case 'selection':
            if (allowedValues) {
                const normalized = normalizeSelection(value);
                if (!allowedValues.includes(normalized)) {
                    return { valid: false, warning: true, message: `Valeur "${value}" à mapper` };
                }
            }
            return { valid: true };
            
        case 'barcode':
            const barcode = value.toString().replace(/\D/g, '');
            if (barcode.length !== 13 && barcode.length !== 8) {
                return { valid: false, warning: true, message: 'Code-barres invalide (8 ou 13 chiffres)' };
            }
            return { valid: true };
            
        case 'url':
            if (typeof value === 'string' && (value.startsWith('http') || value.includes('.'))) {
                return { valid: true };
            }
            return { valid: false, warning: true, message: 'URL invalide' };
            
        default:
            return { valid: true };
    }
}

// Normalisation des sélections
function normalizeSelection(value) {
    if (!value) return '';
    return value.toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

// Affichage des résultats
function displayResults(type, results, columnMapping) {
    // Masquer la zone d'upload
    document.getElementById(`upload-${type}`).classList.add('hidden');
    document.getElementById(`${type}-results`).classList.remove('hidden');
    
    // Stats
    const statsHtml = `
        <div class="stat-card success">
            <div class="value">${results.valid}</div>
            <div class="label">Lignes valides</div>
        </div>
        <div class="stat-card warning">
            <div class="value">${results.warnings}</div>
            <div class="label">Avertissements</div>
        </div>
        <div class="stat-card danger">
            <div class="value">${results.errors}</div>
            <div class="label">Erreurs</div>
        </div>
        <div class="stat-card">
            <div class="value">${results.mappedFields.length}/${MAPPINGS[type].fields.length}</div>
            <div class="label">Champs mappés</div>
        </div>
    `;
    document.getElementById(`${type}-stats`).innerHTML = statsHtml;
    
    // Mapping
    let mappingHtml = '<h3 style="margin: 20px 0 10px;">Correspondance Excel → Odoo</h3>';
    mappingHtml += '<div style="background:#f9f9f9; padding:15px; border-radius:8px; max-height:300px; overflow:auto;">';
    
    results.mappedFields.forEach(field => {
        mappingHtml += `
            <div class="mapping-row">
                <div><strong>${field.excel}</strong></div>
                <div class="arrow">→</div>
                <div><code>${field.odoo}</code> <span class="badge badge-info">${field.type}</span></div>
                <div>${field.required ? '<span class="badge badge-danger">Requis</span>' : ''}</div>
            </div>
        `;
    });
    
    if (results.unmappedExcel.length > 0) {
        mappingHtml += '<h4 style="margin-top:15px; color:#856404;">Colonnes Excel non mappées:</h4>';
        mappingHtml += '<p style="color:#666;">' + results.unmappedExcel.map(c => c.header).join(', ') + '</p>';
    }
    
    mappingHtml += '</div>';
    document.getElementById(`${type}-mapping`).innerHTML = mappingHtml;
    
    // Erreurs
    if (results.errorDetails.length > 0) {
        let errorsHtml = '<h3 style="margin: 20px 0 10px;">Problèmes détectés</h3>';
        errorsHtml += '<div class="error-list">';
        
        // Grouper par type
        const errors = results.errorDetails.filter(e => e.type === 'error');
        const warnings = results.errorDetails.filter(e => e.type === 'warning');
        
        if (errors.length > 0) {
            errorsHtml += `<h4 style="color:#721c24;">❌ Erreurs (${errors.length})</h4>`;
            errors.slice(0, 20).forEach(err => {
                errorsHtml += `<div class="error-item">
                    <span class="badge badge-danger">Ligne ${err.row}</span>
                    <span>${err.field}: ${err.message}</span>
                </div>`;
            });
            if (errors.length > 20) {
                errorsHtml += `<p style="color:#666;">... et ${errors.length - 20} autres erreurs</p>`;
            }
        }
        
        if (warnings.length > 0) {
            errorsHtml += `<h4 style="color:#856404; margin-top:15px;">⚠️ Avertissements (${warnings.length})</h4>`;
            warnings.slice(0, 10).forEach(warn => {
                errorsHtml += `<div class="error-item">
                    <span class="badge badge-warning">Ligne ${warn.row}</span>
                    <span>${warn.field}: ${warn.message}</span>
                </div>`;
            });
            if (warnings.length > 10) {
                errorsHtml += `<p style="color:#666;">... et ${warnings.length - 10} autres avertissements</p>`;
            }
        }
        
        errorsHtml += '</div>';
        document.getElementById(`${type}-errors`).innerHTML = errorsHtml;
    }
    
    // Prévisualisation
    const data = uploadedData[type];
    let previewHtml = '<h3 style="margin: 20px 0 10px;">Aperçu des données (10 premières lignes)</h3>';
    previewHtml += '<div class="data-preview"><table>';
    
    // En-têtes mappés seulement
    const mappedHeaders = results.mappedFields.map(f => f.excel);
    previewHtml += '<tr>';
    mappedHeaders.forEach(h => {
        previewHtml += `<th>${h}</th>`;
    });
    previewHtml += '</tr>';
    
    // Données
    data.rows.slice(0, 10).forEach(row => {
        previewHtml += '<tr>';
        results.mappedFields.forEach(field => {
            const colIdx = data.headers.findIndex(h => 
                h && h.toString().toLowerCase() === field.excel.toLowerCase()
            );
            const value = colIdx !== -1 ? row[colIdx] : '';
            previewHtml += `<td>${value !== null && value !== undefined ? value : ''}</td>`;
        });
        previewHtml += '</tr>';
    });
    
    previewHtml += '</table></div>';
    
    // Boutons d'action
    previewHtml += `
        <div style="margin-top:20px; display:flex; gap:10px;">
            <button class="btn btn-primary" onclick="exportJSON('${type}')">📥 Exporter JSON pour import</button>
            <button class="btn" onclick="resetUpload('${type}')">🔄 Charger un autre fichier</button>
        </div>
    `;
    
    document.getElementById(`${type}-preview`).innerHTML = previewHtml;
}

// Export JSON
function exportJSON(type) {
    const data = uploadedData[type];
    const config = MAPPINGS[type];
    
    if (!data) return;
    
    const records = [];
    
    data.rows.forEach(row => {
        const record = {};
        
        config.fields.forEach(field => {
            const colIdx = data.headers.findIndex(h => 
                h && h.toString().toLowerCase() === field.excel.toLowerCase()
            );
            
            if (colIdx !== -1) {
                let value = row[colIdx];
                
                // Conversion selon le type
                if (value !== null && value !== undefined && value !== '') {
                    switch (field.type) {
                        case 'float':
                            value = parseFloat(value) || 0;
                            break;
                        case 'integer':
                            value = parseInt(value) || 0;
                            break;
                        case 'boolean':
                            value = value === 1 || value === '1' || value === 'oui' || value === 'Oui';
                            break;
                        case 'selection':
                            value = normalizeSelection(value);
                            break;
                        default:
                            value = value.toString().trim();
                    }
                    
                    record[field.odoo] = value;
                }
            }
        });
        
        // Ajouter les champs spécifiques au type
        if (type === 'clients') {
            record.is_company = true;
            record.customer_rank = 1;
        } else if (type === 'fournisseurs') {
            record.is_company = true;
            record.supplier_rank = 1;
        } else if (type === 'produits') {
            record.type = 'product';
            record.sale_ok = true;
            record.purchase_ok = true;
            record.tracking = 'lot';
        }
        
        if (Object.keys(record).length > 0) {
            records.push(record);
        }
    });
    
    // Télécharger le JSON
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_${type}_odoo.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStep(5);
}

// Reset upload
function resetUpload(type) {
    uploadedData[type] = null;
    document.getElementById(`upload-${type}`).classList.remove('hidden');
    document.getElementById(`${type}-results`).classList.add('hidden');
    document.getElementById(`file-${type}`).value = '';
}

// Mise à jour des étapes
function updateStep(stepNum) {
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'done');
        
        if (i < stepNum) {
            step.classList.add('done');
        } else if (i === stepNum) {
            step.classList.add('active');
        }
    }
}

// Drag & drop
document.querySelectorAll('.upload-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            const type = zone.id.replace('upload-', '');
            const input = document.getElementById(`file-${type}`);
            
            // Créer un nouveau FileList
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            
            handleFileUpload(input, type);
        }
    });
});
