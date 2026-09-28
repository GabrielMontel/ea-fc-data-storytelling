// js/utils.js

/**
 * Convertit une valeur en nombre entier, ou retourne 0 si invalide
 */
function parseNumber(val) {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
}