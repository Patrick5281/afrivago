# Diagnostic - Problème d'affichage des données dans l'accueil

## Problème
Les données ne s'affichent pas dans l'interface d'accueil malgré la présence de données dans la base.

## Logs ajoutés pour le diagnostic

### 1. Dans AccueilContainer
- Log du début du chargement
- Log de la réponse API (status)
- Log des données reçues
- Log de la structure des données
- Log des erreurs éventuelles

### 2. Dans AccueilView
- Log des props reçues
- Log des données transformées
- Log des données envoyées aux composants

### 3. Dans l'API loyers-caution
- Log de la session utilisateur
- Log du userId
- Log du nombre de contrats trouvés
- Log du traitement de chaque contrat
- Log du nombre de loyers par contrat
- Log de la réponse finale

### 4. Dans les composants
- ProchainLoyer : Log des loyers reçus
- LogementsReserves : Gestion des données vides
- LoyersRecents : Gestion des données vides

## Étapes de diagnostic

### Étape 1 : Vérifier la console
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet Console
3. Rechargez la page d'accueil
4. Recherchez les messages commençant par `[AccueilContainer]`, `[AccueilView]`, `[API Loyers-Caution]`

### Étape 2 : Vérifier les données
Les logs vous diront :
- Si l'API est appelée
- Si l'utilisateur est authentifié
- Combien de contrats sont trouvés
- Combien de loyers sont trouvés
- Quelle est la structure des données

### Étape 3 : Problèmes possibles

#### A. Aucune session utilisateur
**Symptôme** : `[API Loyers-Caution] Utilisateur non authentifié`
**Solution** : Vérifier que l'utilisateur est connecté

#### B. Aucun contrat trouvé
**Symptôme** : `[API Loyers-Caution] Contrats trouvés: 0`
**Solution** : Vérifier la table `contrats_locatifs` pour l'utilisateur

#### C. Aucun loyer trouvé
**Symptôme** : `[API Loyers-Caution] Loyers trouvés pour contrat X: 0`
**Solution** : Vérifier la table `loyers` pour les contrats

#### D. Erreur de base de données
**Symptôme** : `[API Loyers-Caution] Erreur: ...`
**Solution** : Vérifier la connexion à la base de données

#### E. Données mal formatées
**Symptôme** : Données reçues mais pas affichées
**Solution** : Vérifier la transformation des données dans AccueilView

## Corrections apportées

1. **Transformation des données** : Les données de l'API sont maintenant transformées pour correspondre aux interfaces attendues par les composants
2. **Gestion des données vides** : Chaque composant gère maintenant le cas où aucune donnée n'est disponible
3. **Logs détaillés** : Ajout de logs à chaque étape pour faciliter le diagnostic

## Prochaines étapes

1. **Consulter les logs** dans la console
2. **Identifier le problème** selon les symptômes ci-dessus
3. **Corriger le problème** selon la solution correspondante
4. **Supprimer les logs** une fois le problème résolu (optionnel)

## Exemple de logs attendus

```
[AccueilContainer] Début du chargement des données...
[AccueilContainer] Réponse API reçue, status: 200
[AccueilContainer] Données reçues de l'API: {logements: [...], prochainsLoyers: [...]}
[API Loyers-Caution] Début de la requête
[API Loyers-Caution] Session récupérée: OK
[API Loyers-Caution] UserId: 123
[API Loyers-Caution] Contrats trouvés: 2
[AccueilView] Rendu avec les props: {logements: [...], prochainsLoyers: [...]}
[ProchainLoyer] loyers reçus: [...] 