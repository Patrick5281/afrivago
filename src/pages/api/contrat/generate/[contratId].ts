import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { contratId } = req.query;
  if (!contratId || typeof contratId !== 'string') {
    return res.status(400).json({ error: 'contratId manquant ou invalide' });
  }

  try {
    // 1. Récupérer les infos du contrat (SQL natif)
    const pool = db.getPool();
    const { rows } = await pool.query(
      `SELECT * FROM contrats_locatifs WHERE id = $1`,
      [contratId]
    );
    const contrat = rows[0];
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    let uniteDetails = null;
    let logementParent = null;
    // Si c'est une unité, récupérer les infos de l'unité et du logement parent
    if (contrat.logement_type === 'unit') {
      // Récupérer l'unité (ici, logement_nom = nom de l'unité)
      uniteDetails = {
        nom: contrat.logement_nom,
        surface: contrat.superficie,
      };
      // Récupérer le logement parent
      const parentRes = await pool.query(
        `SELECT title as nom, full_address as adresse FROM properties WHERE id = $1`,
        [contrat.logement_id]
      );
      logementParent = parentRes.rows[0] || { nom: '', adresse: '' };
    }

    // === LOGO EN BASE64 ===
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'images', 'logo-white.png');
    let logoSrc = '';
    try {
      const logoBuffer = await fs.readFile(logoPath);
      logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (e) {
      logoSrc = '';
    }

    // 2. Générer le HTML (template conditionné)
    let html = '';
    if (contrat.logement_type === 'unit') {
      html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Contrat de prestation de services</title>
  <style>
    @page { 
      size: A4; 
      margin: 1.5cm; 
      @bottom-center {
        content: "Page " counter(page) " sur " counter(pages);
        font-size: 10pt;
        color: #666;
      }
    }
    body { 
      font-family: 'Arial', sans-serif; 
      color: #333; 
      background: #fff; 
      margin: 0; 
      padding: 0; 
      font-size: 11pt; 
      line-height: 1.4;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 3px solid #00a8cc;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-left: 20px;
      margin-top: 10px;
      display: flex;
      align-items: flex-start;
    }
    .logo img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
    
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #f59e0b;
      text-decoration: underline;
      text-decoration-color: #f59e0b;
      text-decoration-thickness: 2px;
    }
    
    .section {
      margin-bottom: 2em;
    }
    
    .section-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 1em;
      font-size: 12pt;
    }
    
    .form-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.8em;
      min-height: 20px;
    }
    
    .form-label {
      font-weight: normal;
      margin-right: 0.5em;
      flex-shrink: 0;
    }
    
    .form-field {
      border-bottom: 1px solid #333;
      padding-bottom: 2px;
      margin-right: 0.5em;
      min-width: 150px;
      flex-grow: 1;
    }
    
    .form-field.short {
      min-width: 80px;
      flex-grow: 0;
    }
    
    .form-field.medium {
      min-width: 120px;
      flex-grow: 0;
    }
    
    .checkbox-section {
      margin: 1.5em 0;
    }
    
    .checkbox-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5em;
    }
    
    .checkbox {
      width: 12px;
      height: 12px;
      border: 1px solid #333;
      margin-right: 0.5em;
      display: inline-block;
      flex-shrink: 0;
    }
    
    .checkbox.checked {
      background: #333;
    }
    
    .content-section {
      margin-top: 2em;
    }
    
    .content-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 1em;
      text-decoration: underline;
    }
    
    .content-text {
      text-align: justify;
      line-height: 1.6;
      margin-bottom: 1em;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 3em;
      page-break-inside: avoid;
    }
    
    .signature-block {
      width: 45%;
      text-align: center;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 3em;
      width: 80%;
      margin-left: auto;
      margin-right: auto;
    }
    
    .signature-label {
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    
    .date-location {
      text-align: right;
      margin-top: 2em;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <img src="${logoSrc}" alt="Logo AfriVago" />
      </div>
    </div>
    <div class="title">Contrat de prestation de services</div>
  </div>

  <div class="section">
    <div class="section-title">Entre les soussignés :</div>
    
    <div class="form-row">
      <span class="form-label">La société</span>
      <span class="form-field">AfriVago</span>
      <span class="form-label">immatriculée au Registre du Commerce et des Sociétés de</span>
    </div>
    
    <div class="form-row">
      <span class="form-field">Cotonou</span>
      <span class="form-label">sous le numéro</span>
      <span class="form-field medium">009547874</span>
      <span class="form-label">dont le siège social est</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">situé au</span>
      <span class="form-field">Cotonou, Bénin</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">ci-après dénommée « la Client »,</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">et</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">La société</span>
      <span class="form-field">Prestataire</span>
      <span class="form-label">immatriculée au Registre du Commerce et des Sociétés de</span>
    </div>
    
    <div class="form-row">
      <span class="form-field">Ville</span>
      <span class="form-label">sous le numéro</span>
      <span class="form-field medium">009547874</span>
      <span class="form-label">dont le siège social est</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">situé au</span>
      <span class="form-field">Adresse complète</span>
      <span class="form-label">représentée par M.</span>
      <span class="form-field medium">${contrat.locataire_nom || ''} ${contrat.locataire_prenom || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">ci-après dénommée « le Prestataire de services » ou « la Prestataire »,</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">d'autre part,</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Il a été convenu ce qui suit</span>
    </div>
  </div>

  <div class="content-section">
    <div class="content-title">Article premier - Objet</div>
    
    <div class="content-text">
      Le présent contrat a pour objet la prestation de services de location d'unité locative suivante :
    </div>
    
    <div class="form-row">
      <span class="form-label">Unité :</span>
      <span class="form-field">${uniteDetails?.nom || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Logement :</span>
      <span class="form-field">${logementParent?.nom || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Adresse :</span>
      <span class="form-field">${logementParent?.adresse || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Surface :</span>
      <span class="form-field short">${uniteDetails?.surface || ''} m²</span>
    </div>
    
    <div class="content-text">
      <strong>Période de location :</strong><br>
      Du ${contrat.date_arrivee ? new Date(contrat.date_arrivee).toLocaleDateString('fr-FR') : '___/___/___'} 
      au ${contrat.date_depart ? new Date(contrat.date_depart).toLocaleDateString('fr-FR') : '___/___/___'}
    </div>
    
    <div class="content-text">
      <strong>Loyer mensuel :</strong> ${contrat.loyer_mensuel || '_______'} FCFA<br>
      <strong>Caution :</strong> ${contrat.caution || '_______'} FCFA<br>
      <strong>Dépôt de garantie :</strong> ${contrat.caution_payee || '_______'} FCFA
    </div>
    
    <div class="content-text">
      ${contrat.clauses || 'Les conditions générales de location s\'appliquent selon les termes définis dans les conditions générales de la plateforme AfriVago.'}
    </div>
  </div>

  <div class="date-location">
    Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}
  </div>

  <div class="signature-section">
    <div class="signature-block">
      <div class="signature-label">Le Client</div>
      <div class="signature-line"></div>
      <div>AfriVago</div>
    </div>
    <div class="signature-block">
      <div class="signature-label">Le Prestataire</div>
      <div class="signature-line"></div>
      <div>${contrat.locataire_nom || ''} ${contrat.locataire_prenom || ''}</div>
    </div>
  </div>
</body>
</html>`;
    } else {
      // Template standard logement entier
      html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Contrat de prestation de services</title>
  <style>
    @page { 
      size: A4; 
      margin: 1.5cm; 
      @bottom-center {
        content: "Page " counter(page) " sur " counter(pages);
        font-size: 10pt;
        color: #666;
      }
    }
    body { 
      font-family: 'Arial', sans-serif; 
      color: #333; 
      background: #fff; 
      margin: 0; 
      padding: 0; 
      font-size: 11pt; 
      line-height: 1.4;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 3px solid #00a8cc;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-left: 20px;
      margin-top: 10px;
      display: flex;
      align-items: flex-start;
    }
    .logo img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
    
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #00a8cc;
      text-decoration: underline;
      text-decoration-color: #00a8cc;
      text-decoration-thickness: 2px;
    }
    
    .section {
      margin-bottom: 2em;
    }
    
    .section-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 1em;
      font-size: 12pt;
    }
    
    .form-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.8em;
      min-height: 20px;
    }
    
    .form-label {
      font-weight: normal;
      margin-right: 0.5em;
      flex-shrink: 0;
    }
    
    .form-field {
      border-bottom: 1px solid #333;
      padding-bottom: 2px;
      margin-right: 0.5em;
      min-width: 150px;
      flex-grow: 1;
    }
    
    .form-field.short {
      min-width: 80px;
      flex-grow: 0;
    }
    
    .form-field.medium {
      min-width: 120px;
      flex-grow: 0;
    }
    
    .content-section {
      margin-top: 2em;
    }
    
    .content-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 1em;
      text-decoration: underline;
    }
    
    .content-text {
      text-align: justify;
      line-height: 1.6;
      margin-bottom: 1em;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 3em;
      page-break-inside: avoid;
    }
    
    .signature-block {
      width: 45%;
      text-align: center;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 3em;
      width: 80%;
      margin-left: auto;
      margin-right: auto;
    }
    
    .signature-label {
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    
    .date-location {
      text-align: right;
      margin-top: 2em;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <img src="${logoSrc}" alt="Logo AfriVago" />
      </div>
    </div>
    <div class="title">Contrat de prestation de services</div>
  </div>

  <div class="section">
    <div class="section-title">Entre les soussignés :</div>
    
    <div class="form-row">
      <span class="form-label">La société</span>
      <span class="form-field">AfriVago</span>
      <span class="form-label">immatriculée au Registre du Commerce et des Sociétés de</span>
    </div>
    
    <div class="form-row">
      <span class="form-field">Cotonou</span>
      <span class="form-label">sous le numéro</span>
      <span class="form-field medium">009547874</span>
      <span class="form-label">dont le siège social est</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">situé au</span>
      <span class="form-field">Cotonou, Bénin</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">ci-après dénommée « la Client »,</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">et</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">La société</span>
      <span class="form-field">Prestataire</span>
      <span class="form-label">immatriculée au Registre du Commerce et des Sociétés de</span>
    </div>
    
    <div class="form-row">
      <span class="form-field">Ville</span>
      <span class="form-label">sous le numéro</span>
      <span class="form-field medium">009547874</span>
      <span class="form-label">dont le siège social est</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">situé au</span>
      <span class="form-field">Adresse complète</span>
      <span class="form-label">représentée par M.</span>
      <span class="form-field medium">${contrat.locataire_nom || ''} ${contrat.locataire_prenom || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">ci-après dénommée « le Prestataire de services » ou « la Prestataire »,</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">d'autre part,</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Il a été convenu ce qui suit</span>
    </div>
  </div>

  <div class="content-section">
    <div class="content-title">Article premier - Objet</div>
    
    <div class="content-text">
      Le présent contrat a pour objet la prestation de services de location du logement suivant :
    </div>
    
    <div class="form-row">
      <span class="form-label">Logement :</span>
      <span class="form-field">${contrat.logement_nom || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Adresse :</span>
      <span class="form-field">${contrat.logement_adresse || ''}</span>
    </div>
    
    <div class="form-row">
      <span class="form-label">Surface :</span>
      <span class="form-field short">${contrat.superficie || ''} m²</span>
    </div>
    
    <div class="content-text">
      <strong>Période de location :</strong><br>
      Du ${contrat.date_arrivee ? new Date(contrat.date_arrivee).toLocaleDateString('fr-FR') : '___/___/___'} 
      au ${contrat.date_depart ? new Date(contrat.date_depart).toLocaleDateString('fr-FR') : '___/___/___'}
    </div>
    
    <div class="content-text">
      <strong>Loyer mensuel :</strong> ${contrat.loyer_mensuel || '_______'} FCFA<br>
      <strong>Caution :</strong> ${contrat.caution || '_______'} FCFA<br>
      <strong>Dépôt de garantie :</strong> ${contrat.caution_payee || '_______'} FCFA
    </div>
    
    <div class="content-text">
      ${contrat.clauses || 'Les conditions générales de location s\'appliquent selon les termes définis dans les conditions générales de la plateforme AfriVago.'}
    </div>
  </div>

  <div class="date-location">
    Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}
  </div>

  <div class="signature-section">
    <div class="signature-block">
      <div class="signature-label">Le Client</div>
      <div class="signature-line"></div>
      <div>AfriVago</div>
    </div>
    <div class="signature-block">
      <div class="signature-label">Le Prestataire</div>
      <div class="signature-line"></div>
      <div>${contrat.locataire_nom || ''} ${contrat.locataire_prenom || ''}</div>
    </div>
  </div>
</body>
</html>`;
    }

    // 3. Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 4. Sauvegarder le PDF
    const pdfDir = path.join(process.cwd(), 'public', 'uploads', 'contracts');
    await fs.mkdir(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, `${contratId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    // 5. Mettre à jour la colonne pdf_url
    const pdfUrl = `/uploads/contracts/${contratId}.pdf`;
    await pool.query(
      `UPDATE contrats_locatifs SET pdf_url = $1 WHERE id = $2`,
      [pdfUrl, contratId]
    );

    // 6. Retourner le lien du PDF
    return res.status(200).json({ pdfUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
}