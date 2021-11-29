module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://nefyt675s4.execute-api.eu-central-1.amazonaws.com/',
                changeOrigin: true
            },
        }
    }
}