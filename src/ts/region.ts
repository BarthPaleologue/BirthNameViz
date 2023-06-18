/**
 * A type to represent the different regions in France
 */
export type Region = "Auvergne-Rhône-Alpes" | "Bourgogne-Franche-Comté" | "Bretagne" | "Centre-Val de Loire" | "Corse" | "Grand Est" | "Hauts-de-France" | "Île-de-France" | "Normandie" | "Nouvelle-Aquitaine" | "Occitanie" | "Pays de la Loire" | "Provence-Alpes-Côte d'Azur" | "Guadeloupe" | "Martinique" | "Guyane" | "La Réunion" | "Mayotte";

export function getRegionFromDepartement(departement: number): Region {
    switch (departement) {
        case 1:
        case 3:
        case 7:
        case 15:
        case 26:
        case 38:
        case 42:
        case 43:
        case 63:
        case 69:
        case 73:
        case 74:
            return "Auvergne-Rhône-Alpes";
        case 21:
        case 25:
        case 39:
        case 58:
        case 70:
        case 71:
        case 89:
        case 90:
            return "Bourgogne-Franche-Comté";
        case 22:
        case 29:
        case 35:
        case 56:
            return "Bretagne";
        case 18:
        case 28:
        case 36:
        case 37:
        case 41:
        case 45:
            return "Centre-Val de Loire";
        case 2:
        case 59:
        case 60:
        case 62:
            return "Hauts-de-France";
        case 8:
        case 10:
        case 51:
        case 52:
            return "Grand Est";
        case 75:
        case 77:
        case 78:
        case 91:
        case 92:
        case 93:
        case 94:
        case 95:
            return "Île-de-France";
        case 14:
        case 27:
        case 50:
        case 61:
            return "Normandie";
        case 16:
        case 17:
        case 19:
        case 23:
        case 24:
        case 33:
        case 40:
        case 47:
        case 64:
        case 79:
        case 86:
        case 87:
            return "Nouvelle-Aquitaine";
        case 9:
        case 11:
        case 12:
        case 30:
        case 31:
        case 32:
        case 34:
        case 46:
        case 48:
        case 65:
        case 66:
        case 81:
        case 82:
            return "Occitanie";
        case 44:
        case 49:
        case 53:
        case 72:
        case 85:
            return "Pays de la Loire";
        case 4:
        case 5:
        case 6:
        case 13:
        case 83:
        case 84:
            return "Provence-Alpes-Côte d'Azur";
        case 971:
            return "Guadeloupe";
        case 972:
            return "Martinique";
        case 973:
            return "Guyane";
        case 974:
            return "La Réunion";
        case 976:
            return "Mayotte";
        default:
            throw new Error(`Unknown departement ${departement}`);
    }
}