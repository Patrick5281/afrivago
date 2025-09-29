
export async function getAllProperties(filters?: { propertyTypeId?: string }): Promise<PropertyDetails[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_types (name),
      countries (name),
      property_images (url),
      property_videos (url),
      property_terms (*),
      property_pricing (*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters?.propertyTypeId) {
    query = query.eq('property_type_id', filters.propertyTypeId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Erreur lors de la récupération des propriétés: ${error.message}`);
  return data;
}