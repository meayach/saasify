# Solution Rapide - Nettoyage Manuel du localStorage

## Problème

Le plan "Plan Growth" (ID: 6890d9f7904708a3fd2c6809) stocké dans localStorage n'existe plus dans l'API.

## Solution Rapide

1. **Ouvrez la console** de votre navigateur (F12)

2. **Exécutez ces commandes** pour nettoyer le localStorage :

```javascript
// Nettoyer tous les plans obsolètes
localStorage.removeItem("selectedPlan");

// Nettoyer les plans spécifiques aux applications
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("appDefaultPlan:")) {
    localStorage.removeItem(key);
    console.log("Supprimé:", key);
  }
});

console.log("✅ localStorage nettoyé");
```

3. **Rechargez la page** (F5)

4. **Sélectionnez un nouveau plan** :
   - Plan Starter (ID: 68bf66d7df8ea2b4245439ff)
   - Plan Pro (ID: 68bf677bdf8ea2b424543a01)
   - Plan Enterprise (ID: 68bf677bdf8ea2b424543a03)

## Vérification

Après nettoyage, vous devriez voir dans la console :

- `❌ Pas de selectedDefaultPlanId ou pas de plans`
- Plus de messages d'erreur sur le plan obsolète
