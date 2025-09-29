
/**
 * Récupère le nom d'un utilisateur à partir de son id
 */
export async function getUserNameById(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();
  if (error || !data) throw new Error("Impossible de récupérer le nom de l'utilisateur");
  return data.name;
}

/**
 * Récupère le titre d'une propriété à partir de son id
 */
export async function getPropertyTitleById(propertyId: string): Promise<string> {
  const { data, error } = await supabase
    .from('properties')
    .select('title')
    .eq('id', propertyId)
    .single();
  if (error || !data) throw new Error("Impossible de récupérer le titre de la propriété");
  return data.title;
}

/**
 * Upload une liste de fichiers dans le bucket Supabase et enregistre les URLs dans la table room_photos
 * @param roomId l'id de la pièce
 * @param propertyId l'id de la propriété
 * @param propertyTitle le titre de la propriété
 * @param userId l'id de l'utilisateur
 * @param userName le nom de l'utilisateur
 * @param files tableau de fichiers (File[])
 * @returns tableau des URLs uploadées
 */
export async function uploadRoomPhotos(
  roomId: string,
  propertyId: string,
  propertyTitle: string,
  userId: string,
  userName: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];
  // Sécurisation des noms
  if (!userName) throw new Error("Le nom d'utilisateur est manquant pour l'upload de la photo de pièce.");
  if (!propertyTitle) throw new Error("Le titre de la propriété est manquant pour l'upload de la photo de pièce.");
  const safeUserName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePropertyTitle = propertyTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `owner/${userId}-${safeUserName}/${propertyId}-${safePropertyTitle}/${roomId}/${fileName}`;

    // Upload dans le bucket
    const { error: uploadError } = await supabase.storage
      .from('piece-photos')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    // Récupérer l'URL publique
    const { publicUrl } = supabase.storage.from('piece-photos').getPublicUrl(filePath).data;
    urls.push(publicUrl);

    // Insérer dans la table room_photos
    const { error: dbError } = await supabase
      .from('room_photos')
      .insert([{ room_id: roomId, url: publicUrl }]);
    if (dbError) throw dbError;
  }
  return urls;
} 