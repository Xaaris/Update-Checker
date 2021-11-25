module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://42p84bzsld.execute-api.eu-central-1.amazonaws.com/',
                changeOrigin: true
            },
        }
    }
}