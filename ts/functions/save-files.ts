import { createObjectCsvWriter } from "csv-writer"
import { existsSync, writeFileSync } from "fs"
import { mkdir } from "fs/promises"
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

export async function saveCsvFiles(arr: Polygon[], path: string) {
  await createFolder(path)

  arr.forEach((obj) => {
    let flName = `Polygon ${obj.properties.label}.csv`
    const csvObj: CsvObj = { header: [], records: [{}] }

    for (const key in obj.properties) {
      const prop = obj.properties[key as keyof typeof obj.properties]
      csvObj.header.push({ id: key, title: key })
      csvObj.records[0][key] = prop
    }

    createCsv(path + flName, csvObj)
  })
  console.log("Create CSV files")
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
