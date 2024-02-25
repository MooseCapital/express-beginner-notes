module.exports = {
    apps: [{
        name: "app-worker",
        script: "./bin/www",
        instances: 0,
        port: "3000",
        watch_delay: 5000,
        exec_mode: "cluster",
        env_production: {
            NODE_ENV: "production"
        },
        pm2_server_monit: false,

    }, {
        name: "app-master",
        script: "./app-master.js",
        instances: 1,
        port: "3000",
        exec_mode: "cluster",
        watch_delay: 5000,
        pm2_server_monit: false,
        env_production: {
            NODE_ENV: "production"
        }
    },]
}
