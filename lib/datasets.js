const Keyv = require('keyv')
const {omit} = require('lodash')
const {expandCommune, expandCommunes} = require('./expand-communes')
const {sortByNumero} = require('./helpers/sort')

const datasetsDatabase = new Keyv(`sqlite://${process.env.DATASETS_DB_PATH}`)

function getDatasets() {
  return datasetsDatabase.get('datasets')
}

function getReport(datasetId) {
  return datasetsDatabase.get(`${datasetId}-report`)
}

function getData(datasetId) {
  return datasetsDatabase.get(`${datasetId}-data`)
}

async function getSummary(datasetId) {
  const data = await getData(datasetId)
  return {
    ...data,
    communes: await expandCommunes(
      Object.values(data.communes).map(c => omit(c, 'voies'))
    )
  }
}

async function getCommune(datasetId, codeCommune) {
  const data = await getData(datasetId)
  const commune = await expandCommune(data.communes[codeCommune])
  return {...commune, voies: Object.values(commune.voies).map(v => omit(v, 'numeros'))}
}

async function getVoie(datasetId, codeCommune, codeVoie) {
  const data = await getData(datasetId)
  const voie = data.communes[codeCommune].voies[codeVoie]
  if (voie.numeros) {
    return {...voie, numeros: sortByNumero(Object.values(voie.numeros))}
  }
  return voie
}

module.exports = {getDatasets, getReport, getSummary, getCommune, getVoie}