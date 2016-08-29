export class Pharmacie {
  _id: string;        // Numéro d'établissement utilisé comme id.
  rs: string;         // Raison sociale
  numvoie: string;    // Numéro de la voie
  typvoie: string;    // Type de voie
  voie: string;       // Nom de la voie
  cpville: string;    // Code Postal + Ville
  telephone: string;  // Numéro de téléphone
  fax: string;        // Numéro de fax
  loc: Array<number>; // Coordonnées Géographiques
  opinions: any; // Avis sur la pharmacie
  hours: Array<any>;  // Horaire d'ouverture de la pharmacie
  rate: number;       // Note moyenne de la pharmacie
  isFavorite: boolean; // Booléen indiquant si la pharmacie est favorite de l'utilisateur
  favoriteIcon: string;// Nom de l'icone favoris
  distance: number;   // Distance de la pharmacie par rapport à un point donnée (en mètre)
}
