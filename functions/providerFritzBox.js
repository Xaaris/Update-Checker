'use strict';

const AWS = require('aws-sdk');
const cheerio = require('cheerio')
const {getProductsByProvider, updateProduct} = require("./products")

const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION
const SNS_TOPIC_ARN = process.env.SNS_PRODUCT_UPDATE_TOPIC_ARN
const SNS = new AWS.SNS({region: AWS_DEPLOY_REGION})

module.exports.refresh = async () => {

    const localProducts = await getProductsByProvider('FritzBox');
    console.log(localProducts)
    for (let localProduct of localProducts) {
        let latestVersion = await getLatestFritzBoxVersion(localProduct.name)
        if (isNewVersion(localProduct, latestVersion)) {
            latestVersion.id = localProduct.id
            latestVersion.currentVersion = buildFullVersion(latestVersion)
            latestVersion.bugfixVersion = 0 // TODO: remove this as there is no bugfix version
            await updateProduct(latestVersion)
            let message = {}
            message.productId = latestVersion.id
            message.name = localProduct.name
            message.oldVersion = buildFullVersion(localProduct)
            message.newVersion = buildFullVersion(latestVersion)
            message.releaseNotesLink = latestVersion.releaseNotesLink
            await publishMessage(message)
        }
    }

}

function buildFullVersion(product) {
    return `${product.majorVersion}.${product.minorVersion}`
}

function isNewVersion(localProduct, latestVersion) {
    return (!localProduct.majorVersion || !localProduct.minorVersion
        || latestVersion.majorVersion > localProduct.majorVersion
        || latestVersion.minorVersion > localProduct.minorVersion)
}

async function getLatestFritzBoxVersion(productName) {
    let url = `https://download.avm.de/fritzbox/${escapeProductName(productName)}/deutschland/fritz.os/`;
    console.log(url)
    const {default: fetch} = await import('node-fetch')
    const response = await fetch(url)
    let versionInfo = {}
    if (response.ok) {
        const body = await response.text()
        let $ = cheerio.load(body)
        $('a').each(function (index, element) {
            let text = $(element).text();
            console.log(`element: ${text}`)
            if (text.includes(".image")) {
                let version = text.substring(text.indexOf("-") + 1, text.indexOf(".image"));
                console.log(version)
                versionInfo.majorVersion = parseInt(version.split(".")[0])
                versionInfo.minorVersion = parseInt(version.split(".")[1])
                versionInfo.releaseNotesLink = url + "info_de.txt"
            }
        })
    } else {
        throw new Error(`Wrong statusCode: ${response.statusCode}`)
    }
    console.log(versionInfo)
    return versionInfo
}

function escapeProductName(productName) {
    return productName.replace(/!/g, "").replace(/\s/g, "-").toLowerCase()
}

async function publishMessage(message) {
    const params = {
        Message: JSON.stringify(message),
        TopicArn: SNS_TOPIC_ARN
    }
    console.log(`publishing event ${JSON.stringify(params)}`)
    return SNS.publish(params).promise()
}

console.log(escapeProductName("FRITZ!Box 3333 AX"))