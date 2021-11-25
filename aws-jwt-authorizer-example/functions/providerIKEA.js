'use strict';

const {getProductsByProvider, updateProduct} = require("./products")

module.exports.refresh = async (event, context) => {

    const [localProduct] = await getProductsByProvider('ikea');
    console.log(localProduct)
    const latestVersion = await getLatestIkeaTradfriGatewayVersion()
    console.log(latestVersion)
    if (isNewVersion(localProduct, latestVersion)) {
        latestVersion.id = localProduct.id
        await updateProduct(latestVersion)
        console.log("Updated product, should now notify user")
    //    notify user
    }

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
