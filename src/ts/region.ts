/**
 * A type to represent the different regions in France
 */
export enum RegionName {
    Auvergne,
    RhôneAlpes,
    Bourgogne,
    FrancheComte,
    Bretagne,
    Centre,
    Corse,
    IledeFrance,
    LanguedocRoussillon,
    Limousin,
    Lorraine,
    MidiPyrénées,
    NordPasDeCalais,
    BasseNormandie,
    HauteNormandie,
    PaysDeLaLoire,
    Picardie,
    PoitouCharentes,
    ProvenceAlpesCôteDAzur,
    Alsace,
    Aquitaine,
    ChampagneArdenne,
    Guadeloupe,
    Martinique,
    Guyane,
    LaRéunion,
    Mayotte
};

export function parseRegionName(regionName: string): RegionName {
    switch (regionName) {
        case "Auvergne":
            return RegionName.Auvergne;
        case "Rhône-Alpes":
            return RegionName.RhôneAlpes;
        case "Bourgogne":
            return RegionName.Bourgogne;
        case "Franche-Comté":
            return RegionName.FrancheComte;
        case "Bretagne":
            return RegionName.Bretagne;
        case "Centre":
            return RegionName.Centre;
        case "Corse":
            return RegionName.Corse;
        case "Île-de-France":
            return RegionName.IledeFrance;
        case "Languedoc-Roussillon":
            return RegionName.LanguedocRoussillon;
        case "Limousin":
            return RegionName.Limousin;
        case "Lorraine":
            return RegionName.Lorraine;
        case "Midi-Pyrénées":
            return RegionName.MidiPyrénées;
        case "Nord-Pas-de-Calais":
            return RegionName.NordPasDeCalais;
        case "Basse-Normandie":
            return RegionName.BasseNormandie;
        case "Haute-Normandie":
            return RegionName.HauteNormandie;
        case "Pays de la Loire":
            return RegionName.PaysDeLaLoire;
        case "Picardie":
            return RegionName.Picardie;
        case "Poitou-Charentes":
            return RegionName.PoitouCharentes;
        case "Provence-Alpes-Côte d'Azur":
            return RegionName.ProvenceAlpesCôteDAzur;
        case "Alsace":
            return RegionName.Alsace;
        case "Aquitaine":
            return RegionName.Aquitaine;
        case "Champagne-Ardenne":
            return RegionName.ChampagneArdenne;
        case "Guadeloupe":
            return RegionName.Guadeloupe;
        case "Martinique":
            return RegionName.Martinique;
        case "Guyane":
            return RegionName.Guyane;
        case "La Réunion":
            return RegionName.LaRéunion;
        case "Mayotte":
            return RegionName.Mayotte;
        default:
            throw new Error(`Unknown region name: ${regionName}`);
    }
}

export function getRegionFromDepartement(departement: number): RegionName {
    switch (departement) {
        case 1:
        case 7:
        case 26:
        case 38:
        case 42:
        case 69:
        case 73:
        case 74:
            return RegionName.RhôneAlpes;
        case 2:
        case 8:
        case 10:
        case 51:
        case 52:
            return RegionName.ChampagneArdenne;
        case 3:
        case 15:
        case 43:
        case 63:
            return RegionName.Auvergne;
        case 4:
        case 5:
        case 6:
        case 13:
        case 83:
        case 84:
            return RegionName.ProvenceAlpesCôteDAzur;
        case 11:
        case 30:
        case 34:
        case 48:
        case 66:
            return RegionName.LanguedocRoussillon;
        case 9:
        case 12:
        case 31:
        case 32:
        case 46:
        case 65:
        case 81:
        case 82:
            return RegionName.MidiPyrénées;
        case 14:
        case 27:
        case 50:
        case 61:
            return RegionName.BasseNormandie;
        case 16:
        case 17:
        case 79:
        case 86:
            return RegionName.PoitouCharentes;
        case 18:
        case 28:
        case 36:
        case 37:
        case 41:
        case 45:
            return RegionName.Centre;
        case 19:
        case 23:
        case 87:
            return RegionName.Limousin;
        case 20:
            return RegionName.Corse;
        case 21:
        case 89:
        case 58:
        case 71:
            return RegionName.Bourgogne;
        case 25:
        case 39:
        case 70:
        case 90:
            return RegionName.FrancheComte;
        case 22:
        case 29:
        case 35:
        case 56:
            return RegionName.Bretagne;
        case 24:
        case 33:
        case 40:
        case 47:
        case 64:
            return RegionName.Aquitaine;
        case 44:
        case 49:
        case 53:
        case 72:
        case 85:
            return RegionName.PaysDeLaLoire;
        case 54:
        case 55:
        case 57:
        case 88:
            return RegionName.Lorraine;
        case 59:
        case 62:
            return RegionName.NordPasDeCalais;
        case 60:
        case 80:
            return RegionName.Picardie;
        case 67:
        case 68:
            return RegionName.Alsace;
        case 75:
        case 77:
        case 78:
        case 91:
        case 92:
        case 93:
        case 94:
        case 95:
            return RegionName.IledeFrance;
        case 76:
            return RegionName.HauteNormandie;
        case 971:
            return RegionName.Guadeloupe;
        case 972:
            return RegionName.Martinique;
        case 973:
            return RegionName.Guyane;
        case 974:
            return RegionName.LaRéunion;
        case 976:
            return RegionName.Mayotte;
        default:
            throw new Error(`Unknown departement: ${departement}`);

    }
}