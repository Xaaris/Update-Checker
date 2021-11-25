'use strict';

const AWS = require('aws-sdk');
const {getProductsByProvider, updateProduct} = require("./products")

const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION
const SNS_TOPIC_ARN = process.env.SNS_PRODUCT_UPDATE_TOPIC_ARN
const SNS = new AWS.SNS({region: AWS_DEPLOY_REGION})

module.exports.refresh = async (event, context) => {

    const [localProduct] = await getProductsByProvider('ikea');
    console.log(localProduct)
    const latestVersion = await getLatestIkeaTradfriGatewayVersion()
    console.log(latestVersion)
    if (isNewVersion(localProduct, latestVersion)) {
        latestVersion.id = localProduct.id
        latestVersion.currentVersion = buildFullVersion(latestVersion)
        await updateProduct(latestVersion)
        const message = {}
        message.productId = latestVersion.id
        message.name = localProduct.name
        message.oldVersion = buildFullVersion(localProduct)
        message.newVersion = buildFullVersion(latestVersion)
        message.releaseNotesLink = latestVersion.releaseNotesLink
        await publishMessage(message)
    }
}

function buildFullVersion(product) {
    return `${product.majorVersion}.${product.minorVersion}.${product.bugfixVersion}`
}

function isNewVersion(localProduct, latestVersion) {
    return (!localProduct.majorVersion || !localProduct.minorVersion || !localProduct.bugfixVersion
        || latestVersion.majorVersion > localProduct.majorVersion
        || latestVersion.minorVersion > localProduct.minorVersion
        || latestVersion.bugfixVersion > localProduct.bugfixVersion)
}

async function getLatestIkeaTradfriGatewayVersion() {
    const {default: fetch} = await import('node-fetch')
    const response = await fetch('http://fw.ota.homesmart.ikea.net/feed/version_info.json')
    if (response.ok) {
        let data = await response.json();
        let objOfInterest = data.find(it => it.fw_type === 0);
        if (!objOfInterest) {
            throw new Error('Failed to find ikea product version info')
        }
        let versionInfo = {}
        versionInfo.majorVersion = objOfInterest.fw_major_version
        versionInfo.minorVersion = objOfInterest.fw_minor_version
        versionInfo.bugfixVersion = objOfInterest.fw_hotfix_version
        versionInfo.releaseNotesLink = objOfInterest.fw_weblink_relnote
        return versionInfo
    } else {
        throw new Error(`Wrong statusCode: ${response.statusCode}`)
    }
}

async function publishMessage(message) {
    const params = {
        Message: JSON.stringify(message),
        TopicArn: SNS_TOPIC_ARN
    }
    console.log(`publishing event ${JSON.stringify(params)}`)
    return SNS.publish(params).promise()
}
