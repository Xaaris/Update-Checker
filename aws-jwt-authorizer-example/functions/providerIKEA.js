'use strict';

async function getLatestIkeaTradfriGatewayVersion() {
    const {default: fetch} = await import('node-fetch')
    const response = await fetch('http://fw.ota.homesmart.ikea.net/feed/version_info.json')
    if (response.ok) {
        let data = await response.json();
        let objOfInterest = data.find(it => it.fw_type === 0);
        let versionInfo = {}
        versionInfo.majorVersion = objOfInterest.fw_major_version
        versionInfo.minorVersion = objOfInterest.fw_minor_version
        versionInfo.bugfixVersion = objOfInterest.fw_hotfix_version
        versionInfo.releasenotesLink = objOfInterest.fw_weblink_relnote
        console.log(versionInfo)
        return versionInfo
    } else {
        throw new Error(`Wrong statusCode: ${response.statusCode}`)
    }
}
