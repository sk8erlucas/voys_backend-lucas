module.exports = {
    apps: [
      {
        name: 'Voys API',
        script: 'dist/src/main.js',
        instances: 'max',
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '1G'
      },
    ],
  };