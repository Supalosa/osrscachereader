export class MapDefinition {
}
export class LocationDefinition {
}
export class EmptyMapDefinition {
}
export default class MapLoader {
    hash(str: any): number;
    load(bytes: any, id: any, rscache: any): MapDefinition | LocationDefinition | EmptyMapDefinition;
    loadLocationDef(bytes: any, defId: any, x: any, y: any): LocationDefinition;
    loadMapDef(bytes: any, defId: any, x: any, y: any): MapDefinition;
}
