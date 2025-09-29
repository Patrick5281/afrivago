import { NextResponse } from 'next/server';
import { propertyService } from '@/api/property';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const updates = await request.json();
    console.log('[DEBUG] Appel API property/[id] avec id:', id, 'et méthode: PUT');
    
    const updatedProperty = await propertyService.updateProperty(id, updates);
    console.log('[DEBUG] Propriété mise à jour (API):', updatedProperty);
    
    if (!updatedProperty) {
      return NextResponse.json(
        { error: 'Propriété non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('[DEBUG] Erreur lors de la mise à jour de la propriété:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
} 