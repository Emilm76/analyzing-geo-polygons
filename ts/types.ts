export interface Polygon {
  type: "Feature"
  properties: {
    inUganda?: boolean
    sizeOutsideUgandaM2?: number | BigInt
    sizeOutsideUgandaPercent?: string
    intersectRoads?: boolean
    distanceToMainRoadKm?: number
    intersectForest?: boolean
    intersectForestM2?: number | BigInt
    intersectForestPercent?: string
    label?: string
    name?: string
  }
  geometry: {
    coordinates: [[[number]]]
    type:
      | "Point"
      | "Polygon"
      | "MultiPolygon"
      | "MultiLineString"
      | "LineString"
  }
  id: string | number
  geometry_name?: string
}
export interface Fix {
  props: {
    isFixedPoints?: boolean
    fixedPoints?: number
    isFixedKinks?: boolean
  }
  coords: [[number]]
}

export interface PointsInfo {
  selfIntersect: boolean
  pointsDistanceMin: number
  pointsDistanceMax: number
  pointsDistanceAverage: number
}

export type SizeOut =
  | false
  | {
      sizeOutsideUgandaM2: number | BigInt
      sizeOutsideUgandaPercent: string
    }
export type IntersectForest =
  | false
  | {
      intersectForest?: boolean
      intersectForestM2?: number | BigInt
      intersectForestPercent?: string
    }
export type IntersectPol =
  | false
  | {
      intersectPolygon?: boolean
      intersectPolygonNames?: [string?]
      intersectMoreFivePercent?: [string?]
      intersectPolygonM2?: number | BigInt
      intersectPolygonPercent?: string
    }

export interface CsvObj {
  header: { id: string; title: string }[]
  records: { [string: string]: any }[]
}
