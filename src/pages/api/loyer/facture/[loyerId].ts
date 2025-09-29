import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    responseLimit: false,
  },
};

// Fonction pour formater les montants correctement
function formatMontant(montant: number): string {
  // S'assurer que c'est un nombre et enlever les décimales si nécessaire
  const num = Number(montant) || 0;
  // Utiliser une approche plus robuste pour le formatage
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { loyerId } = req.query;
  if (!loyerId) {
    return res.status(400).json({ message: 'Paramètre loyerId manquant' });
  }

  // --- 1. Récupération des données ---
  const loyerRes = await query('SELECT * FROM loyers WHERE id = $1', [loyerId]);
  const loyer = loyerRes.rows[0];
  if (!loyer) return res.status(404).json({ message: 'Loyer introuvable' });

  const contratRes = await query('SELECT * FROM contrats_locatifs WHERE id = $1', [loyer.contrat_locatif_id]);
  const contrat = contratRes.rows[0];
  if (!contrat) return res.status(404).json({ message: 'Contrat introuvable' });

  const paiementRes = await query(
    `SELECT * FROM paiements WHERE reservation_id = $1 AND type = 'monthly' AND period = $2 AND status = 'completed' ORDER BY created_at DESC LIMIT 1`,
    [contrat.reservation_id, loyer.date_debut]
  );
  const paiement = paiementRes.rows[0];
  if (!paiement) return res.status(404).json({ message: 'Paiement introuvable' });

  const userRes = await query('SELECT * FROM users WHERE id = $1', [contrat.locataire_id]);
  const user = userRes.rows[0];

  // --- 2. Création du PDF ---
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  let buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=facture-${loyerId}.pdf`);
    res.send(pdfData);
  });

  // --- 3. Design de la facture (exactement comme l'image) ---
  
  // Logo en haut à gauche
  const logoPath = path.join(process.cwd(), 'public', 'assets', 'images', 'logo-white.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 50, { width: 160, height: 60 });
  }

  // Titre "INVOICE" en haut à droite
  doc.fontSize(28).fillColor('#1D1D1D').font('Helvetica-Bold').text('FACTURE', 400, 50, { align: 'right' });
  doc.fontSize(11).fillColor('#808080').font('Helvetica').text(`${new Date().toLocaleDateString('fr-FR')}`, 400, 85, { align: 'right' });

  // Informations de l'entreprise (à gauche)
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold').text('Office Address', 50, 130);
  doc.fontSize(9).fillColor('#808080').font('Helvetica')
    .text('AfriVago', 50, 145)
    .text('Plateforme de location', 50, 158)
    .text('Cotonou, Benin', 50, 171)
    .text('(+229) XX XX XX XX', 50, 184);

  // Numéro de facture
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold').text('Invoice Number', 50, 210);
  doc.fontSize(9).fillColor('#0072ff').font('Helvetica').text(`INV.${loyer.id}`, 50, 225);

  // Informations client (à droite)
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold').text('To:', 400, 130);
  doc.fontSize(9).fillColor('#808080').font('Helvetica')
    .text(`${user.name} ${user.surname}`, 400, 145)
    .text(user.email, 400, 158)
    .text(user.telephone || 'N/A', 400, 171)
    .text(user.adresse || 'N/A', 400, 184);

  // Total due (à droite)
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold').text('Total Due :', 400, 210);
  const totalDue = Number(loyer.montant) + Number(loyer.frais || 0);
  doc.fontSize(14).fillColor('#004499').font('Helvetica-Bold').text(formatMontant(totalDue), 400, 225);

  // Tableau des items
  let tableY = 280;
  
  // En-tête du tableau avec fond gris
  doc.rect(50, tableY, 495, 25).fillColor('#f2f2f2').fill();
  
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold')
    .text('ITEM DESCRIPTION', 60, tableY + 8)
    .text('UNIT PRICE', 280, tableY + 8)
    .text('QTY', 380, tableY + 8)
    .text('TOTAL', 480, tableY + 8);

  tableY += 25;

  // Ligne de séparation
  doc.rect(50, tableY, 495, 1).fillColor('#e5e5e5').fill();
  tableY += 1;

  // Items du tableau
  const montantLoyer = Number(loyer.montant) || 0;
  const fraisService = Number(loyer.frais) || 0;
  
  const items = [
    { 
      description: `Loyer du ${new Date(loyer.date_debut).toLocaleDateString('fr-FR')} au ${new Date(loyer.date_fin).toLocaleDateString('fr-FR')}`, 
      unitPrice: montantLoyer,
      qty: 1,
      total: montantLoyer 
    },
    { 
      description: 'Frais de service', 
      unitPrice: fraisService,
      qty: 1,
      total: fraisService
    }
  ];

  items.forEach((item, index) => {
    if (item.total > 0) { // Ne pas afficher les lignes avec montant 0
      tableY += 15;
      doc.fontSize(9).fillColor('#1D1D1D').font('Helvetica')
        .text(item.description, 60, tableY, { width: 200 })
        .text(formatMontant(item.unitPrice), 280, tableY)
        .text(item.qty.toString(), 380, tableY)
        .text(formatMontant(item.total), 480, tableY);
      tableY += 15;
    }
  });

  // Section des totaux (à droite)
  const totalsX = 350;
  tableY += 30;

  // Ligne de séparation avant totaux
  doc.rect(totalsX, tableY, 195, 1).fillColor('#e5e5e5').fill();
  tableY += 10;

  // Sous-total
  const subtotal = montantLoyer + fraisService;
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica')
    .text('SUBTOTAL', totalsX, tableY)
    .text(formatMontant(subtotal), 480, tableY);
  tableY += 20;

  // Tax (0% pour cet exemple)
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica')
    .text('Tax VAT 0%', totalsX, tableY)
    .text('0 FCFA', 480, tableY);
  tableY += 20;

  // Discount (0% pour cet exemple)
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica')
    .text('DISCOUNT 0%', totalsX, tableY)
    .text('0 FCFA', 480, tableY);
  tableY += 20;

  // Total final avec fond coloré


  // Informations de paiement (en bas)
  tableY += 60;
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold').text('Payment Method', 50, tableY);
  doc.fontSize(9).fillColor('#808080').font('Helvetica')
    .text('kkiapay', 50, tableY + 15)
    .text('support@afrivago.com', 50, tableY + 30);

  // Termes et conditions
  doc.fontSize(10).fillColor('#1D1D1D').font('Helvetica-Bold').text('Terms & Conditions', 300, tableY);
  doc.fontSize(9).fillColor('#808080').font('Helvetica')
    .text('Merci pour votre confiance.', 300, tableY + 15)
    .text('Contact : support@afrivago.com', 300, tableY + 30);

  // Finalisation
  doc.end();
} 