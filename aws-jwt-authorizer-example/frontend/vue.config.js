module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://j7m8bn25ud.execute-api.eu-central-1.amazonaws.com',
                changeOrigin: true
            },
        }
    }
}