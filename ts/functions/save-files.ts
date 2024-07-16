import { createObjectCsvWriter } from "csv-writer"
import { existsSync, writeFileSync } from "fs"
import { mkdir } from "fs/promises"
import { POLYGON_PROPS } from "../constants"
import { CsvObj, Polygon } from "../types"

export async function saveJsonFile(
  path: string,
  name: string,
  data: { [prop: string]: any }
) {
  await createFolder(path)
  writeFileSync(path + name, JSON.stringify(data))
  console.log("Create file: " + name)
}

export async function saveCsvFile(arr: Polygon[], path: string, name: string) {
  await createFolder(path)
  const isHeader: { [header: string]: boolean } = {}
  const csvObj: CsvObj = {
    header: [{ id: "POLYGON_NAME", title: "" }],
    records: [],
  }
  // Create headers
  POLYGON_PROPS.forEach((prop) => {
    csvObj.header.push({ id: prop, title: prop })
    isHeader[prop] = false
  })

  // For each polygon
  arr.forEach((obj, i) => {
    const props = obj.properties
    csvObj.records.push({ POLYGON_NAME: "Polygon - " + props.label })

    // For each properties
    POLYGON_PROPS.forEach((key) => {
      if (Object.keys(props).indexOf(key) > -1) {
        csvObj.records[i][key] = props[key as keyof typeof props]
        isHeader[key] = true
      }
    })
  })

  // Remove empty header from csvObj
  for (const key in isHeader) {
    if (isHeader[key]) continue
    const delIndex = csvObj.header.findIndex((obj) => {
      return obj.id === key
    })
    csvObj.header.splice(delIndex, 1)
  }

  createCsv(path + name, csvObj)
  console.log("Create file: " + name)
}

function createCsv(path: string, obj: CsvObj) {
  const csvWriter = createObjectCsvWriter({
    path: path,
    header: obj.header,
  })
  const records = obj.records
  csvWriter.writeRecords(records)
}

// Create folder if it doesn't exist
async function createFolder(path: string) {
  if (existsSync(path)) return
  await mkdir(path)
}
